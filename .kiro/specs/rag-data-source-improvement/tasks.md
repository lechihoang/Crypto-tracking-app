# Implementation Plan

- [x] 1. Add number formatting helper methods to Scraper Service
  - [x] 1.1 Create `formatCurrency()` helper method
    - Format large numbers into B/M/K notation
    - Handle billions, millions, thousands
    - Return formatted string with $ prefix
    - _Requirements: 5.2_
  
  - [x] 1.2 Create `formatPriceChange()` helper method
    - Determine direction (up/down) based on positive/negative
    - Format percentage with 2 decimal places
    - Return human-readable string
    - _Requirements: 5.3_

- [x] 2. Implement getTopCoinsData() method in Scraper Service
  - [x] 2.1 Create method signature and basic structure
    - Define return type as Promise<ScrapedContent[]>
    - Add error handling try-catch block
    - Add logging for start and completion
    - _Requirements: 1.1, 1.4_
  
  - [x] 2.2 Implement API call to /coins/markets
    - Use getCoinGeckoHeaders() for API key authentication
    - Set parameters: vs_currency=usd, order=market_cap_desc, per_page=100, page=1
    - Set timeout to 10000ms
    - Handle API response
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [x] 2.3 Process API response and generate content
    - Loop through each coin in response
    - Extract: id, symbol, name, current_price, market_cap, market_cap_rank, total_volume, price_change_percentage_24h
    - Skip coins with null current_price
    - Format numbers using helper methods
    - Generate natural language description
    - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 2.4 Create ScrapedContent objects
    - Set title: "{Name} ({Symbol}) - Market Data"
    - Set content: formatted description
    - Set url: "https://www.coingecko.com/en/coins/{id}"
    - Set source: "CoinGecko API - Markets"
    - Set publishedAt: new Date()
    - _Requirements: 1.3, 4.1_

- [x] 3. Update getAllCoinGeckoData() to include top coins
  - Add getTopCoinsData() to Promise.all array
  - Add topCoins to allContent array
  - Update logging to show coins count
  - _Requirements: 3.3, 3.5_

- [x] 4. Test the new data source
  - [x] 4.1 Clear vector database for clean test
    - Call /rag/clear endpoint
    - Verify vector count is 0
    - _Requirements: 3.4_
  
  - [x] 4.2 Run refresh and verify vector count
    - Trigger /rag/refresh endpoint
    - Check vector count is approximately 750-800
    - Verify breakdown: ~630 categories + ~100 coins + ~15 trending + ~2 global
    - _Requirements: 3.4, 3.5_
  
  - [x] 4.3 Test search for coin prices
    - Search for "Bitcoin price"
    - Verify results include market data from new source
    - Search for "Ethereum market cap"
    - Verify accurate information is returned
    - _Requirements: 1.5, 5.5_
  
  - [x] 4.4 Run second refresh and verify no duplicates
    - Trigger refresh again
    - Verify vector count remains stable (±5 for trending changes)
    - Confirm deduplication is working
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 5. Verify API authentication is working
  - Check logs for successful API calls with authentication
  - Verify no 401 Unauthorized errors
  - Confirm API key is being sent in headers
  - _Requirements: 1.1, 2.1_
