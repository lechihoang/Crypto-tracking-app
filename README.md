# Crypto Tracking Full-Stack Application

A modern cryptocurrency tracking application built with Next.js frontend and NestJS backend, featuring an AI-powered chatbot.

## 🏗️ Project Structure

```
crypto-tracking/
├── frontend/          # Next.js React application
├── backend/           # NestJS API server
├── package.json       # Root scripts and workspace config
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Install Dependencies
```bash
# Install all dependencies for both projects
npm run install:all

# Or install separately:
npm run install:frontend
npm run install:backend
```

### 2. Environment Setup

**Frontend (.env.local):**
```env
# Supabase Config
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend (.env):**
```env
# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# APIs
COINMARKETCAP_API_KEY=your-coinmarketcap-key

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Development

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:frontend  # Frontend: http://localhost:3000
npm run dev:backend   # Backend: http://localhost:3001
```

### 4. Production Build

```bash
# Build both projects
npm run build

# Or build separately:
npm run build:frontend
npm run build:backend
```

### 5. Production Start

```bash
# Start both in production mode
npm run start
```

## 📋 Features

### Frontend (Next.js)
- 🎨 Modern React UI with Tailwind CSS
- 📱 Responsive design
- 🔐 Authentication with Supabase
- 📊 Interactive charts and data visualization
- 🌙 Dark/Light theme support

### Backend (NestJS)
- 🏗️ Simple modular architecture with TypeScript
- 📡 RESTful API endpoints
- 🔒 JWT authentication with Supabase
- 📊 Real-time crypto data from CoinMarketCap
- 🛡️ Input validation with Zod

## 🔧 API Endpoints

### Crypto API
```
GET  /api/crypto/top?limit=10        # Top cryptocurrencies
POST /api/crypto/prices              # Get specific coin prices
GET  /api/crypto/search?q=bitcoin    # Search coins
GET  /api/crypto/coin/:id            # Detailed coin info
```

### Authentication
```
POST /api/auth/login                 # User login
POST /api/auth/register              # User registration
POST /api/auth/forgot-password       # Password reset
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Authentication:** Supabase Auth

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Validation:** Zod
- **Authentication:** JWT + Passport
- **APIs:** CoinMarketCap

## 📚 Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)
- [API Documentation](./backend/docs/api.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko API](https://coingecko.com/api) for free crypto data
- [Google Gemini AI](https://ai.google.dev) for chatbot intelligence
- [Supabase](https://supabase.com) for authentication and database
- [Next.js](https://nextjs.org) and [NestJS](https://nestjs.com) teams