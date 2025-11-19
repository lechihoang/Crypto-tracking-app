import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { PortfolioService } from "./portfolio.service";
import { AuthService } from "../auth/auth.service";
import { AuthToken } from "../auth/decorators/auth-token.decorator";
import { CreateHoldingDto } from "./dto/create-holding.dto";
import { UpdateHoldingDto } from "./dto/update-holding.dto";

@Controller("portfolio")
export class PortfolioController {
  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService,
  ) {}

  private async getUserFromToken(token: string): Promise<string> {
    const user = await this.authService.getUser(token);
    return user.id;
  }

  @Get("holdings")
  async getHoldings(@AuthToken() token: string) {
    const userId = await this.getUserFromToken(token);
    return this.portfolioService.getHoldings(userId);
  }

  @Post("holdings")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async addHolding(
    @AuthToken() token: string,
    @Body() createHoldingDto: CreateHoldingDto,
  ) {
    const userId = await this.getUserFromToken(token);
    return this.portfolioService.addHolding(userId, createHoldingDto);
  }

  @Put("holdings/:id")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateHolding(
    @AuthToken() token: string,
    @Param("id") holdingId: string,
    @Body() updateHoldingDto: UpdateHoldingDto,
  ) {
    const userId = await this.getUserFromToken(token);
    return this.portfolioService.updateHolding(
      userId,
      holdingId,
      updateHoldingDto,
    );
  }

  @Delete("holdings/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeHolding(
    @AuthToken() token: string,
    @Param("id") holdingId: string,
  ) {
    const userId = await this.getUserFromToken(token);
    await this.portfolioService.removeHolding(userId, holdingId);
  }

  @Get("value")
  async getPortfolioValue(@AuthToken() token: string) {
    const userId = await this.getUserFromToken(token);
    return this.portfolioService.getPortfolioValue(userId);
  }

  @Get("value-history")
  async getPortfolioValueHistory(
    @AuthToken() token: string,
    @Query("days") days?: string,
  ) {
    const userId = await this.getUserFromToken(token);
    const numDays = days ? parseInt(days, 10) : 7;
    return this.portfolioService.getPortfolioValueHistory(userId, numDays);
  }

  @Post("benchmark")
  async setBenchmark(
    @AuthToken() token: string,
    @Body("benchmarkValue") benchmarkValue: number,
  ) {
    const userId = await this.getUserFromToken(token);
    return this.portfolioService.setBenchmark(userId, benchmarkValue);
  }

  @Get("benchmark")
  async getBenchmark(@AuthToken() token: string) {
    const userId = await this.getUserFromToken(token);
    const benchmark = await this.portfolioService.getBenchmark(userId);

    // Also return current portfolio value for comparison
    const { totalValue } =
      await this.portfolioService.getPortfolioValue(userId);

    if (!benchmark) {
      return {
        benchmark: null,
        currentValue: totalValue,
        profitLoss: 0,
        profitLossPercentage: 0,
      };
    }

    const profitLoss = totalValue - Number(benchmark.benchmarkValue);
    const profitLossPercentage =
      Number(benchmark.benchmarkValue) > 0
        ? (profitLoss / Number(benchmark.benchmarkValue)) * 100
        : 0;

    return {
      benchmark: {
        value: Number(benchmark.benchmarkValue),
        setAt: benchmark.updatedAt,
      },
      currentValue: totalValue,
      profitLoss,
      profitLossPercentage,
    };
  }

  @Delete("benchmark")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBenchmark(@AuthToken() token: string) {
    const userId = await this.getUserFromToken(token);
    await this.portfolioService.deleteBenchmark(userId);
  }
}
