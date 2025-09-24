import { Controller, Get, Post, Query, Body, Param } from "@nestjs/common";
import { CryptoService, CoinData } from "./crypto.service";

@Controller("crypto")
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post("prices")
  async getCoinPrices(@Body() body: { coinIds: string[] }) {
    return this.cryptoService.getCoinPrices(body.coinIds);
  }

  @Get("top")
  async getTopCoins(@Query("limit") limit?: string): Promise<CoinData[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.cryptoService.getTopCoins(limitNum);
  }

  @Get("search")
  async searchCoins(@Query("q") query: string) {
    return this.cryptoService.searchCoins(query);
  }

  @Get(":coinId")
  async getCoinDetails(@Param("coinId") coinId: string) {
    return this.cryptoService.getCoinDetails(coinId);
  }

  @Get(":coinId/history")
  async getCoinPriceHistory(
    @Param("coinId") coinId: string,
    @Query("days") days?: string
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.cryptoService.getCoinPriceHistory(coinId, daysNum);
  }
}
