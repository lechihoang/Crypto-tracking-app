import { Injectable } from "@nestjs/common";
import axios from "axios";

export interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

@Injectable()
export class CryptoService {
  private readonly coinGeckoAPI = "https://api.coingecko.com/api/v3";
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 300000; // 5 minute cache (increased)
  private requestQueue: Array<{ resolve: Function; reject: Function; fn: Function }> = [];
  private isProcessingQueue = false;
  private readonly REQUEST_DELAY = 1000; // 1 second delay between requests

  constructor() {}

  private async queueRequest<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resolve, reject, fn });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { resolve, reject, fn } = this.requestQueue.shift()!;

      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Wait before processing next request
      if (this.requestQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.REQUEST_DELAY));
      }
    }

    this.isProcessingQueue = false;
  }

  private async getCachedData(key: string, fetcher: () => Promise<any>) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const data = await this.queueRequest(fetcher);
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.warn(
        "CoinGecko API error:",
        error.response?.status,
        error.response?.data?.status?.error_message,
      );

      // If rate limited, extend cache time for existing data
      if (error.response?.status === 429 && cached) {
        console.log("Rate limited, extending cache time for existing data");
        this.cache.set(key, { data: cached.data, timestamp: Date.now() });
        return cached.data;
      }

      // If API fails, return cached data if available
      if (cached) {
        console.log("Returning cached data due to API failure");
        return cached.data;
      }

      throw error;
    }
  }

  async getCoinPrices(coinIds: string[]) {
    const cacheKey = `prices_${coinIds.join(",")}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await axios.get(
        `${this.coinGeckoAPI}/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
      );
      return response.data;
    });
  }

  async getTopCoins(limit: number = 10): Promise<CoinData[]> {
    const cacheKey = `top_coins_${limit}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await axios.get(
        `${this.coinGeckoAPI}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1`,
      );
      return response.data;
    });
  }

  async searchCoins(query: string) {
    const cacheKey = `search_${query}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await axios.get(
        `${this.coinGeckoAPI}/search?query=${query}`,
      );
      return response.data.coins.slice(0, 10);
    });
  }

  async getCoinDetails(coinId: string) {
    const cacheKey = `details_${coinId}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await axios.get(`${this.coinGeckoAPI}/coins/${coinId}`);
      return response.data;
    });
  }

  async getCoinPriceHistory(coinId: string, days: number = 7) {
    const cacheKey = `history_${coinId}_${days}`;
    return this.getCachedData(cacheKey, async () => {
      const response = await axios.get(
        `${this.coinGeckoAPI}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );

      // Transform the data to a more frontend-friendly format
      const prices = response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toISOString(),
      }));

      return { prices };
    });
  }
}
