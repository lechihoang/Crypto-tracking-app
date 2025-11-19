import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  CryptoService,
  CoinData,
  CoinPrice,
  SearchResult,
  PriceHistory,
  CoinDetails,
  NewsArticle,
} from "./crypto.service";

@Controller("crypto")
export class CryptoController {
  private readonly logger = new Logger(CryptoController.name);

  constructor(private readonly cryptoService: CryptoService) {}

  @Post("prices")
  async getCoinPrices(
    @Body() body: { coinIds: string[] },
  ): Promise<Record<string, CoinPrice>> {
    try {
      if (
        !body.coinIds ||
        !Array.isArray(body.coinIds) ||
        body.coinIds.length === 0
      ) {
        throw new HttpException(
          "coinIds array is required and cannot be empty",
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.cryptoService.getCoinPrices(body.coinIds);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to get coin prices: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch coin prices from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get("top")
  async getTopCoins(
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ): Promise<CoinData[]> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const pageNum = page ? parseInt(page, 10) : 1;

      if (limitNum < 1 || limitNum > 250) {
        throw new HttpException(
          "Limit must be between 1 and 250",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (pageNum < 1) {
        throw new HttpException(
          "Page must be greater than 0",
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.cryptoService.getTopCoins(limitNum, pageNum);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to get top coins: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch top coins from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get("search")
  async searchCoins(@Query("q") query: string): Promise<SearchResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new HttpException(
          "Query parameter is required and cannot be empty",
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.cryptoService.searchCoins(query);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to search coins: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to search coins from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get("news/latest")
  async getNews(@Query("limit") limit?: string): Promise<NewsArticle[]> {
    try {
      const limitNum = limit ? parseInt(limit, 10) : 10;

      if (limitNum < 1 || limitNum > 100) {
        throw new HttpException(
          "Limit must be between 1 and 100",
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.cryptoService.getNews(limitNum);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to get news: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch news from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(":coinId/history")
  async getCoinPriceHistory(
    @Param("coinId") coinId: string,
    @Query("days") days?: string,
  ): Promise<PriceHistory> {
    try {
      if (!coinId || coinId.trim().length === 0) {
        throw new HttpException("Coin ID is required", HttpStatus.BAD_REQUEST);
      }

      const daysNum = days ? parseInt(days, 10) : 7;

      if (daysNum < 1 || daysNum > 365) {
        throw new HttpException(
          "Days must be between 1 and 365",
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.cryptoService.getCoinPriceHistory(coinId, daysNum);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to get coin price history for ${coinId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch coin price history from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(":coinId/market")
  async getCoinMarketData(
    @Param("coinId") coinId: string,
  ): Promise<CoinData | null> {
    try {
      if (!coinId || coinId.trim().length === 0) {
        throw new HttpException("Coin ID is required", HttpStatus.BAD_REQUEST);
      }

      const data = await this.cryptoService.getCoinMarketData(coinId);

      if (!data) {
        throw new HttpException(
          `Coin with ID '${coinId}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to get coin market data for ${coinId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch coin market data from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(":coinId")
  async getCoinDetails(@Param("coinId") coinId: string): Promise<CoinDetails> {
    try {
      if (!coinId || coinId.trim().length === 0) {
        throw new HttpException("Coin ID is required", HttpStatus.BAD_REQUEST);
      }

      return await this.cryptoService.getCoinDetails(coinId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(
        `Failed to get coin details for ${coinId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to fetch coin details from external service",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
