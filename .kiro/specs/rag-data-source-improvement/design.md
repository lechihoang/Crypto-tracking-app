# Design Document

## Overview

This design adds a new data source to the RAG system: top 100 cryptocurrencies by market capitalization from CoinGecko's `/coins/markets` endpoint. The new data will complement existing categories and trending data, providing the chatbot with specific, real-time information about cryptocurrency prices, market caps, and volumes. All API calls will use proper authentication with the CoinGecko API key.

## Architecture

### Current Data Flow
```
Scheduler → getAllCoinGeckoData()
  ↓
  ├─ getCategoriesData() → 630 categories
  ├─ getTrendingData() → 15 trending coins
  └─ getGlobalData() → 2 global market docs
  ↓
addMultipleDocuments() → Pinecone (650 vectors)
```

### New Data Flow
```
Scheduler → getAllCoinGeckoData()
  ↓
  ├─ getCategoriesData() → 630 categories
  ├─ getTrendingData() → 15 trending coins
  ├─ getTopCoinsData() → 100 top coins (NEW)
  └─ getGlobalData() → 2 global market docs
  ↓
addMultipleDocuments() → Pinecone (~750 vectors)
```

## Components and Interfaces

### 1. Scraper Service - New Method

**New Method: `getTopCoinsData()`**
```typescript
async getTopCoinsData(): Promise<ScrapedContent[]>
```

**Functionality:**
- Calls CoinGecko `/coins/markets` endpoint with API key
- Parameters:
  - `vs_currency=usd`
  - `order=market_cap_desc`
  - `per_page=100`
  - `page=1`
  - `sparkline=false`
- Returns array of ScrapedContent with coin market data

**Response Structure from API:**
```typescript
interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  // ... other fields
}
```

**Content Generation:**
For each coin, create natural language description:
```
Bitcoin (BTC) is currently ranked #1 by market capitalization at $850.5 billion. 
The current price is $43,250.00, up 2.5% in the last 24 hours. 
The 24-hour trading volume is $28.3 billion.
```

### 2. Scraper Service - Update getAllCoinGeckoData()

**Modified Method:**
```typescript
async getAllCoinGeckoData(): Promise<ScrapedContent[]> {
  const [categories, trending, topCoins, global] = await Promise.all([
    this.getCategoriesData(),
    this.getTrendingData(),
    this.getTopCoinsData(), // NEW
    this.getGlobalData(),
  ]);

  allContent.push(...categories);
  allContent.push(...trending);
  allContent.push(...topCoins); // NEW
  allContent.push(...global);

  return allContent;
}
```

### 3. API Authentication

**All API calls must include authentication:**
```typescript
private getCoinGeckoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (this.coinGeckoApiKey) {
    headers["x-cg-demo-api-key"] = this.coinGeckoApiKey;
  }

  return headers;
}
```

**Usage in getTopCoinsData():**
```typescript
const response = await axios.get(
  `${this.coinGeckoBaseUrl}/coins/markets`,
  {
    headers: this.getCoinGeckoHeaders(), // Include API key
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false,
    },
    timeout: 10000,
  },
);
```

## Data Models

### ScrapedContent for Top Coins

**Source:** `"CoinGecko API - Markets"`

**Title Format:** `"{Coin Name} ({Symbol}) - Market Data"`
- Example: "Bitcoin (BTC) - Market Data"

**Content Format:**
```
{Name} ({Symbol}) is currently ranked #{rank} by market capitalization at ${marketCap}. 
The current price is ${price}, {direction} {change}% in the last 24 hours. 
The 24-hour trading volume is ${volume}.
```

**URL Format:** `https://www.coingecko.com/en/coins/{id}`

**Example Document:**
```typescript
{
  title: "Bitcoin (BTC) - Market Data",
  content: "Bitcoin (BTC) is currently ranked #1 by market capitalization at $850.5 billion. The current price is $43,250.00, up 2.5% in the last 24 hours. The 24-hour trading volume is $28.3 billion.",
  url: "https://www.coingecko.com/en/coins/bitcoin",
  source: "CoinGecko API - Markets",
  publishedAt: new Date(),
}
```

### Number Formatting Helpers

**Helper Functions:**
```typescript
private formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

private formatPriceChange(change: number): string {
  const direction = change >= 0 ? 'up' : 'down';
  return `${direction} ${Math.abs(change).toFixed(2)}%`;
}
```

## Error Handling

### API Rate Limits
- CoinGecko free tier: 10-50 calls/minute
- With API key: Higher limits
- Handle 429 (Too Many Requests) with exponential backoff
- Log rate limit errors clearly

### Missing Data
- If `current_price` is null, skip the coin
- If `market_cap` is null, use "N/A" in description
- If `price_change_percentage_24h` is null, omit price change info

### API Failures
- If `/coins/markets` fails, log error but continue with other sources
- Don't block entire refresh if one source fails
- Return empty array on failure, not throw exception

## Testing Strategy

### Unit Tests
1. Test `getTopCoinsData()` with mocked axios responses
2. Test number formatting helpers
3. Test content generation with various coin data
4. Test error handling for missing fields

### Integration Tests
1. Call real CoinGecko API with test key
2. Verify 100 coins are returned
3. Verify all coins have required fields
4. Test deduplication with stable IDs

### Manual Testing
1. Clear vector database
2. Run refresh with new data source
3. Verify ~750 vectors (630 categories + 100 coins + 15 trending + 2 global)
4. Search for "Bitcoin price" - should return market data
5. Search for "Ethereum market cap" - should return market data
6. Run refresh again - verify count stays stable

## Performance Considerations

### API Call Efficiency
- Single API call fetches 100 coins (efficient)
- Parallel fetching with Promise.all (no sequential delays)
- Total API calls per refresh: 4 (categories, trending, markets, global)

### Vector Count Impact
- Before: ~650 vectors
- After: ~750 vectors (+100)
- Still well within Pinecone free tier limits
- Minimal impact on search performance

### Embedding Generation
- 100 new documents to embed per refresh
- ~2 seconds per embedding = ~200 seconds total
- Acceptable for daily refresh schedule
- Could optimize with batch embedding if needed

## Migration Strategy

### Phase 1: Add New Data Source
- Deploy code with new `getTopCoinsData()` method
- Existing data remains unchanged
- Next refresh will add 100 new coin documents

### Phase 2: Verify Data Quality
- Check vector count increases to ~750
- Test chatbot responses about coin prices
- Verify no duplicates created

### Phase 3: Monitor Performance
- Watch for API rate limit issues
- Monitor embedding generation time
- Check search result quality

## Monitoring and Logging

### Log Messages
```
[CoinGecko API] Fetching top 100 coins by market cap...
[CoinGecko API] Found 100 coins
[CoinGecko API] ✓ Added coin: Bitcoin (BTC)
[CoinGecko API] ✓ Added coin: Ethereum (ETH)
...
[CoinGecko API] Completed. 100 coins added
```

### Metrics to Track
- Number of coins fetched per refresh
- API response time for `/coins/markets`
- Number of coins with missing data
- Total vector count after refresh
- Search queries for coin prices (success rate)
