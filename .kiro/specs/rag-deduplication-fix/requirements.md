# Requirements Document

## Introduction

The RAG (Retrieval-Augmented Generation) system currently has data duplication issues where cryptocurrency information from CoinGecko API is repeatedly added to the vector database without proper deduplication. Each refresh creates new documents with new IDs and timestamps, causing the same categories, trending coins, and global market data to accumulate multiple times. This leads to inefficient storage usage, redundant search results, and degraded chatbot response quality.

## Glossary

- **RAG System**: The Retrieval-Augmented Generation system that fetches crypto data, creates embeddings, and stores them in Pinecone vector database
- **Vector Database**: Pinecone database storing document embeddings for semantic search
- **Deduplication**: Process of identifying and removing or preventing duplicate documents based on unique identifiers
- **Document ID**: Unique identifier for each vector in Pinecone, currently timestamp-based causing duplicates
- **Scraper Service**: Service that fetches data from CoinGecko API
- **Vector Service**: Service that manages Pinecone vector database operations
- **Scheduler Service**: Service that automatically triggers data refresh using cron jobs

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want the RAG system to use content-based unique IDs instead of timestamp-based IDs, so that duplicate content is automatically prevented

#### Acceptance Criteria

1. WHEN THE Scraper Service fetches cryptocurrency data, THE RAG System SHALL generate document IDs based on URL or content hash
2. WHEN THE Vector Service upserts documents with existing IDs, THE Pinecone Database SHALL replace old documents instead of creating duplicates
3. THE RAG System SHALL NOT use timestamp-based ID generation for any documents
4. WHEN THE same category or coin data is fetched multiple times, THE Vector Database SHALL contain only one version of that document

### Requirement 2

**User Story:** As a system administrator, I want the RAG refresh process to clean up old data by source before adding new data, so that outdated information is replaced efficiently

#### Acceptance Criteria

1. WHEN THE RAG System starts a refresh operation, THE System SHALL identify all existing documents from the same source
2. BEFORE adding new documents, THE Vector Service SHALL delete all vectors matching the source filter
3. AFTER deletion completes, THE RAG System SHALL add new documents with fresh data
4. THE RAG System SHALL log the number of documents deleted and added for each source

### Requirement 3

**User Story:** As a developer, I want unnecessary manual refresh endpoints removed from the API, so that the system relies on the automated scheduler and reduces API surface area

#### Acceptance Criteria

1. THE RAG Controller SHALL NOT expose the `/refresh/manual` endpoint
2. THE RAG Controller SHALL NOT expose the `/refresh/status` endpoint  
3. THE RAG Controller SHALL retain the `/refresh` endpoint for backward compatibility
4. THE Scheduler Service SHALL remain the primary mechanism for triggering data refreshes

### Requirement 4

**User Story:** As a system administrator, I want the scheduler to trigger refresh operations that properly deduplicate data, so that the vector database stays clean without manual intervention

#### Acceptance Criteria

1. WHEN THE Scheduler Service triggers a daily refresh at 2:00 AM, THE RAG System SHALL execute the improved deduplication logic
2. THE Scheduler Service SHALL prevent concurrent refresh operations using the existing lock mechanism
3. AFTER each scheduled refresh completes, THE System SHALL log statistics showing vectors before and after refresh
4. THE Scheduler Service SHALL handle errors gracefully without leaving partial data

### Requirement 5

**User Story:** As a developer, I want to verify the deduplication improvements work correctly, so that I can confirm duplicate data is eliminated

#### Acceptance Criteria

1. WHEN THE refresh operation completes, THE System SHALL provide statistics showing total vector count
2. WHEN THE same refresh is run multiple times, THE total vector count SHALL remain stable (not continuously increasing)
3. THE System SHALL log detailed information about deduplication operations for debugging
4. WHEN querying the vector database, THE search results SHALL NOT contain duplicate entries for the same category or coin
