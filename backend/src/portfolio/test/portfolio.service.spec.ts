import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { PortfolioService } from "../portfolio.service";
import { PortfolioHolding } from "../../schemas/portfolio-holding.schema";
import { PortfolioSnapshot } from "../../schemas/portfolio-snapshot.schema";
import { CryptoService } from "../../crypto/crypto.service";

describe("PortfolioService - Value History", () => {
  let service: PortfolioService;

  // Mock Mongoose model methods
  const mockExec = jest.fn();
  const mockFind = jest.fn();
  const mockSort = jest.fn();

  // Mock Mongoose model constructor for PortfolioHolding
  const mockHoldingModel: any = jest.fn();
  mockHoldingModel.find = mockFind.mockReturnValue({
    sort: mockSort.mockReturnValue({
      exec: mockExec,
    }),
    exec: mockExec,
  });

  // Mock Mongoose model constructor for PortfolioSnapshot
  const mockSnapshotModel: any = jest.fn();

  // Mock CryptoService
  const mockCryptoService = {
    getCoinPriceHistory: jest.fn(),
    getCoinsBasicInfo: jest.fn(),
    getCoinPrices: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getModelToken(PortfolioHolding.name),
          useValue: mockHoldingModel,
        },
        {
          provide: getModelToken(PortfolioSnapshot.name),
          useValue: mockSnapshotModel,
        },
        {
          provide: CryptoService,
          useValue: mockCryptoService,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);

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

  describe("getPortfolioValueHistory", () => {
    const userId = "user-123";
    const mockHoldings = [
      {
        _id: "holding-1",
        userId,
        coinId: "bitcoin",
        quantity: 0.5,
        averageBuyPrice: 40000,
        createdAt: new Date(),
      },
      {
        _id: "holding-2",
        userId,
        coinId: "ethereum",
        quantity: 2,
        averageBuyPrice: 2000,
        createdAt: new Date(),
      },
    ];

    it("should return empty data array when user has no holdings", async () => {
      mockExec.mockResolvedValue([]);

      const result = await service.getPortfolioValueHistory(userId, 7);

      expect(mockHoldingModel.find).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({ data: [] });
    });

    it("should calculate portfolio value history for 7 days", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      const mockBitcoinPrices = {
        prices: [
          { timestamp: 1000000, price: 45000 },
          { timestamp: 2000000, price: 46000 },
          { timestamp: 3000000, price: 47000 },
        ],
      };

      const mockEthereumPrices = {
        prices: [
          { timestamp: 1000000, price: 2200 },
          { timestamp: 2000000, price: 2300 },
          { timestamp: 3000000, price: 2400 },
        ],
      };

      mockCryptoService.getCoinPriceHistory
        .mockResolvedValueOnce(mockBitcoinPrices)
        .mockResolvedValueOnce(mockEthereumPrices);

      const result = await service.getPortfolioValueHistory(userId, 7);

      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "bitcoin",
        7,
      );
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "ethereum",
        7,
      );
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("timestamp");
      expect(result.data[0]).toHaveProperty("totalValue");
      expect(result.data[0]).toHaveProperty("date");
    });

    it("should calculate portfolio value history for 30 days", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      const mockBitcoinPrices = {
        prices: Array.from({ length: 30 }, (_, i) => ({
          timestamp: 1000000 + i * 86400000,
          price: 45000 + i * 100,
        })),
      };

      const mockEthereumPrices = {
        prices: Array.from({ length: 30 }, (_, i) => ({
          timestamp: 1000000 + i * 86400000,
          price: 2200 + i * 10,
        })),
      };

      mockCryptoService.getCoinPriceHistory
        .mockResolvedValueOnce(mockBitcoinPrices)
        .mockResolvedValueOnce(mockEthereumPrices);

      const result = await service.getPortfolioValueHistory(userId, 30);

      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "bitcoin",
        30,
      );
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "ethereum",
        30,
      );
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should calculate portfolio value history for 90 days", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      const mockBitcoinPrices = {
        prices: Array.from({ length: 90 }, (_, i) => ({
          timestamp: 1000000 + i * 86400000,
          price: 45000 + i * 50,
        })),
      };

      const mockEthereumPrices = {
        prices: Array.from({ length: 90 }, (_, i) => ({
          timestamp: 1000000 + i * 86400000,
          price: 2200 + i * 5,
        })),
      };

      mockCryptoService.getCoinPriceHistory
        .mockResolvedValueOnce(mockBitcoinPrices)
        .mockResolvedValueOnce(mockEthereumPrices);

      const result = await service.getPortfolioValueHistory(userId, 90);

      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "bitcoin",
        90,
      );
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "ethereum",
        90,
      );
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should calculate correct portfolio values at each timestamp", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      const mockBitcoinPrices = {
        prices: [
          { timestamp: 1000000, price: 50000 },
          { timestamp: 2000000, price: 51000 },
        ],
      };

      const mockEthereumPrices = {
        prices: [
          { timestamp: 1000000, price: 3000 },
          { timestamp: 2000000, price: 3100 },
        ],
      };

      mockCryptoService.getCoinPriceHistory
        .mockResolvedValueOnce(mockBitcoinPrices)
        .mockResolvedValueOnce(mockEthereumPrices);

      const result = await service.getPortfolioValueHistory(userId, 7);

      // Bitcoin: 0.5 * 50000 = 25000, Ethereum: 2 * 3000 = 6000, Total = 31000
      expect(result.data[0].totalValue).toBeCloseTo(31000, 0);
      // Bitcoin: 0.5 * 51000 = 25500, Ethereum: 2 * 3100 = 6200, Total = 31700
      expect(result.data[1].totalValue).toBeCloseTo(31700, 0);
    });

    it("should handle when price history fetch fails for one coin", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      const mockBitcoinPrices = {
        prices: [
          { timestamp: 1000000, price: 45000 },
          { timestamp: 2000000, price: 46000 },
        ],
      };

      mockCryptoService.getCoinPriceHistory
        .mockResolvedValueOnce(mockBitcoinPrices)
        .mockRejectedValueOnce(new Error("API rate limit exceeded"));

      const result = await service.getPortfolioValueHistory(userId, 7);

      // Should still return data, but only for bitcoin
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
    });

    it("should handle when all price fetches fail gracefully", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      mockCryptoService.getCoinPriceHistory.mockRejectedValue(
        new Error("CoinGecko API unavailable"),
      );

      const result = await service.getPortfolioValueHistory(userId, 7);

      // Service logs warnings but continues with empty price data
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should handle network errors during price fetch", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      mockCryptoService.getCoinPriceHistory.mockRejectedValue(
        new Error("Network error"),
      );

      const result = await service.getPortfolioValueHistory(userId, 7);

      // Service should handle errors gracefully
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it("should handle holdings with same coin (deduplicate coin IDs)", async () => {
      const duplicateHoldings = [
        {
          _id: "holding-1",
          userId,
          coinId: "bitcoin",
          quantity: 0.5,
          averageBuyPrice: 40000,
          createdAt: new Date(),
        },
        {
          _id: "holding-2",
          userId,
          coinId: "bitcoin",
          quantity: 0.3,
          averageBuyPrice: 42000,
          createdAt: new Date(),
        },
      ];

      mockExec.mockResolvedValue(duplicateHoldings);

      const mockBitcoinPrices = {
        prices: [
          { timestamp: 1000000, price: 45000 },
          { timestamp: 2000000, price: 46000 },
        ],
      };

      mockCryptoService.getCoinPriceHistory.mockResolvedValueOnce(
        mockBitcoinPrices,
      );

      const result = await service.getPortfolioValueHistory(userId, 7);

      // Should only call getCoinPriceHistory once for bitcoin
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledTimes(1);
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "bitcoin",
        7,
      );

      // Total quantity: 0.5 + 0.3 = 0.8 BTC
      // At 45000: 0.8 * 45000 = 36000
      expect(result.data[0].totalValue).toBeCloseTo(36000, 0);
    });

    it("should use default 30 days when days parameter is not provided", async () => {
      mockExec.mockResolvedValue(mockHoldings);

      const mockBitcoinPrices = {
        prices: [{ timestamp: 1000000, price: 45000 }],
      };

      const mockEthereumPrices = {
        prices: [{ timestamp: 1000000, price: 2200 }],
      };

      mockCryptoService.getCoinPriceHistory
        .mockResolvedValueOnce(mockBitcoinPrices)
        .mockResolvedValueOnce(mockEthereumPrices);

      await service.getPortfolioValueHistory(userId);

      // Default should be 30 days as per the service implementation
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "bitcoin",
        30,
      );
      expect(mockCryptoService.getCoinPriceHistory).toHaveBeenCalledWith(
        "ethereum",
        30,
      );
    });
  });
});
