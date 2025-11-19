# Manual Testing Guide - Backend Refactoring Validation

## Overview
This document provides a comprehensive guide for manually testing all critical flows after the backend refactoring. Each test includes the endpoint, expected behavior, and validation criteria.

## Prerequisites
1. Backend server running: `npm run start:dev`
2. MongoDB connection active
3. Pinecone vector database accessible
4. Auth0 configured
5. Environment variables properly set

## Test Status Legend
- ✅ Pass
- ❌ Fail
- ⏳ Pending

---

## 1. User Authentication Flow

### 1.1 User Registration
**Endpoint:** `POST /api/auth/signup`

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "name": "Test User"
}
```

**Expected Result:**
- Status: 201 Created
- Response contains: `{ accessToken, user: { id, email, name } }`
- User created in MongoDB

**Validation:**
- [ ] User can register with valid credentials
- [ ] Duplicate email returns 409 Conflict
- [ ] Weak password returns 400 Bad Request
- [ ] Invalid email format returns 400 Bad Request

---

### 1.2 User Login
**Endpoint:** `POST /api/auth/signin`

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Expected Result:**
- Status: 200 OK
- Response contains: `{ accessToken, user: { id, email, name } }`

**Validation:**
- [ ] User can login with correct credentials
- [ ] Wrong password returns 401 Unauthorized
- [ ] Non-existent email returns 401 Unauthorized

---

### 1.3 Password Reset
**Endpoint:** `POST /api/auth/reset-password`

**Test Data:**
```json
{
  "email": "test@example.com"
}
```

**Expected Result:**
- Status: 200 OK
- Password reset email sent

**Validation:**
- [ ] Reset email sent for valid email
- [ ] Returns success even for non-existent email (security)

---

### 1.4 Change Password
**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Test Data:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Expected Result:**
- Status: 200 OK
- Password updated successfully

**Validation:**
- [ ] Password changes with correct current password
- [ ] Wrong current password returns 401 Unauthorized
- [ ] Requires authentication token

---

## 2. Portfolio Management

### 2.1 Get Portfolio Holdings
**Endpoint:** `GET /api/portfolio/holdings`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Array of holdings with coin info populated

**Validation:**
- [ ] Returns user's holdings
- [ ] Coin information is populated (name, symbol, price)
- [ ] Requires authentication

---

### 2.2 Add Holding
**Endpoint:** `POST /api/portfolio/holdings`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Test Data:**
```json
{
  "coinId": "bitcoin",
  "amount": 0.5,
  "purchasePrice": 45000
}
```

**Expected Result:**
- Status: 201 Created
- Holding created and returned

**Validation:**
- [ ] Holding added successfully
- [ ] Duplicate coinId updates existing holding
- [ ] Invalid coinId returns 400 Bad Request
- [ ] Negative amount returns 400 Bad Request

---

### 2.3 Update Holding
**Endpoint:** `PATCH /api/portfolio/holdings/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Test Data:**
```json
{
  "amount": 1.0,
  "purchasePrice": 46000
}
```

**Expected Result:**
- Status: 200 OK
- Holding updated

**Validation:**
- [ ] Holding updates successfully
- [ ] Non-existent ID returns 404 Not Found
- [ ] Cannot update other user's holdings

---

### 2.4 Delete Holding
**Endpoint:** `DELETE /api/portfolio/holdings/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Holding deleted

**Validation:**
- [ ] Holding deletes successfully
- [ ] Non-existent ID returns 404 Not Found
- [ ] Cannot delete other user's holdings

---

### 2.5 Get Portfolio Value History
**Endpoint:** `GET /api/portfolio/value-history?days=30`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Array of historical portfolio values

**Validation:**
- [ ] Returns value history for 7 days
- [ ] Returns value history for 30 days
- [ ] Returns value history for 90 days
- [ ] Handles empty portfolio gracefully
- [ ] Error handling works when CoinGecko API fails

---

## 3. Price Alerts

### 3.1 Get User Alerts
**Endpoint:** `GET /api/alerts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Array of user's alerts

**Validation:**
- [ ] Returns user's alerts only
- [ ] Includes coin information
- [ ] Shows alert status (active/triggered)

