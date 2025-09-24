import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { RagService } from '../rag/rag.service';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

@Injectable()
export class ChatbotService {
  private readonly groqApiKey: string;
  private readonly groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  // Simple in-memory session storage (in production, use Redis or database)
  private sessions = new Map<string, GroqMessage[]>();

  constructor(
    private configService: ConfigService,
    private ragService: RagService
  ) {
    this.groqApiKey = this.configService.get<string>('GROQ_API_KEY');
  }

  async sendMessage(message: string, sessionId?: string): Promise<{ message: string; sessionId: string }> {
    try {
      // Generate session ID if not provided
      if (!sessionId) {
        sessionId = randomUUID();
      }

      // Get or create conversation history
      let conversation = this.sessions.get(sessionId) || [];

      // Add system prompt for first message
      if (conversation.length === 0) {
        // Get relevant context from RAG system
        const ragContext = await this.ragService.getRelevantContext(message, 1500);

        conversation.push({
          role: 'system',
          content: `You are a helpful cryptocurrency expert assistant with access to real-time crypto knowledge. You have deep knowledge about:
- Cryptocurrency fundamentals, trading, and market analysis
- Bitcoin, Ethereum, and other major cryptocurrencies
- DeFi, NFTs, blockchain technology
- Market trends and price analysis
- Risk management and investment strategies

${ragContext}

Please provide helpful, accurate, and up-to-date information about crypto topics. Use the context above when relevant to the user's question. Keep responses concise and informative. When discussing prices or investments, always remind users to do their own research and never provide financial advice.

Current context: You're integrated into a crypto tracking web application where users can monitor their portfolio and cryptocurrency prices.`
        });
      }

      // Add user message
      conversation.push({
        role: 'user',
        content: message
      });

      // Call Groq API
      const response = await axios.post<GroqResponse>(
        this.groqBaseUrl,
        {
          model: 'llama-3.1-70b-versatile',
          messages: conversation,
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const assistantMessage = response.data.choices[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('No response from AI service');
      }

      // Add assistant response to conversation
      conversation.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Store updated conversation (keep last 20 messages to manage memory)
      if (conversation.length > 21) { // 1 system + 20 messages
        conversation = [conversation[0], ...conversation.slice(-20)];
      }
      this.sessions.set(sessionId, conversation);

      return {
        message: assistantMessage,
        sessionId
      };

    } catch (error) {
      console.error('Chatbot service error:', error);

      if (error.response?.status === 401) {
        throw new HttpException(
          'AI service authentication failed',
          HttpStatus.UNAUTHORIZED
        );
      }

      if (error.response?.status === 429) {
        throw new HttpException(
          'AI service rate limit exceeded. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      throw new HttpException(
        'Failed to process message. Please try again.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Clear old sessions periodically (simple cleanup)
  clearOldSessions(): void {
    // Clear sessions older than 1 hour
    // In production, implement proper session management
    if (this.sessions.size > 100) {
      this.sessions.clear();
    }
  }
}