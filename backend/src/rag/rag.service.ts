import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { ScraperService } from './scraper.service';
import { VectorService, SearchResult } from './vector.service';
import { ScrapedContent, DocumentChunk } from './dto';

@Injectable()
export class RagService implements OnModuleInit {
  constructor(
    private embeddingService: EmbeddingService,
    private scraperService: ScraperService,
    private vectorService: VectorService,
  ) {}

  async onModuleInit() {
    // Initialize Pinecone and educational content on startup
    await this.vectorService.initializeIndex();
    await this.initializeWithEducationalContent();
  }

  async searchSimilarDocuments(
    query: string,
    limit: number = 5,
    threshold: number = 0.5
  ): Promise<SearchResult[]> {
    try {
      // Create embedding for the query
      const queryEmbedding = await this.embeddingService.createEmbedding(query);

      // Search for similar documents in Pinecone
      const results = await this.vectorService.searchSimilar(queryEmbedding, limit);

      // Filter by threshold (Pinecone uses cosine similarity, values 0-1)
      return results.filter(result => result.score >= threshold);

    } catch (error) {
      console.error('Error searching similar documents:', error);
      return [];
    }
  }

  async addDocument(content: ScrapedContent): Promise<void> {
    try {
      // Split content into chunks if it's too long
      const chunks = this.chunkContent(content.content, 1000);

      const documents = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Create embedding for the chunk
        const embedding = await this.embeddingService.createEmbedding(chunk);

        // Prepare document for Pinecone
        documents.push({
          id: `${content.source}-${Date.now()}-${i}`,
          embedding: embedding,
          metadata: {
            content: chunk,
            title: i === 0 ? content.title : `${content.title} (Part ${i + 1})`,
            url: content.url,
            source: content.source,
            publishedAt: content.publishedAt
          }
        });

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Upsert all chunks to Pinecone
      await this.vectorService.upsertDocuments(documents);

    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  async addMultipleDocuments(contents: ScrapedContent[]): Promise<void> {
    for (const content of contents) {
      try {
        await this.addDocument(content);
      } catch (error) {
        console.error(`Error adding document ${content.title}:`, error);
        // Continue with other documents
      }
    }
  }

  async refreshCryptoData(): Promise<void> {
    try {
      console.log('Refreshing crypto data...');

      // Scrape latest crypto news
      const newsContent = await this.scraperService.scrapeLatestCryptoNews(10);
      await this.addMultipleDocuments(newsContent);

      console.log(`Added ${newsContent.length} news articles to knowledge base`);

      // Clean up old data (keep last 30 days)
      await this.vectorService.deleteOldDocuments(30);

    } catch (error) {
      console.error('Error refreshing crypto data:', error);
    }
  }

  async getRelevantContext(query: string, maxTokens: number = 2000): Promise<string> {
    try {
      const searchResults = await this.searchSimilarDocuments(query, 5, 0.3);

      if (searchResults.length === 0) {
        return 'No relevant context found in the knowledge base.';
      }

      let context = 'Relevant information from crypto knowledge base:\n\n';
      let currentTokens = context.length;

      for (const result of searchResults) {
        const resultText = `Source: ${result.source} | Score: ${(result.score * 100).toFixed(1)}%
Title: ${result.title}
Content: ${result.content}

---

`;

        if (currentTokens + resultText.length > maxTokens) {
          break;
        }

        context += resultText;
        currentTokens += resultText.length;
      }

      return context;

    } catch (error) {
      console.error('Error getting relevant context:', error);
      return 'Error retrieving context from knowledge base.';
    }
  }

  private async initializeWithEducationalContent(): Promise<void> {
    try {
      // Check if we already have educational content in Pinecone
      const stats = await this.vectorService.getIndexStats();

      if (stats && stats.totalVectorCount > 0) {
        // Already have content in the index
        console.log(`Pinecone index has ${stats.totalVectorCount} vectors`);
        return;
      }

      console.log('Initializing with educational crypto content...');

      // Add educational content
      const educationalContent = await this.scraperService.scrapeCryptoEducationalContent();
      await this.addMultipleDocuments(educationalContent);

      console.log('Educational content initialized successfully');

    } catch (error) {
      console.error('Error initializing educational content:', error);
    }
  }

  private chunkContent(content: string, chunkSize: number = 1000): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim() + '.');
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence.trim();
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim() + '.');
    }

    return chunks.length > 0 ? chunks : [content];
  }

}