---

### 3.2 Create Alert
**Endpoint:** `POST /api/alerts`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Test Data:**
```json
{
  "coinId": "bitcoin",
  "targetPrice": 50000,
  "condition": "above"
}
```

**Expected Result:**
- Status: 201 Created
- Alert created

**Validation:**
- [ ] Alert created with "above" condition
- [ ] Alert created with "below" condition
- [ ] Invalid coinId returns 400 Bad Request
- [ ] Negative price returns 400 Bad Request

---

### 3.3 Toggle Alert
**Endpoint:** `PATCH /api/alerts/:id/toggle`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Alert status toggled

**Validation:**
- [ ] Active alert becomes inactive
- [ ] Inactive alert becomes active
- [ ] Non-existent ID returns 404 Not Found

---

### 3.4 Delete Alert
**Endpoint:** `DELETE /api/alerts/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Alert deleted

**Validation:**
- [ ] Alert deletes successfully
- [ ] Non-existent ID returns 404 Not Found
- [ ] Cannot delete other user's alerts

---

### 3.5 Alert Scheduler
**Manual Test:**
1. Create an alert with target price close to current price
2. Wait for scheduler to run (every 5 minutes)
3. Check if email notification sent when price crosses threshold

**Validation:**
- [ ] Scheduler runs periodically
- [ ] Alerts triggered when conditions met
- [ ] Email notifications sent
- [ ] Alert marked as triggered
- [ ] Proper logging in console

---

## 4. Chatbot Functionality

### 4.1 Send Message (Authenticated User)
**Endpoint:** `POST /api/chatbot/chat`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Test Data:**
```json
{
  "message": "What is Bitcoin?"
}
```

**Expected Result:**
- Status: 200 OK
- Response contains AI-generated answer with RAG context

**Validation:**
- [ ] Returns relevant answer
- [ ] Conversation saved to database
- [ ] RAG context included in response
- [ ] Conversation history maintained

---

### 4.2 Send Message (Guest User)
**Endpoint:** `POST /api/chatbot/chat`

**Test Data:**
```json
{
  "message": "Tell me about Ethereum"
}
```

**Expected Result:**
- Status: 200 OK
- Response contains AI-generated answer

**Validation:**
- [ ] Works without authentication
- [ ] Returns relevant answer
- [ ] No conversation saved (guest mode)

---

### 4.3 Get Conversation History
**Endpoint:** `GET /api/chatbot/history`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Array of user's conversations

**Validation:**
- [ ] Returns user's conversation history
- [ ] Ordered by most recent first
- [ ] Includes message content and timestamps

---

### 4.4 Clear Conversation
**Endpoint:** `DELETE /api/chatbot/conversation/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Expected Result:**
- Status: 200 OK
- Conversation deleted

**Validation:**
- [ ] Conversation deletes successfully
- [ ] Cannot delete other user's conversations

---

## 5. RAG Search

### 5.1 Search Documents
**Endpoint:** `POST /api/rag/search`

**Test Data:**
```json
{
  "query": "What is DeFi?",
  "topK": 5
}
```

**Expected Result:**
- Status: 200 OK
- Array of relevant documents with scores

**Validation:**
- [ ] Returns relevant documents
- [ ] Documents sorted by relevance score
- [ ] Handles empty results gracefully
- [ ] Error handling when Pinecone fails

---

### 5.2 Seed RAG Data
**Endpoint:** `POST /api/rag/seed`

**Expected Result:**
- Status: 200 OK
- Data seeded successfully

**Validation:**
- [ ] CoinGecko data scraped
- [ ] Documents embedded
- [ ] Vectors upserted to Pinecone
- [ ] Old documents cleaned up
- [ ] Proper logging throughout process

---

### 5.3 Test Endpoints (Development Only)
**Endpoints:**
- `GET /api/rag/test/embedding`
- `GET /api/rag/test/pinecone`
- `GET /api/rag/test/coingecko`

**Expected Result:**
- Status: 200 OK in development
- Status: 403 Forbidden in production

**Validation:**
- [ ] Endpoints work in development
- [ ] Endpoints blocked in production
- [ ] Development guard working correctly

