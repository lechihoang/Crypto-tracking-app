import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pinecone } from "@pinecone-database/pinecone";

export interface VectorDocument {
  content: string;
  title: string;
  url: string;
  source: string;
  publishedAt?: Date;
}

export interface SearchResult extends VectorDocument {
  id: string;
  score: number;
}

export interface IndexStats {
  totalVectorCount: number;
  dimension?: number;
  indexFullness?: number;
  namespaces?: Record<string, { recordCount: number }>;
}

@Injectable()
export class VectorService {
  private pinecone: Pinecone;
  private indexName = "crypto-knowledge";

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("PINECONE_API_KEY");

    if (apiKey) {
      this.pinecone = new Pinecone({
        apiKey: apiKey,
      });
    }
  }

  async initializeIndex(): Promise<void> {
    try {
      if (!this.pinecone) {
        console.log("Pinecone not initialized - API key missing");
        return;
      }

      // Check if index exists
      const existingIndexes = await this.pinecone.listIndexes();
      const indexExists = existingIndexes.indexes?.some(
        (index) => index.name === this.indexName,
      );

      if (!indexExists) {
        console.log("Creating Pinecone index...");

        await this.pinecone.createIndex({
          name: this.indexName,
          dimension: 384, // all-MiniLM-L6-v2 dimensions
          metric: "cosine",
          spec: {
            serverless: {
              cloud: "aws",
              region: "us-east-1",
            },
          },
        });

        console.log("Pinecone index created successfully");
      }
    } catch (error: unknown) {
      console.error("Error initializing Pinecone index:", error);
    }
  }

  async upsertDocuments(
    documents: Array<{
      id: string;
      embedding: number[];
      metadata: VectorDocument;
    }>,
  ): Promise<void> {
    try {
      if (!this.pinecone) {
        throw new Error("Pinecone not initialized");
      }

      const index = this.pinecone.index(this.indexName);

      // Upsert vectors in batches of 100 (Pinecone limit)
      const batchSize = 100;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);

        const vectors = batch.map((doc) => ({
          id: doc.id,
          values: doc.embedding,
          metadata: {
            content: doc.metadata.content.substring(0, 40960), // Pinecone metadata limit
            title: doc.metadata.title,
            url: doc.metadata.url,
            source: doc.metadata.source,
            publishedAt:
              doc.metadata.publishedAt?.toISOString() ||
              new Date().toISOString(),
          },
        }));

        await index.upsert(vectors);
        console.log(`Upserted batch ${Math.floor(i / batchSize) + 1}`);
      }
    } catch (error: unknown) {
      console.error("Error upserting documents to Pinecone:", error);
      throw error;
    }
  }

  async searchSimilar(
    queryEmbedding: number[],
    topK: number = 5,
    filter?: Record<string, any>,
  ): Promise<SearchResult[]> {
    try {
      if (!this.pinecone) {
        console.log("Pinecone not initialized, returning empty results");
        return [];
      }

      const index = this.pinecone.index(this.indexName);

      const queryResponse = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: filter,
      });

      const results: SearchResult[] = [];

      if (queryResponse.matches) {
        for (const match of queryResponse.matches) {
          if (match.metadata) {
            results.push({
              id: match.id,
              content: match.metadata.content as string,
              title: match.metadata.title as string,
              url: match.metadata.url as string,
              source: match.metadata.source as string,
              publishedAt: new Date(match.metadata.publishedAt as string),
              score: match.score || 0,
            });
          }
        }
      }

      return results;
    } catch (error: unknown) {
      console.error("Error searching Pinecone:", error);
      return [];
    }
  }

  async deleteBySource(source: string): Promise<number> {
    try {
      if (!this.pinecone) {
        console.log("Pinecone not initialized - cannot delete by source");
        return 0;
      }

      const index = this.pinecone.index(this.indexName);

      // Get count before deletion for logging
      const statsBefore = await this.getIndexStats();
      const countBefore = statsBefore?.totalVectorCount || 0;

      // If index is empty, no need to delete
      if (countBefore === 0) {
        console.log(`No vectors to delete from source: ${source} (index is empty)`);
        return 0;
      }

      // Delete all vectors matching the source
      try {
        await index.deleteMany({
          filter: {
            source: { $eq: source },
          },
        });
      } catch (deleteError: unknown) {
        // Handle 404 error when trying to delete from empty index
        const errorMessage = deleteError instanceof Error ? deleteError.message : String(deleteError);
        if (errorMessage.includes('404')) {
          console.log(`No vectors found for source: ${source} (404 response)`);
          return 0;
        }
        throw deleteError;
      }

      // Get count after deletion
      const statsAfter = await this.getIndexStats();
      const countAfter = statsAfter?.totalVectorCount || 0;

      const deletedCount = countBefore - countAfter;
      console.log(`Deleted ${deletedCount} vectors from source: ${source}`);

      return deletedCount;
    } catch (error: unknown) {
      console.error(`Error deleting vectors by source "${source}":`, error);
      // Don't throw - log and return 0 to allow refresh to continue
      return 0;
    }
  }

  async deleteOldDocuments(daysOld: number = 30): Promise<void> {
    try {
      if (!this.pinecone) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const index = this.pinecone.index(this.indexName);

      // Delete documents older than cutoff date
      await index.deleteMany({
        filter: {
          publishedAt: { $lt: cutoffDate.toISOString() },
        },
      });

      console.log(`Cleaned up documents older than ${daysOld} days`);
    } catch (error: unknown) {
      console.error("Error cleaning up old documents:", error);
    }
  }

  async getIndexStats(): Promise<IndexStats | null> {
    try {
      if (!this.pinecone) return null;

      const index = this.pinecone.index(this.indexName);
      const stats = await index.describeIndexStats();

      return {
        totalVectorCount: stats.totalRecordCount || 0,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness,
        namespaces: stats.namespaces,
      };
    } catch (error: unknown) {
      console.error("Error getting index stats:", error);
      return null;
    }
  }

  async deleteIndex(): Promise<void> {
    try {
      if (!this.pinecone) {
        console.log("Pinecone not initialized - API key missing");
        return;
      }

      const existingIndexes = await this.pinecone.listIndexes();
      const indexExists = existingIndexes.indexes?.some(
        (index) => index.name === this.indexName,
      );

      if (indexExists) {
        console.log(`Deleting Pinecone index: ${this.indexName}...`);
        await this.pinecone.deleteIndex(this.indexName);
        console.log("Pinecone index deleted successfully");
      } else {
        console.log("Index does not exist");
      }
    } catch (error: unknown) {
      console.error("Error deleting Pinecone index:", error);
      throw error;
    }
  }

  async deleteAllVectors(): Promise<void> {
    try {
      if (!this.pinecone) {
        console.log("Pinecone not initialized - API key missing");
        return;
      }

      const index = this.pinecone.index(this.indexName);
      console.log(`Deleting all vectors from index: ${this.indexName}...`);
      await index.deleteAll();
      console.log("All vectors deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting all vectors:", error);
      throw error;
    }
  }
}
