# API Endpoints Baseline Documentation

**Date:** November 19, 2025
**Purpose:** Document all API endpoints before backend refactoring

## Base URL
- Development: `http://localhost:3001/api`
- Production: `${process.env.BACKEND_URL}/api`

## Authentication Endpoints (`/api/auth`)

### POST /auth/signup
- **Description:** Register a new user
- **Body:** `SignUpDto` (email, password, name)
- **Response:** User registration result
- **Auth Required:** No

### POST /auth/signin
- **Description:** Sign in existing user
- **Body:** `SignInDto` (email, password)
- **Response:** User info (tokens set in HttpOnly cookies)
- **Auth Required:** No
- **Cookies Set:** `auth_token`, `id_token`

### POST /auth/reset-password
- **Description:** Request password reset email
- **Body:** `ResetPasswordDto` (email)
- **Response:** Success message
- **Auth Required:** No

### POST /auth/update-password
- **Description:** Update password with reset token
- **Body:** `UpdatePasswordDto` (token, newPassword)
- **Response:** Success message
- **Auth Required:** No

### POST /auth/change-password
- **Description:** Change password for authenticated user
- **Body:** `ChangePasswordDto` (currentPassword, newPassword)
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Success message
- **Auth Required:** Yes

### GET /auth/me
- **Description:** Get current user profile
- **Decorator:** `@AuthToken()`
- **Response:** User profile data
- **Auth Required:** Yes

### POST /auth/logout
- **Description:** Logout user and clear cookies
- **Response:** Success message
- **Cookies Cleared:** `auth_token`, `id_token`
- **Auth Required:** No

### GET /auth/google
- **Description:** Initiate Google OAuth login
- **Response:** Redirect to Auth0 Google login
- **Auth Required:** No

### GET /auth/callback
- **Description:** OAuth callback handler
- **Query Params:** `code`, `error`
- **Response:** Redirect to frontend with user info or error
- **Auth Required:** No

## Crypto Endpoints (`/api/crypto`)

### POST /crypto/prices
- **Description:** Get prices for multiple coins
- **Body:** `{ coinIds: string[] }`
- **Response:** `Record<string, CoinPrice>`
- **Auth Required:** No

### GET /crypto/top
- **Description:** Get top cryptocurrencies
- **Query Params:** `limit` (default: 10), `page` (default: 1)
- **Response:** `CoinData[]`
- **Auth Required:** No

### GET /crypto/search
- **Description:** Search for cryptocurrencies
- **Query Params:** `q` (search query)
- **Response:** `SearchResult[]`
- **Auth Required:** No

### GET /crypto/news/latest
- **Description:** Get latest crypto news
- **Query Params:** `limit` (default: 10)
- **Response:** `NewsArticle[]`
- **Auth Required:** No

### GET /crypto/:coinId/history
- **Description:** Get price history for a coin
- **Path Params:** `coinId`
- **Query Params:** `days` (default: 7)
- **Response:** `PriceHistory`
- **Auth Required:** No

### GET /crypto/:coinId/market
- **Description:** Get market data for a coin
- **Path Params:** `coinId`
- **Response:** `CoinData | null`
- **Auth Required:** No

### GET /crypto/:coinId
- **Description:** Get detailed information for a coin
- **Path Params:** `coinId`
- **Response:** `CoinDetails`
- **Auth Required:** No

## Alerts Endpoints (`/api/alerts`)

### POST /alerts
- **Description:** Create a new price alert
- **Body:** `CreateAlertDto` (coinId, targetPrice, condition)
- **Decorator:** `@AuthToken()`
- **Response:** Created alert
- **Auth Required:** Yes

### GET /alerts
- **Description:** Get all alerts for current user
- **Decorator:** `@AuthToken()`
- **Response:** Array of user's alerts
- **Auth Required:** Yes

### GET /alerts/triggered
- **Description:** Get triggered alerts for current user
- **Decorator:** `@AuthToken()`
- **Response:** Array of triggered alerts
- **Auth Required:** Yes

### DELETE /alerts/:id
- **Description:** Delete a specific alert
- **Path Params:** `id` (alertId)
- **Decorator:** `@AuthToken()`
- **Response:** Success message
- **Auth Required:** Yes

