# Design Document

## Overview

This design addresses the data duplication problem in the RAG system by implementing content-based unique identifiers, source-based cleanup before refresh, and removing unnecessary manual endpoints. The solution ensures that the vector database maintains only one version of each cryptocurrency data point, preventing accumulation of duplicate information over time.

## Architecture

### Current Flow (Problematic)
```
Scheduler (2AM daily) → refreshCryptoData()
  ↓
getAllCoinGeckoData() → [categories, trending, global]
  ↓
addMultipleDocuments() → Generate ID: `${source}-${Date.now()}-${i}-${j}`
  ↓
upsertDocuments() → Pinecone (creates NEW vectors every time)
  ↓
deleteOldDocuments(30 days) → Only deletes if publishedAt > 30 days
```

**Problem**: New IDs every time → Pinecone treats as new documents → Duplicates accumulate

### Improved Flow (Solution)
```
Scheduler (2AM daily) → refreshCryptoData()
  ↓
getAllCoinGeckoData() → [categories, trending, global]
  ↓
deleteBySource() → Remove ALL existing vectors from each source
  ↓
addMultipleDocuments() → Generate ID: hash(URL) or sanitized URL
  ↓
upsertDocuments() → Pinecone (replaces if ID exists)
  ↓
Log statistics (before/after counts)
```

**Solution**: Content-based IDs + source cleanup → No duplicates

## Components and Interfaces

### 1. Vector Service Changes

**New Method: `deleteBySource()`**
```typescript
async deleteBySource(source: string): Promise<number>
```
- Deletes all vectors matching the source metadata filter
- Returns count of deleted vectors
- Used before adding fresh data from the same source

**Modified Method: `upsertDocuments()`**
- No changes needed (already supports upsert by ID)
- Will replace existing documents if ID matches

**Remove Method: `deleteOldDocuments()`**
- No longer needed with source-based cleanup approach
- Can be removed or kept for backward compatibility

### 2. RAG Service Changes

**Modified Method: `refreshCryptoData()`**
```typescript
async refreshCryptoData(): Promise<void> {
  // 1. Fetch new data
  const content = await this.scraperService.getAllCoinGeckoData();
  
  // 2. Group by source
  const bySource = this.groupBySource(content);
  
  // 3. For each source: delete old → add new
  for (const [source, items] of Object.entries(bySource)) {
    const deletedCount = await this.vectorService.deleteBySource(source);
    await this.addMultipleDocuments(items);
    // Log stats
  }
}
```

**New Helper Method: `groupBySource()`**
```typescript
private groupBySource(contents: ScrapedContent[]): Record<string, ScrapedContent[]>
```
- Groups documents by their source field
- Returns map of source → documents

**Modified Method: `addMultipleDocuments()`**
- Change ID generation from timestamp-based to URL-based
- Use `generateDocumentId(url, chunkIndex)` helper

**New Helper Method: `generateDocumentId()`**
```typescript
private generateDocumentId(url: string, chunkIndex: number = 0): string {
  // Create stable ID from URL + chunk index
  // Example: "coingecko-categories-defi-0"
  const urlHash = url.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `${urlHash}-${chunkIndex}`;
}
```

### 3. RAG Controller Changes

**Remove Endpoints:**
- `POST /rag/refresh/manual` - Not needed, use scheduler
- `GET /rag/refresh/status` - Not needed, check logs instead

**Keep Endpoints:**
- `POST /rag/refresh` - Keep for backward compatibility and manual testing
- All other existing endpoints remain unchanged

### 4. Scheduler Service Changes

**No changes needed** - Already has:
- Daily cron job at 2AM
- Concurrent execution prevention
- Error handling and logging

The improved `refreshCryptoData()` will be called automatically.

## Data Models

### Document ID Format

**Old (Problematic):**
```
"CoinGecko API - Categories-1732032474123-0-0"
"CoinGecko API - Categories-1732032474123-0-1"
```
- Includes timestamp → Always unique → Duplicates

**New (Solution):**
```
"coingecko-categories-decentralized-finance-defi-0"
"coingecko-categories-decentralized-finance-defi-1"
"coingecko-trending-bitcoin-0"
"coingecko-global-market-overview-0"
```
- Based on URL/content → Stable → No duplicates
- Chunk index appended for multi-chunk documents

### Source Metadata Values

Documents are grouped by these source values:
- `"CoinGecko API - Categories"`
- `"CoinGecko API - Trending"`
- `"CoinGecko API - Global"`

## Error Handling

### Deletion Failures
- If `deleteBySource()` fails, log error but continue with upsert
- Upsert will still replace duplicates due to stable IDs
- Prevents blocking the entire refresh operation

### Partial Refresh Failures
- If one source fails (e.g., Categories), continue with others
- Log which sources succeeded/failed
- Return summary of operations

### Concurrent Refresh Prevention
- Existing `isRefreshing` flag in scheduler prevents concurrent runs
- No changes needed

## Testing Strategy

### Unit Tests
1. Test `generateDocumentId()` produces stable IDs
2. Test `groupBySource()` correctly groups documents
3. Test `deleteBySource()` with Pinecone mock
4. Test ID generation doesn't include timestamps

### Integration Tests
1. Run refresh twice, verify vector count stays same
2. Verify old documents are replaced, not duplicated
3. Test that search results don't contain duplicates
4. Verify each source has expected document count

### Manual Testing
1. Check initial vector count
2. Run refresh operation
3. Check vector count after refresh
4. Run refresh again
5. Verify count remains stable (±few vectors for trending data)
6. Query for a category, verify only one result

## Migration Strategy

### Phase 1: Deploy Code Changes
- Deploy updated services with new deduplication logic
- Old duplicates remain in database temporarily

### Phase 2: Clean Existing Duplicates
- Run refresh operation once
- New logic will replace all documents with stable IDs
- Old timestamp-based documents will remain orphaned

### Phase 3: Optional Cleanup
- Can manually delete all vectors and re-seed
- Or let old documents expire naturally (they won't be updated)
- Recommended: Clear and re-seed for clean slate

### Rollback Plan
- If issues occur, revert code changes
- Old logic will continue working (just with duplicates)
- No data loss risk

## Performance Considerations

### Deletion Performance
- Pinecone `deleteMany()` with filter is efficient
- Deleting ~100 categories takes <1 second
- Much faster than checking each document individually

### ID Generation Performance
- String manipulation is fast (microseconds)
- No hashing needed, simple URL sanitization
- Negligible impact on refresh time

### Storage Savings
- Current: ~2,178 vectors (with duplicates)
- Expected after fix: ~110-120 vectors (categories + trending + global)
- ~95% reduction in storage usage
- Faster search queries due to smaller index

## Monitoring and Logging

### Log Messages to Add
```
[RAG Refresh] Starting refresh for source: CoinGecko API - Categories
[RAG Refresh] Deleted 100 old vectors from source: CoinGecko API - Categories
[RAG Refresh] Added 98 new vectors for source: CoinGecko API - Categories
[RAG Refresh] Completed. Total vectors: 115 (was 2178)
```

### Metrics to Track
- Vector count before/after refresh
- Number of vectors deleted per source
- Number of vectors added per source
- Refresh operation duration
- Any errors during deletion or upsert
