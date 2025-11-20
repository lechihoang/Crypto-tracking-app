# Crypto Tracking Full-Stack Application

A modern cryptocurrency tracking application built with Next.js (frontend) and NestJS (backend), featuring an AI-powered chatbot and RAG (Retrieval-Augmented Generation) system.

## 🏗️ Project Structure

```
crypto-tracking-separated/
├── frontend/          # Next.js 15 application with React 19
├── backend/           # NestJS 11 API server
└── README.md         # This file
```

**Note:** This is a monorepo with 2 independent projects. Each project has its own `package.json` and `node_modules`.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- API keys (see Environment Setup section)

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Setup

**Frontend (`frontend/.env.local`):**
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend (`backend/.env`):**
```env
# Auth0 Configuration
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
AUTH0_CALLBACK_URL=http://localhost:3001/api/auth/callback

# MongoDB Database
# Local: mongodb://localhost:27017/crypto-tracking
# Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<cluster>
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<cluster>

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Gmail SMTP (for price alerts)
# Get app password: Google Account > Security > 2-Step Verification > App passwords
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password

# Groq AI API (for chatbot)
# Get free API key: https://console.groq.com/keys
GROQ_API_KEY=your-groq-api-key

# HuggingFace API (for embeddings in RAG)
# Get free API key: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Pinecone API (for vector database in RAG)
# Get free API key: https://app.pinecone.io/
PINECONE_API_KEY=your-pinecone-api-key

# CoinGecko API (for cryptocurrency data)
# Get free Demo API key: https://www.coingecko.com/en/api/pricing
COINGECKO_API_KEY=your-coingecko-api-key
```

### 3. Run Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
# Backend runs at: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs at: http://localhost:3000
```

### 4. Build for Production

**Frontend:**
```bash
cd frontend
npm run build
npm run start
```

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

## ✨ Key Features

### Frontend (Next.js 15 + React 19)
- 🎨 Modern UI with **shadcn/ui** components and Tailwind CSS 4
- 📱 Responsive design for all devices
- 🔐 User authentication with Auth0
- 📊 Interactive charts with Recharts
- 💬 AI Chatbot with real-time chat interface
- 🔔 Notification system with Sonner toast
- ⌨️ Command Palette (Cmd+K / Ctrl+K) for quick navigation
- 🔍 Combobox coin search with keyboard navigation
- ♿ Full accessibility (keyboard navigation, screen reader)
- 🧪 Testing with Vitest and Property-Based Testing (fast-check)

### Backend (NestJS 11)
- 🏗️ Modular architecture with TypeScript
- 📡 RESTful API endpoints
- 🔒 JWT authentication with Auth0
- 📊 Real-time crypto data from **CoinGecko API**
- 🤖 AI Chatbot with **Groq API** (LLM)
- 🧠 **RAG System** (Retrieval-Augmented Generation):
  - Vector database with **Pinecone**
  - Embeddings with **HuggingFace**
  - Web scraping with Puppeteer and Cheerio
- 💼 Portfolio management with value history
- 🔔 Price Alerts with email notifications (Gmail SMTP)
- ⏰ Scheduled tasks with @nestjs/schedule
- 💾 MongoDB with Mongoose
- 🛡️ Input validation with class-validator
- 📝 Comprehensive logging and error handling

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/signup                # Register new user
POST /api/auth/signin                # User login
POST /api/auth/reset-password        # Request password reset
POST /api/auth/change-password       # Change password (authenticated)
```

### Crypto Data
```
GET  /api/crypto/markets             # Market data
GET  /api/crypto/coins/:id           # Coin details
GET  /api/crypto/trending            # Trending coins
GET  /api/crypto/search?query=btc    # Search coins
```

### Portfolio
```
GET    /api/portfolio/holdings       # Get holdings list
POST   /api/portfolio/holdings       # Add new holding
PATCH  /api/portfolio/holdings/:id   # Update holding
DELETE /api/portfolio/holdings/:id   # Delete holding
GET    /api/portfolio/value-history?days=30  # Portfolio value history
```

### Price Alerts
```
GET    /api/alerts                   # Get alerts list
POST   /api/alerts                   # Create new alert
PATCH  /api/alerts/:id/toggle        # Toggle alert on/off
DELETE /api/alerts/:id               # Delete alert
```

### AI Chatbot
```
POST   /api/chatbot/chat             # Send message to chatbot
GET    /api/chatbot/history          # Get conversation history
DELETE /api/chatbot/conversation/:id # Delete conversation
```

### RAG System
```
POST /api/rag/search                 # Search documents
POST /api/rag/seed                   # Seed RAG data (admin)
GET  /api/rag/test/*                 # Test endpoints (dev only)
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router) with Turbopack
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Notifications:** Sonner
- **Icons:** Lucide React, React Icons
- **Authentication:** Auth0 SPA JS
- **HTTP Client:** Axios
- **Testing:** Vitest, Testing Library, fast-check (PBT)

### Backend
- **Framework:** NestJS 11
- **Language:** TypeScript 5
- **Database:** MongoDB with Mongoose
- **Vector DB:** Pinecone
- **Authentication:** Auth0, JWT, Passport
- **Validation:** class-validator, class-transformer
- **AI/ML:** 
  - Groq API (LLM for chatbot)
  - HuggingFace (embeddings)
- **APIs:** CoinGecko API
- **Email:** Nodemailer (Gmail SMTP)
- **Web Scraping:** Puppeteer, Cheerio
- **Caching:** node-cache
- **Scheduling:** @nestjs/schedule
- **Security:** Helmet, CORS, Throttler
- **Testing:** Jest, Supertest

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md) - Details about Next.js app, shadcn/ui components, testing
- [Backend Documentation](./backend/README.md) - Details about NestJS API, RAG system, scheduled tasks

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### Backend
```bash
cd backend
npm test              # Unit tests
npm run test:cov      # Coverage report
npm run test:e2e      # E2E tests
```

## 📦 Directory Structure

### Frontend
```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (AuthContext)
│   ├── lib/             # Utilities and API client
│   ├── test/            # Test files (Vitest)
│   └── types/           # TypeScript type definitions
└── public/              # Static assets
```

### Backend
```
backend/
├── src/
│   ├── alerts/          # Price alerts module
│   ├── auth/            # Authentication module
│   ├── chatbot/         # AI chatbot module
│   ├── crypto/          # Crypto data module
│   ├── portfolio/       # Portfolio management module
│   ├── rag/             # RAG system module
│   ├── user/            # User management module
│   ├── common/          # Shared utilities
│   ├── schemas/         # MongoDB schemas
│   └── main.ts          # Application entry point
└── test/                # E2E tests
```

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Backend (Railway/Render/DigitalOcean)
1. Configure production environment variables
2. Build: `npm run build`
3. Start: `npm run start:prod`
4. Ensure MongoDB Atlas and API keys are configured

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License

## 🙏 Acknowledgments

- [CoinGecko API](https://www.coingecko.com/en/api) - Free crypto market data
- [Groq](https://groq.com/) - Fast LLM inference
- [Pinecone](https://www.pinecone.io/) - Vector database
- [Auth0](https://auth0.com) - Authentication platform
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Next.js](https://nextjs.org) and [NestJS](https://nestjs.com) teams

---