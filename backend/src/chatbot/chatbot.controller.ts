import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SendMessageDto, ChatResponse } from './dto/chat-message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async sendMessage(@Body() body: any): Promise<ChatResponse> {
    // Validate request body
    const validatedData = SendMessageDto.parse(body);

    const result = await this.chatbotService.sendMessage(
      validatedData.message,
      validatedData.sessionId
    );

    return {
      message: result.message,
      sessionId: result.sessionId,
      timestamp: new Date().toISOString(),
    };
  }
}