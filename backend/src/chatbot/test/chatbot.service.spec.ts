import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { ChatbotService } from "../chatbot.service";
import { RagService } from "../../rag/rag.service";
import { ChatMessage } from "../../schemas/chat-message.schema";

describe("ChatbotService", () => {
  let service: ChatbotService;

  // Mock Mongoose model methods
  const mockSave = jest.fn();
  const mockExec = jest.fn();
  const mockSort = jest.fn();
  const mockFind = jest.fn();
  const mockDeleteMany = jest.fn();

  // Mock ChatMessage model
  const mockChatMessageModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: mockSave,
  }));

  mockChatMessageModel.find = mockFind.mockReturnValue({
    sort: mockSort.mockReturnValue({
      exec: mockExec,
    }),
    exec: mockExec,
  });
  mockChatMessageModel.deleteMany = mockDeleteMany.mockReturnValue({
    exec: mockExec,
  });

  // Mock RagService
  const mockRagService = {
    searchSimilarDocuments: jest.fn(),
  };

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === "GROQ_API_KEY") return "test-groq-api-key";
      return null;
    }),
  };

  // Mock fetch for Groq API
  global.fetch = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: getModelToken(ChatMessage.name),
          useValue: mockChatMessageModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RagService,
          useValue: mockRagService,
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, "log").mockImplementation();
    jest.spyOn(Logger.prototype, "error").mockImplementation();
    jest.spyOn(Logger.prototype, "warn").mockImplementation();

    // Reset mocks
    jest.clearAllMocks();
    mockSort.mockReturnValue({
      exec: mockExec,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendMessage - Guest User", () => {
    it("should handle guest user message without userId", async () => {
      const message = "What is Bitcoin?";
      const sessionId = "guest-session-123";

      // Mock RAG search
      mockRagService.searchSimilarDocuments.mockResolvedValue([
        {
          content: "Bitcoin is a decentralized cryptocurrency",
          metadata: { source: "test" },
          score: 0.9,
        },
      ]);

      // Mock conversation history (empty for new session)
      mockExec.mockResolvedValue([]);

      // Mock Groq API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Bitcoin is a decentralized digital currency.",
              },
            },
          ],
        }),
      });

      // Mock save for new messages
      mockSave.mockResolvedValue({
        role: "assistant",
        content: "Bitcoin is a decentralized digital currency.",
        sessionId,
      });

      const result = await service.sendMessage(message, sessionId);

      expect(result).toBeDefined();
      expect(result.message).toBe(
        "Bitcoin is a decentralized digital currency.",
      );
      expect(result.sessionId).toBe(sessionId);
      expect(mockRagService.searchSimilarDocuments).toHaveBeenCalledWith(
        message,
        3,
      );
      expect(mockChatMessageModel).toHaveBeenCalledTimes(2); // user message + assistant message
    });

    it("should generate new sessionId for guest without sessionId", async () => {
      const message = "Tell me about Ethereum";

      mockRagService.searchSimilarDocuments.mockResolvedValue([]);
      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Ethereum is a blockchain platform.",
              },
            },
          ],
        }),
      });

      mockSave.mockResolvedValue({
        role: "assistant",
        content: "Ethereum is a blockchain platform.",
      });

      const result = await service.sendMessage(message);

      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.sessionId).toMatch(/^guest-/);
    });
  });

  describe("sendMessage - Logged-in User", () => {
    it("should handle logged-in user message with userId", async () => {
      const message = "What is DeFi?";
      const sessionId = "user-session-456";
      const userId = "user-123";

      mockRagService.searchSimilarDocuments.mockResolvedValue([
        {
          content: "DeFi stands for Decentralized Finance",
          metadata: { source: "test" },
          score: 0.85,
        },
      ]);

      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "DeFi refers to financial services on blockchain.",
              },
            },
          ],
        }),
      });

      mockSave.mockResolvedValue({
        role: "assistant",
        content: "DeFi refers to financial services on blockchain.",
        sessionId,
        userId,
      });

      const result = await service.sendMessage(message, sessionId, userId);

      expect(result).toBeDefined();
      expect(result.message).toBe(
        "DeFi refers to financial services on blockchain.",
      );
      expect(result.sessionId).toBe(sessionId);

      // Verify user message was saved with userId
      expect(mockChatMessageModel).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "user",
          content: message,
          sessionId,
          userId,
        }),
      );
    });

    it("should generate sessionId with userId prefix for logged-in user", async () => {
      const message = "What is NFT?";
      const userId = "user-789";

      mockRagService.searchSimilarDocuments.mockResolvedValue([]);
      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "NFT stands for Non-Fungible Token.",
              },
            },
          ],
        }),
      });

      mockSave.mockResolvedValue({
        role: "assistant",
        content: "NFT stands for Non-Fungible Token.",
      });

      const result = await service.sendMessage(message, undefined, userId);

      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.sessionId).toMatch(new RegExp(`^${userId}-`));
    });
  });

  describe("sendMessage - Conversation History", () => {
    it("should load and use conversation history", async () => {
      const message = "Tell me more";
      const sessionId = "session-with-history";
      const userId = "user-123";

      const mockHistory = [
        {
          role: "user",
          content: "What is Bitcoin?",
          sessionId,
          userId,
          createdAt: new Date("2024-01-01"),
        },
        {
          role: "assistant",
          content: "Bitcoin is a cryptocurrency.",
          sessionId,
          userId,
          createdAt: new Date("2024-01-01"),
        },
      ];

      mockExec.mockResolvedValue(mockHistory);
      mockRagService.searchSimilarDocuments.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Bitcoin was created by Satoshi Nakamoto.",
              },
            },
          ],
        }),
      });

      mockSave.mockResolvedValue({
        role: "assistant",
        content: "Bitcoin was created by Satoshi Nakamoto.",
        sessionId,
        userId,
      });

      const result = await service.sendMessage(message, sessionId, userId);

      expect(result).toBeDefined();
      expect(mockChatMessageModel.find).toHaveBeenCalledWith({
        sessionId,
        userId,
      });

      // Verify Groq API was called with conversation history
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.messages.length).toBeGreaterThan(2); // system + history + new message
    });

    it("should limit conversation history to recent messages", async () => {
      const message = "Continue";
      const sessionId = "long-session";

      // Create 20 messages in history
      const mockHistory = Array.from({ length: 20 }, (_, i) => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: `Message ${i}`,
        sessionId,
        createdAt: new Date(`2024-01-${String(i + 1).padStart(2, "0")}`),
      }));

      mockExec.mockResolvedValue(mockHistory);
      mockRagService.searchSimilarDocuments.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Response to continue.",
              },
            },
          ],
        }),
      });

      mockSave.mockResolvedValue({
        role: "assistant",
        content: "Response to continue.",
        sessionId,
      });

      await service.sendMessage(message, sessionId);

      // Verify Groq API was called
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      // Should include system message + limited history + new message
      // The service limits to last 10 messages
      expect(requestBody.messages.length).toBeLessThanOrEqual(12); // system + 10 history + new
    });
  });

  describe("sendMessage - Error Scenarios", () => {
    it("should handle RAG service failure gracefully", async () => {
      const message = "What is crypto?";
      const sessionId = "error-session";

      mockRagService.searchSimilarDocuments.mockRejectedValue(
        new Error("RAG service unavailable"),
      );
      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Crypto is short for cryptocurrency.",
              },
            },
          ],
        }),
      });

      mockSave.mockResolvedValue({
        role: "assistant",
        content: "Crypto is short for cryptocurrency.",
        sessionId,
      });

      // Should not throw, should continue without RAG context
      const result = await service.sendMessage(message, sessionId);

      expect(result).toBeDefined();
      expect(result.message).toBe("Crypto is short for cryptocurrency.");
    });

    it("should handle Groq API failure", async () => {
      const message = "Test message";
      const sessionId = "groq-error-session";

      mockRagService.searchSimilarDocuments.mockResolvedValue([]);
      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(service.sendMessage(message, sessionId)).rejects.toThrow();
    });

    it("should handle invalid Groq API response", async () => {
      const message = "Test message";
      const sessionId = "invalid-response-session";

      mockRagService.searchSimilarDocuments.mockResolvedValue([]);
      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [], // Empty choices array
        }),
      });

      await expect(service.sendMessage(message, sessionId)).rejects.toThrow();
    });

    it("should handle database save failure", async () => {
      const message = "Test message";
      const sessionId = "db-error-session";

      mockRagService.searchSimilarDocuments.mockResolvedValue([]);
      mockExec.mockResolvedValue([]);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Response message.",
              },
            },
          ],
        }),
      });

      mockSave.mockRejectedValue(new Error("Database connection failed"));

      await expect(service.sendMessage(message, sessionId)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("getChatHistory", () => {
    it("should retrieve chat history for user", async () => {
      const userId = "user-123";
      const sessionId = "session-456";

      const mockHistory = [
        {
          role: "user",
          content: "Hello",
          sessionId,
          userId,
          createdAt: new Date("2024-01-01"),
        },
        {
          role: "assistant",
          content: "Hi there!",
          sessionId,
          userId,
          createdAt: new Date("2024-01-01"),
        },
      ];

      mockExec.mockResolvedValue(mockHistory);

      const result = await service.getChatHistory(userId, sessionId);

      expect(result).toEqual(mockHistory);
      expect(mockChatMessageModel.find).toHaveBeenCalledWith({
        sessionId,
        userId,
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
    });

    it("should retrieve all user messages when sessionId not provided", async () => {
      const userId = "user-789";

      const mockHistory = [
        {
          role: "user",
          content: "Message 1",
          sessionId: "session-1",
          userId,
          createdAt: new Date("2024-01-01"),
        },
        {
          role: "assistant",
          content: "Response 1",
          sessionId: "session-1",
          userId,
          createdAt: new Date("2024-01-01"),
        },
      ];

      mockExec.mockResolvedValue(mockHistory);

      const result = await service.getChatHistory(userId);

      expect(result).toEqual(mockHistory);
      expect(mockChatMessageModel.find).toHaveBeenCalledWith({ userId });
    });

    it("should return empty array for user with no history", async () => {
      const userId = "new-user";

      mockExec.mockResolvedValue([]);

      const result = await service.getChatHistory(userId);

      expect(result).toEqual([]);
    });
  });

  describe("clearChatHistory", () => {
    it("should clear specific session history", async () => {
      const userId = "user-123";
      const sessionId = "session-to-clear";

      mockExec.mockResolvedValue({ deletedCount: 5 });

      await service.clearChatHistory(userId, sessionId);

      expect(mockChatMessageModel.deleteMany).toHaveBeenCalledWith({
        sessionId,
        userId,
      });
      expect(mockExec).toHaveBeenCalled();
    });

    it("should clear all user history when sessionId not provided", async () => {
      const userId = "user-456";

      mockExec.mockResolvedValue({ deletedCount: 10 });

      await service.clearChatHistory(userId);

      expect(mockChatMessageModel.deleteMany).toHaveBeenCalledWith({ userId });
      expect(mockExec).toHaveBeenCalled();
    });

    it("should handle clearing non-existent history", async () => {
      const userId = "user-no-history";

      mockExec.mockResolvedValue({ deletedCount: 0 });

      await service.clearChatHistory(userId);

      expect(mockChatMessageModel.deleteMany).toHaveBeenCalledWith({ userId });
      expect(mockExec).toHaveBeenCalled();
    });
  });
});
