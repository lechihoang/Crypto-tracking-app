# Implementation Plan

- [x] 1. Add deleteBySource method to VectorService
  - Implement `deleteBySource(source: string)` method that uses Pinecone filter to delete vectors
  - Return count of deleted vectors for logging
  - Add error handling for deletion failures
  - _Requirements: 2.1, 2.2_

- [x] 2. Implement stable ID generation in RAG Service
  - [x] 2.1 Create `generateDocumentId(url: string, chunkIndex: number)` helper method
    - Sanitize URL to create stable, filesystem-safe ID
    - Append chunk index for multi-chunk documents
    - Ensure no timestamps are used in ID generation
    - _Requirements: 1.1, 1.3_
  
  - [x] 2.2 Update `addMultipleDocuments()` to use new ID generation
    - Replace timestamp-based ID with `generateDocumentId()` call
    - Pass URL and chunk index to generate stable IDs
    - _Requirements: 1.1, 1.2_

- [x] 3. Implement source-based cleanup in RAG Service
  - [x] 3.1 Create `groupBySource()` helper method
    - Group ScrapedContent array by source field
    - Return Record<string, ScrapedContent[]>
    - _Requirements: 2.1_
  
  - [x] 3.2 Refactor `refreshCryptoData()` to delete before adding
    - Group fetched content by source
    - For each source: call deleteBySource(), then addMultipleDocuments()
    - Log statistics (deleted count, added count, total vectors)
    - _Requirements: 2.2, 2.3, 2.4, 4.3_
  
  - [x] 3.3 Remove or deprecate `deleteOldDocuments()` call
    - Remove the 30-day cleanup logic as it's no longer needed
    - Source-based cleanup replaces this approach
    - _Requirements: 2.2_

- [x] 4. Remove unnecessary endpoints from RAG Controller
  - Remove `POST /rag/refresh/manual` endpoint and its handler method
  - Remove `GET /rag/refresh/status` endpoint and its handler method
  - Keep `POST /rag/refresh` for backward compatibility
  - Update any imports or dependencies
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Verify scheduler integration
  - Confirm scheduler calls the updated `refreshCryptoData()` method
  - Verify concurrent execution prevention still works
  - Check error handling and logging in scheduler
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 6. Test deduplication functionality
  - [x] 6.1 Clear existing vectors for clean test
    - Call `/rag/clear` endpoint to remove all existing vectors
    - Verify vector count is 0
    - _Requirements: 5.1_
  
  - [x] 6.2 Run initial refresh and verify vector count
    - Trigger refresh via scheduler or `/rag/refresh` endpoint
    - Check vector count via `/rag/stats`
    - Expected: ~110-120 vectors (categories + trending + global)
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.3 Run second refresh and verify no duplicates
    - Trigger refresh again
    - Check vector count remains stable (±few for trending data)
    - Verify count doesn't continuously increase
    - _Requirements: 5.2, 5.4_
  
  - [x] 6.4 Verify search results have no duplicates
    - Search for a known category (e.g., "DeFi")
    - Confirm only one result for each unique category
    - Check that results are recent and accurate
    - _Requirements: 5.4_

- [x] 7. Trigger scheduler manually to test end-to-end flow
  - Manually invoke the scheduler's `triggerManualRefresh()` method or wait for scheduled run
  - Monitor logs for deduplication statistics
  - Verify vector database stats before and after
  - Confirm no errors in scheduler execution
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3_
