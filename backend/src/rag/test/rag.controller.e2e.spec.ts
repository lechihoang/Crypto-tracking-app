import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as request from "supertest";
import { RagController } from "../rag.controller";
import { RagService } from "../rag.service";
import { VectorService } from "../vector.service";
import { EmbeddingService } from "../embedding.service";
import { ScraperService } from "../scraper.service";
import { RagSchedulerService } from "../rag-scheduler.service";
import { DevelopmentOnlyGuard } from "../../common/guards";

/**
 * E2E tests for RAG Controller
 * Tests the actual HTTP endpoints and guard behavior
 */
describe("RagController (e2e)", () => {
  let app: INestApplication;
  let configService: ConfigService;

  const mockRagService = {
    searchSimilarDocuments: jest.fn(),
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      controllers: [RagController],
      providers: [
        { provide: RagService, useValue: mockRagService },
        { provide: VectorService, useValue: mockVectorService },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
        { provide: ScraperService, useValue: mockScraperService },
        { provide: RagSchedulerService, useValue: mockRagSchedulerService },
        DevelopmentOnlyGuard,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    configService = moduleFixture.get<ConfigService>(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Development-only guard behavior", () => {
    describe("In development environment", () => {
      beforeEach(() => {
        jest.spyOn(configService, "get").mockReturnValue("development");
      });

      it("should allow access to /rag/test/embedding", async () => {
        const mockEmbedding = new Array(384).fill(0.1);
        mockEmbeddingService.createEmbedding.mockResolvedValue(mockEmbedding);

        const response = await request(app.getHttpServer())
          .get("/rag/test/embedding")
          .query({ text: "test" })
          .expect(HttpStatus.OK);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
          "Embedding service is working correctly",
        );
      });

      it("should allow access to /rag/test/pinecone", async () => {
        const mockStats = { totalVectorCount: 100, dimension: 384 };
        mockVectorService.getIndexStats.mockResolvedValue(mockStats);

        const response = await request(app.getHttpServer())
          .get("/rag/test/pinecone")
          .expect(HttpStatus.OK);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Pinecone connection is working");
      });

      it("should allow access to /rag/test/coingecko", async () => {
        const mockContent = [
          {
            title: "Bitcoin",
            content: "Bitcoin content",
            url: "https://example.com",
            source: "CoinGecko",
            publishedAt: new Date(),
          },
        ];
        mockScraperService.getAllCoinGeckoData.mockResolvedValue(mockContent);

        const response = await request(app.getHttpServer())
          .get("/rag/test/coingecko")
          .expect(HttpStatus.OK);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
          "CoinGecko API is working correctly",
        );
      });
    });

    describe("In production environment", () => {
      beforeEach(() => {
        jest.spyOn(configService, "get").mockReturnValue("production");
      });

      it("should block access to /rag/test/embedding with 403", async () => {
        const response = await request(app.getHttpServer())
          .get("/rag/test/embedding")
          .expect(HttpStatus.FORBIDDEN);

        expect(response.body.message).toBe(
          "This endpoint is only available in development environment",
        );
      });

      it("should block access to /rag/test/pinecone with 403", async () => {
        const response = await request(app.getHttpServer())
          .get("/rag/test/pinecone")
          .expect(HttpStatus.FORBIDDEN);

        expect(response.body.message).toBe(
          "This endpoint is only available in development environment",
        );
      });

      it("should block access to /rag/test/coingecko with 403", async () => {
        const response = await request(app.getHttpServer())
          .get("/rag/test/coingecko")
          .expect(HttpStatus.FORBIDDEN);

        expect(response.body.message).toBe(
          "This endpoint is only available in development environment",
        );
      });
    });
  });

  describe("Public endpoints (always accessible)", () => {
    beforeEach(() => {
      // Set to production to ensure these work in any environment
      jest.spyOn(configService, "get").mockReturnValue("production");
    });

    it("should allow POST /rag/search in any environment", async () => {
      mockRagService.searchSimilarDocuments.mockResolvedValue([]);

      await request(app.getHttpServer())
        .post("/rag/search")
        .send({ query: "test query" })
        .expect(HttpStatus.CREATED);
    });

    it("should allow POST /rag/seed in any environment", async () => {
      mockVectorService.initializeIndex.mockResolvedValue(undefined);
      mockScraperService.getAllCoinGeckoData.mockResolvedValue([
        {
          title: "Test",
          content: "Test content",
          url: "https://test.com",
          source: "Test",
          publishedAt: new Date(),
        },
      ]);
      mockRagService.addMultipleDocuments.mockResolvedValue(undefined);
      mockVectorService.getIndexStats.mockResolvedValue({
        totalVectorCount: 1,
        dimension: 384,
      });

      await request(app.getHttpServer())
        .post("/rag/seed")
        .expect(HttpStatus.CREATED);
    });

    it("should allow GET /rag/stats in any environment", async () => {
      mockVectorService.getIndexStats.mockResolvedValue({
        totalVectorCount: 100,
        dimension: 384,
      });

      await request(app.getHttpServer())
        .get("/rag/stats")
        .expect(HttpStatus.OK);
    });

    it("should allow POST /rag/refresh in any environment", async () => {
      mockRagService.refreshCryptoData.mockResolvedValue(undefined);
      mockVectorService.getIndexStats.mockResolvedValue({
        totalVectorCount: 100,
        dimension: 384,
      });

      await request(app.getHttpServer())
        .post("/rag/refresh")
        .expect(HttpStatus.CREATED);
    });

    it("should allow POST /rag/clear in any environment", async () => {
      mockVectorService.deleteAllVectors.mockResolvedValue(undefined);
      mockVectorService.getIndexStats.mockResolvedValue({
        totalVectorCount: 0,
        dimension: 384,
      });

      await request(app.getHttpServer())
        .post("/rag/clear")
        .expect(HttpStatus.CREATED);
    });

    it("should allow POST /rag/refresh/manual in any environment", async () => {
      mockRagSchedulerService.triggerManualRefresh.mockResolvedValue({
        success: true,
        message: "Refresh triggered",
      });

      await request(app.getHttpServer())
        .post("/rag/refresh/manual")
        .expect(HttpStatus.CREATED);
    });

    it("should allow GET /rag/refresh/status in any environment", async () => {
      mockRagSchedulerService.getRefreshStatus.mockReturnValue({
        isRefreshing: false,
        lastRefresh: new Date(),
      });

      await request(app.getHttpServer())
        .get("/rag/refresh/status")
        .expect(HttpStatus.OK);
    });
  });

  describe("Error response format consistency", () => {
    beforeEach(() => {
      jest.spyOn(configService, "get").mockReturnValue("development");
    });

    it("should return consistent error format for validation errors", async () => {
      const response = await request(app.getHttpServer())
        .post("/rag/search")
        .send({ query: "" })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
    });

    it("should return consistent error format for service errors", async () => {
      mockRagService.searchSimilarDocuments.mockRejectedValue(
        new Error("Service error"),
      );

      const response = await request(app.getHttpServer())
        .post("/rag/search")
        .send({ query: "test" })
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
    });

    it("should return consistent error format for unavailable services", async () => {
      mockVectorService.getIndexStats.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get("/rag/stats")
        .expect(HttpStatus.SERVICE_UNAVAILABLE);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("error");
    });
  });
});
