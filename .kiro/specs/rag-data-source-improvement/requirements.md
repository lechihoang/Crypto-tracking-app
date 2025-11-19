# Requirements Document

## Introduction

The current RAG system only fetches cryptocurrency categories and trending data, but lacks specific information about individual coins' prices, market caps, and volumes. Users frequently ask about specific cryptocurrency prices and market data, but the chatbot cannot provide accurate answers without this information. This improvement will add top market coins data while keeping existing categories and trending data, providing comprehensive cryptocurrency information for the chatbot.

## Glossary

- **RAG System**: Retrieval-Augmented Generation system that provides context to the chatbot
- **Scraper Service**: Service responsible for fetching cryptocurrency data from CoinGecko API
- **Top Coins**: The most valuable cryptocurrencies by market capitalization
- **Trending Coins**: Cryptocurrencies currently experiencing high search volume or interest
- **Market Data**: Real-time information including price, market cap, volume, and price changes
- **Vector Database**: Pinecone database storing embedded cryptocurrency information

## Requirements

### Requirement 1

**User Story:** As a chatbot user, I want to ask about specific cryptocurrency prices and market data, so that I can get accurate real-time information

#### Acceptance Criteria

1. WHEN THE Scraper Service fetches coin data, THE System SHALL retrieve information from `/coins/markets` endpoint with API key authentication
2. THE Scraper Service SHALL fetch the top 100 cryptocurrencies by market capitalization
3. FOR each coin, THE System SHALL include current price, market cap, 24h volume, and 24h price change from real API responses
4. THE System SHALL NOT use mock data or hardcoded values for any coin information
5. WHEN a user asks about a specific coin's price, THE Chatbot SHALL provide accurate current market data from CoinGecko API

### Requirement 2

**User Story:** As a chatbot user, I want to know which cryptocurrencies are currently trending, so that I can stay informed about market movements

#### Acceptance Criteria

1. WHEN THE Scraper Service fetches trending data, THE System SHALL use `/search/trending` endpoint with API key authentication
2. THE System SHALL retrieve all trending coins returned by the real API response (typically 7-15 coins)
3. FOR each trending coin, THE System SHALL use actual data from the API without mock values
4. THE Trending data SHALL be refreshed daily to reflect current market interest from real API calls
5. WHEN a user asks about trending cryptocurrencies, THE Chatbot SHALL provide up-to-date trending information from live API data

### Requirement 3

**User Story:** As a system administrator, I want to add top coins data while keeping existing categories, so that the RAG system has comprehensive cryptocurrency information

#### Acceptance Criteria

1. THE Scraper Service SHALL keep the existing `getCategoriesData()` method unchanged
2. THE Scraper Service SHALL keep the existing `getTrendingData()` method unchanged
3. THE Scraper Service SHALL add a new `getTopCoinsData()` method to fetch market data
4. AFTER the changes, THE total vector count SHALL be approximately 750-800 (630 categories + 100 coins + 15 trending + 2 global)
5. THE System SHALL maintain all existing data sources plus the new top coins data

### Requirement 4

**User Story:** As a developer, I want the new data structure to integrate seamlessly with existing deduplication logic, so that no duplicates are created

#### Acceptance Criteria

1. THE new coin market data SHALL use stable URL-based IDs consistent with existing deduplication
2. WHEN THE same coin is fetched multiple times, THE System SHALL replace the old data with new data
3. THE System SHALL use source-based cleanup for "CoinGecko API - Markets" source
4. THE System SHALL use source-based cleanup for "CoinGecko API - Trending" source
5. AFTER refresh operations, THE vector count SHALL remain stable (±5 for trending changes)

### Requirement 5

**User Story:** As a chatbot user, I want comprehensive information about each cryptocurrency, so that I can make informed decisions

#### Acceptance Criteria

1. FOR each top coin, THE System SHALL include: name, symbol, current price, market cap rank, 24h volume, 24h price change percentage
2. THE System SHALL format numbers in human-readable format (e.g., "$1.2B" instead of "1200000000")
3. THE System SHALL indicate price direction (up/down) based on 24h change
4. THE coin descriptions SHALL be optimized for semantic search and natural language queries
5. WHEN a user asks comparative questions (e.g., "Bitcoin vs Ethereum"), THE Chatbot SHALL have sufficient data to respond accurately
