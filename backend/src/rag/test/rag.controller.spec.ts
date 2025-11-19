import { Test, TestingModule } from "@nestjs/testing";
import { HttpException, HttpStatus } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RagController } from "../rag.controller";
import { RagService } from "../rag.service";
import { VectorService } from "../vector.service";
import { EmbeddingService } from "../embedding.service";
import { ScraperService } from "../scraper.service";
import { RagSchedulerService } from "../rag-scheduler.service";

describe("RagController", () => {
  let controller: RagController;
  let ragService: RagService;
  let vectorService: VectorService;
  let embeddingService: EmbeddingService;
  let scraperService: ScraperService;
  let ragSchedulerService: RagSchedulerService;

  const mockRagService = {
    searchSimilarDocuments: jest.fn(),
    addDocument: jest.fn(),
    addMultipleDocuments: jest.fn(),
    refreshCryptoData: jest.fn(),
  };

  const mockVectorService = {
    initializeIndex: jest.fn(),
    getIndexStats: jest.fn(),
    deleteAllVectors: jest.fn(),
  };

  const mockEmbeddingService = {
    createEmbedding: jest.fn(),
  };

  const mockScraperService = {
    getAllCoinGeckoData: jest.fn(),
  };

  const mockRagSchedulerService = {
    triggerManualRefresh: jest.fn(),
    getRefreshStatus: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [RagController],
      providers: [
        { provide: RagService, useValue: mockRagService },
        { provide: VectorService, useValue: mockVectorService },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: ScraperService, useValue: mockScraperService },
        { provide: RagSchedulerService, useValue: mockRagSchedulerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<RagController>(RagController);
    ragService = module.get<RagService>(RagService);
    vectorService = module.get<VectorService>(VectorService);
    embeddingService = module.get<EmbeddingService>(EmbeddingService);
    scraperService = module.get<ScraperService>(ScraperService);
    ragSchedulerService = module.get<RagSchedulerService>(RagSchedulerService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("POST /rag/search", () => {
    it("should search for similar documents successfully", async () => {
      const mockResults = [
        {
          content: "Bitcoin is a cryptocurrency",
          title: "Bitcoin Guide",
          score: 0.95,
          url: "https://example.com/bitcoin",
        },
      ];

      mockRagService.searchSimilarDocuments.mockResolvedValue(mockResults);

      const result = await controller.search({
        query: "What is Bitcoin?",
        limit: 5,
        threshold: 0.3,
      });

      expect(result).toEqual({
        success: true,
        results: mockResults,
        count: 1,
      });
      expect(ragService.searchSimilarDocuments).toHaveBeenCalledWith(
        "What is Bitcoin?",
        5,
        0.3,
      );
    });

    it("should use default limit and threshold when not provided", async () => {
      mockRagService.searchSimilarDocuments.mockResolvedValue([]);

      await controller.search({ query: "test query" });

      expect(ragService.searchSimilarDocuments).toHaveBeenCalledWith(
        "test query",
        5,
        0.3,
      );
    });

    it("should throw 400 when query is empty", async () => {
      await expect(controller.search({ query: "" })).rejects.toThrow(
        HttpException,
      );

      await expect(controller.search({ query: "" })).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Query parameter is required and cannot be empty",
        }),
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it("should throw 400 when limit is out of range", async () => {
      await expect(
        controller.search({ query: "test", limit: 0 }),
      ).rejects.toThrow(HttpException);

      await expect(
        controller.search({ query: "test", limit: 51 }),
      ).rejects.toThrow(HttpException);
    });

    it("should throw 400 when threshold is out of range", async () => {
      await expect(
        controller.search({ query: "test", threshold: -0.1 }),
      ).rejects.toThrow(HttpException);

      await expect(
        controller.search({ query: "test", threshold: 1.1 }),
      ).rejects.toThrow(HttpException);
    });

    it("should throw 500 on service failure", async () => {
      mockRagService.searchSimilarDocuments.mockRejectedValue(
        new Error("Service error"),
      );

      await expect(controller.search({ query: "test" })).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Failed to search knowledge base",
        }),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("POST /rag/seed", () => {
    it("should seed data successfully", async () => {
      const mockContent = [
        {
          title: "Bitcoin",
          content: "Bitcoin content",
          url: "https://example.com/bitcoin",
          source: "CoinGecko",
          publishedAt: new Date(),
        },
      ];

      const mockStats = {
        totalVectorCount: 100,
        dimension: 384,
      };

      mockVectorService.initializeIndex.mockResolvedValue(undefined);
      mockScraperService.getAllCoinGeckoData.mockResolvedValue(mockContent);
      mockRagService.addMultipleDocuments.mockResolvedValue(undefined);
      mockVectorService.getIndexStats.mockResolvedValue(mockStats);

      const result = await controller.seedData();

      expect(result).toEqual({
        success: true,
        itemsFetched: 1,
        items: [
          {
            title: "Bitcoin",
            source: "CoinGecko",
            url: "https://example.com/bitcoin",
          },
        ],
        pineconeStats: mockStats,
        message: "Successfully seeded 1 items to Pinecone",
      });

      expect(vectorService.initializeIndex).toHaveBeenCalled();
      expect(scraperService.getAllCoinGeckoData).toHaveBeenCalled();
      expect(ragService.addMultipleDocuments).toHaveBeenCalledWith(mockContent);
    });

    it("should throw 503 when no content is fetched", async () => {
      mockVectorService.initializeIndex.mockResolvedValue(undefined);
      mockScraperService.getAllCoinGeckoData.mockResolvedValue([]);

      await expect(controller.seedData()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message:
            "No content was fetched from CoinGecko API. The service may be unavailable.",
        }),
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });
    });

    it("should throw 500 on unexpected error", async () => {
      mockVectorService.initializeIndex.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await expect(controller.seedData()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Failed to seed knowledge base with data",
        }),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("GET /rag/stats", () => {
    it("should return index stats successfully", async () => {
      const mockStats = {
        totalVectorCount: 150,
        dimension: 384,
      };

      mockVectorService.getIndexStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual({
        success: true,
        stats: mockStats,
      });
    });

    it("should throw 503 when stats are unavailable", async () => {
      mockVectorService.getIndexStats.mockResolvedValue(null);

      await expect(controller.getStats()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message:
            "Unable to retrieve index statistics. The vector database may be unavailable.",
        }),
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });
    });

    it("should throw 503 on service failure", async () => {
      mockVectorService.getIndexStats.mockRejectedValue(
        new Error("Connection failed"),
      );

      await expect(controller.getStats()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Failed to retrieve vector database statistics",
        }),
        status: HttpStatus.SERVICE_UNAVAILABLE,
      });
    });
  });

  describe("POST /rag/refresh", () => {
    it("should refresh data successfully", async () => {
      const mockStats = {
        totalVectorCount: 200,
        dimension: 384,
      };

      mockRagService.refreshCryptoData.mockResolvedValue(undefined);
      mockVectorService.getIndexStats.mockResolvedValue(mockStats);

      const result = await controller.refreshData();

      expect(result).toEqual({
        success: true,
        message: "Crypto data refreshed successfully",
        stats: mockStats,
      });
      expect(ragService.refreshCryptoData).toHaveBeenCalled();
    });

    it("should throw 500 on refresh failure", async () => {
      mockRagService.refreshCryptoData.mockRejectedValue(
        new Error("Refresh failed"),
      );

      await expect(controller.refreshData()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Failed to refresh crypto data from external sources",
        }),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("POST /rag/clear", () => {
    it("should clear all data successfully", async () => {
      const mockStats = {
        totalVectorCount: 0,
        dimension: 384,
      };

      mockVectorService.deleteAllVectors.mockResolvedValue(undefined);
      mockVectorService.getIndexStats.mockResolvedValue(mockStats);

      const result = await controller.clearAllData();

      expect(result).toEqual({
        success: true,
        message: "All vectors cleared from knowledge base successfully",
        stats: mockStats,
      });
      expect(vectorService.deleteAllVectors).toHaveBeenCalled();
    });

    it("should throw 500 on clear failure", async () => {
      mockVectorService.deleteAllVectors.mockRejectedValue(
        new Error("Clear failed"),
      );

      await expect(controller.clearAllData()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Failed to clear data from vector database",
        }),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("POST /rag/refresh/manual", () => {
    it("should trigger manual refresh successfully", async () => {
      const mockResponse = {
        success: true,
        message: "Manual refresh triggered",
      };

      mockRagSchedulerService.triggerManualRefresh.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.triggerManualRefresh();

      expect(result).toEqual(mockResponse);
      expect(ragSchedulerService.triggerManualRefresh).toHaveBeenCalled();
    });

    it("should throw 500 on trigger failure", async () => {
      mockRagSchedulerService.triggerManualRefresh.mockRejectedValue(
        new Error("Trigger failed"),
      );

      await expect(controller.triggerManualRefresh()).rejects.toMatchObject({
        response: expect.objectContaining({
          success: false,
          message: "Failed to trigger manual refresh",
        }),
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe("GET /rag/refresh/status", () => {
    it("should get refresh status successfully", async () => {
      const mockStatus = {
        isRefreshing: false,
        lastRefresh: new Date(),
      };

      mockRagSchedulerService.getRefreshStatus.mockReturnValue(mockStatus);

      const result = controller.getRefreshStatus();

      expect(result).toEqual(mockStatus);
      expect(ragSchedulerService.getRefreshStatus).toHaveBeenCalled();
    });

    it("should throw 500 on status retrieval failure", async () => {
      mockRagSchedulerService.getRefreshStatus.mockImplementation(() => {
        throw new Error("Status retrieval failed");
      });

      expect(() => controller.getRefreshStatus()).toThrow(HttpException);
    });
  });

  describe("Development-only endpoints", () => {
    describe("GET /rag/test/embedding", () => {
      it("should test embedding service successfully", async () => {
        const mockEmbedding = new Array(384).fill(0.1);
        mockEmbeddingService.createEmbedding.mockResolvedValue(mockEmbedding);

        const result = await controller.testEmbedding("Test text");

        expect(result).toEqual({
          success: true,
          text: "Test text",
          embeddingDimension: 384,
          embeddingPreview: mockEmbedding.slice(0, 5),
          message: "Embedding service is working correctly",
        });
      });

      it("should use default text when not provided", async () => {
        const mockEmbedding = new Array(384).fill(0.1);
        mockEmbeddingService.createEmbedding.mockResolvedValue(mockEmbedding);

        const result = await controller.testEmbedding(undefined as any);

        expect(result.text).toBe("Bitcoin is a decentralized cryptocurrency");
        expect(embeddingService.createEmbedding).toHaveBeenCalledWith(
          "Bitcoin is a decentralized cryptocurrency",
        );
      });

      it("should throw 503 on embedding service failure", async () => {
        mockEmbeddingService.createEmbedding.mockRejectedValue(
          new Error("Embedding failed"),
        );

        await expect(controller.testEmbedding("test")).rejects.toMatchObject({
          response: expect.objectContaining({
            success: false,
            message: "Embedding service failed",
          }),
          status: HttpStatus.SERVICE_UNAVAILABLE,
        });
      });
    });

    describe("GET /rag/test/pinecone", () => {
      it("should test Pinecone connection successfully", async () => {
        const mockStats = {
          totalVectorCount: 100,
          dimension: 384,
        };

        mockVectorService.getIndexStats.mockResolvedValue(mockStats);

        const result = await controller.testPinecone();

        expect(result).toEqual({
          success: true,
          stats: mockStats,
          message: "Pinecone connection is working",
        });
      });

      it("should throw 503 on Pinecone connection failure", async () => {
        mockVectorService.getIndexStats.mockRejectedValue(
          new Error("Connection failed"),
        );

        await expect(controller.testPinecone()).rejects.toMatchObject({
          response: expect.objectContaining({
            success: false,
            message: "Pinecone connection failed",
          }),
          status: HttpStatus.SERVICE_UNAVAILABLE,
        });
      });
    });

    describe("GET /rag/test/coingecko", () => {
      it("should test CoinGecko API successfully", async () => {
        const mockContent = [
          {
            title: "Bitcoin",
            content: "Bitcoin is a cryptocurrency with a long description",
            url: "https://example.com/bitcoin",
            source: "CoinGecko",
            publishedAt: new Date(),
          },
        ];

        mockScraperService.getAllCoinGeckoData.mockResolvedValue(mockContent);

        const result = await controller.testCoinGecko();

        expect(result).toEqual({
          success: true,
          itemsCount: 1,
          items: [
            {
              title: "Bitcoin",
              source: "CoinGecko",
              url: "https://example.com/bitcoin",
              contentLength: mockContent[0].content.length,
            },
          ],
          message: "CoinGecko API is working correctly",
        });
      });

      it("should throw 503 on CoinGecko API failure", async () => {
        mockScraperService.getAllCoinGeckoData.mockRejectedValue(
          new Error("API failed"),
        );

        await expect(controller.testCoinGecko()).rejects.toMatchObject({
          response: expect.objectContaining({
            success: false,
            message: "CoinGecko API failed",
          }),
          status: HttpStatus.SERVICE_UNAVAILABLE,
        });
      });
    });
  });
});