### PATCH /alerts/:id/toggle
- **Description:** Toggle alert enabled/disabled status
- **Path Params:** `id` (alertId)
- **Decorator:** `@AuthToken()`
- **Response:** Success message
- **Auth Required:** Yes

## Portfolio Endpoints (`/api/portfolio`)

### GET /portfolio
- **Description:** Get user's portfolio holdings
- **Decorator:** `@AuthToken()`
- **Response:** Array of holdings with current values
- **Auth Required:** Yes

### POST /portfolio
- **Description:** Add a new holding to portfolio
- **Body:** `CreateHoldingDto` (coinId, amount, purchasePrice)
- **Decorator:** `@AuthToken()`
- **Response:** Created holding
- **Auth Required:** Yes

### PATCH /portfolio/:id
- **Description:** Update an existing holding
- **Path Params:** `id` (holdingId)
- **Body:** `UpdateHoldingDto` (amount, purchasePrice)
- **Decorator:** `@AuthToken()`
- **Response:** Updated holding
- **Auth Required:** Yes

### DELETE /portfolio/:id
- **Description:** Delete a holding from portfolio
- **Path Params:** `id` (holdingId)
- **Decorator:** `@AuthToken()`
- **Response:** Success message
- **Auth Required:** Yes

### GET /portfolio/value-history
- **Description:** Get portfolio value history over time
- **Query Params:** `days` (default: 30)
- **Decorator:** `@AuthToken()`
- **Response:** Array of portfolio values by date
- **Auth Required:** Yes

## Chatbot Endpoints (`/api/chatbot`)

### POST /chatbot/chat
- **Description:** Send a message to the AI chatbot
- **Body:** `ChatMessageDto` (message, conversationId?)
- **Decorator:** `@AuthToken()` (optional - works for guests too)
- **Response:** AI response with conversationId
- **Auth Required:** No (but enhanced with user context if authenticated)

### GET /chatbot/history
- **Description:** Get chat history for authenticated user
- **Decorator:** `@AuthToken()`
- **Response:** Array of past conversations
- **Auth Required:** Yes

## RAG Endpoints (`/api/rag`)

### POST /rag/search
- **Description:** Search for similar documents in vector database
- **Body:** `{ query: string, topK?: number }`
- **Response:** Array of similar documents with scores
- **Auth Required:** No

### POST /rag/seed
- **Description:** Seed RAG database with crypto data
- **Response:** Success message with count of documents added
- **Auth Required:** No (should be protected in production)

### GET /rag/test/embedding
- **Description:** Test embedding service
- **Response:** Test results
- **Auth Required:** No (development only)

### GET /rag/test/pinecone
- **Description:** Test Pinecone connection
- **Response:** Test results
- **Auth Required:** No (development only)

### GET /rag/test/coingecko
- **Description:** Test CoinGecko API
- **Response:** Test results
- **Auth Required:** No (development only)

## User Endpoints (`/api/user`)

### GET /user/profile
- **Description:** Get user profile
- **Decorator:** `@AuthToken()`
- **Response:** User profile data
- **Auth Required:** Yes

### PATCH /user/profile
- **Description:** Update user profile
- **Body:** Profile update data
- **Decorator:** `@AuthToken()`
- **Response:** Updated profile
- **Auth Required:** Yes

### PATCH /user/preferences
- **Description:** Update user preferences (e.g., email notifications)
- **Body:** Preferences data
- **Decorator:** `@AuthToken()`
- **Response:** Updated preferences
- **Auth Required:** Yes

## Notes

### Authentication
- Most endpoints use `@AuthToken()` decorator to extract JWT from Authorization header or cookies
- Tokens are stored in HttpOnly cookies for security
- Guest access is supported for some endpoints (crypto data, chatbot)

### Rate Limiting
- Global rate limit: 100 requests per minute per IP
- Configured via ThrottlerModule in app.module.ts

### Error Handling
- Standard NestJS exception filters
- HTTP status codes follow REST conventions
- Validation errors return 400 Bad Request
- Auth errors return 401 Unauthorized

### External Services
- **Auth0:** User authentication and management
- **CoinGecko API:** Cryptocurrency data
- **Pinecone:** Vector database for RAG
- **Groq API:** AI chatbot responses
- **MongoDB:** Primary database
- **Nodemailer:** Email notifications
