# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack cryptocurrency tracking application with a monorepo structure containing:
- **Frontend**: Next.js 15 React application with TypeScript and Tailwind CSS
- **Backend**: NestJS API server with TypeScript
- **Architecture**: Microservices-style with separate frontend/backend workspaces

## Development Commands

### Root Level Commands (Monorepo)
```bash
# Install all dependencies
npm run install:all

# Development (starts both frontend and backend)
npm run dev

# Build both projects
npm run build

# Production start
npm run start

# Lint both projects
npm run lint
```

### Frontend Commands (cd frontend/)
```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

### Backend Commands (cd backend/)
```bash
# Development with hot reload
npm run start:dev

# Production build
npm run build

# Start production server
npm run start:prod

# Lint and fix
npm run lint

# Tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Key Architecture

### Frontend (Next.js App Router)
- **App Router**: Uses Next.js 15 app directory structure
- **Authentication**: Supabase Auth with middleware protection
- **State Management**: React Context for global state
- **API Integration**: Axios for backend communication
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend (NestJS Simplified)
- **Modules**: Simple modular architecture with core features
  - `auth/` - JWT authentication and user management
  - `crypto/` - Cryptocurrency data and pricing
  - `users/` - User management
  - `config/` - Supabase configuration
- **Database**: Supabase PostgreSQL with service role access
- **Validation**: Zod schemas for request validation
- **External APIs**: CoinMarketCap integration

### Environment Configuration

**Frontend** requires `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** requires `.env`:
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
COINMARKETCAP_API_KEY=
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

1. **Setup**: Run `npm run install:all` from root
2. **Development**: Use `npm run dev` to start both services
3. **Testing**: Backend has Jest test suite (`npm run test` in backend/)
4. **Building**: Use `npm run build` for production builds
5. **Linting**: Both projects use ESLint with TypeScript rules

## Key Features

- **Authentication**: Supabase-based with JWT tokens
- **Real-time Data**: Cryptocurrency price tracking
- **User Management**: User profiles and authentication
- **Responsive Design**: Mobile-first Tailwind CSS implementation

## Important Notes

- Frontend runs on port 3000, backend on port 3001
- Uses TypeScript throughout with strict type checking
- Supabase handles database operations and authentication
- CoinMarketCap API provides cryptocurrency data
- Both projects use ESLint for code quality
- Frontend uses Turbopack for faster development builds