---

## 6. Crypto Data

### 6.1 Get Trending Coins
**Endpoint:** `GET /api/crypto/trending`

**Expected Result:**
- Status: 200 OK
- Array of trending coins

**Validation:**
- [ ] Returns trending coins from CoinGecko
- [ ] Data cached appropriately
- [ ] Error handling when API fails

---

### 6.2 Get Coin Details
**Endpoint:** `GET /api/crypto/coins/:id`

**Expected Result:**
- Status: 200 OK
- Detailed coin information

**Validation:**
- [ ] Returns complete coin data
- [ ] Invalid coinId returns 404 Not Found
- [ ] Data cached appropriately

---

### 6.3 Get Market Data
**Endpoint:** `GET /api/crypto/markets?page=1&perPage=50`

**Expected Result:**
- Status: 200 OK
- Array of market data

**Validation:**
- [ ] Returns paginated market data
- [ ] Pagination works correctly
- [ ] Data cached appropriately

---

### 6.4 Search Coins
**Endpoint:** `GET /api/crypto/search?query=bitcoin`

**Expected Result:**
- Status: 200 OK
- Array of matching coins

**Validation:**
- [ ] Returns relevant search results
- [ ] Handles empty query
- [ ] Data cached appropriately

---

## 7. Error Handling Validation

### 7.1 Global Exception Filter
**Test various error scenarios:**

**Validation:**
- [ ] 400 Bad Request - Invalid input data
- [ ] 401 Unauthorized - Missing/invalid token
- [ ] 403 Forbidden - Insufficient permissions
- [ ] 404 Not Found - Resource not found
- [ ] 409 Conflict - Duplicate resource
- [ ] 422 Unprocessable Entity - Business logic error
- [ ] 500 Internal Server Error - Unexpected errors
- [ ] 503 Service Unavailable - External service down

**Check:**
- [ ] Consistent error response format
- [ ] Helpful error messages
- [ ] Proper logging of errors
- [ ] Stack traces in development only

---

### 7.2 Error Logging Middleware
**Validation:**
- [ ] All errors logged with context
- [ ] Request information included in logs
- [ ] Sensitive data not logged
- [ ] Log levels appropriate (error, warn, info)

---

## 8. Performance Checks

### 8.1 Response Times
**Measure response times for critical endpoints:**

**Validation:**
- [ ] `/api/crypto/markets` < 500ms
- [ ] `/api/portfolio/holdings` < 300ms
- [ ] `/api/portfolio/value-history` < 2000ms
- [ ] `/api/chatbot/chat` < 5000ms
- [ ] `/api/rag/search` < 1000ms

---

### 8.2 Caching
**Validation:**
- [ ] CoinGecko API responses cached
- [ ] Cache invalidation works
- [ ] Cache reduces API calls

---

## 9. Logging Validation

### 9.1 Service Logging
**Check logs for:**

**Validation:**
- [ ] No console.log statements (replaced with Logger)
- [ ] Appropriate log levels used
- [ ] Contextual information included
- [ ] Error stack traces logged
- [ ] Performance metrics logged where appropriate

---

## 10. Code Quality Checks

### 10.1 Linting
**Run:** `npm run lint`

**Validation:**
- [ ] No linting errors
- [ ] Code follows style guide
- [ ] No unused imports

---

### 10.2 Build
**Run:** `npm run build`

**Validation:**
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] Dist folder generated

---

## Test Execution Summary

### Date: _______________
### Tester: _______________

| Category | Total Tests | Passed | Failed | Notes |
|----------|-------------|--------|--------|-------|
| Authentication | | | | |
| Portfolio | | | | |
| Alerts | | | | |
| Chatbot | | | | |
| RAG | | | | |
| Crypto Data | | | | |
| Error Handling | | | | |
| Performance | | | | |
| Logging | | | | |
| Code Quality | | | | |

### Critical Issues Found:
1. 
2. 
3. 

### Recommendations:
1. 
2. 
3. 

---

## Notes
- All tests should be performed in both development and production environments
- Document any unexpected behavior
- Take screenshots of errors for debugging
- Monitor server logs during testing
