# 🚀 BuffByte - AI-Powered Content Analysis Platform

A production-ready Node.js/TypeScript backend for AI-powered content analysis and dashboard insights. Built with Anthropic's Claude API, MongoDB, and intelligent caching.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-green.svg)](https://www.mongodb.com/)
[![Anthropic](https://img.shields.io/badge/Anthropic-Claude-orange.svg)](https://anthropic.com/)

## 🎯 What is BuffByte?

BuffByte is an AI-powered content analysis platform that helps users understand and analyze text and video content using advanced AI models. It provides intelligent insights, trend analysis, and dashboard analytics with a freemium business model.

### ✨ Key Features

**🤖 AI Content Analysis**
- Text and video content analysis using Anthropic's Claude
- Smart caching to optimize API usage and costs
- Trial-based system (5 free analyses per day)
- Rate limiting for resource management

**📊 Dashboard Intelligence**
- AI-generated trend analysis with web search capabilities
- Real-time insights and business intelligence
- Intelligent caching (1-hour memory, 10-hour persistence)

**🔐 User Management**
- JWT-based authentication with refresh tokens
- Role-based access control (user/admin/moderator)
- Trial limit tracking and management

**⚡ Performance & Caching**
- Multi-level caching (memory + database)
- Intelligent cache invalidation
- MongoDB-based persistence
- Background job processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 7.0+
- Anthropic API key

### 1. Installation
```bash
git clone <your-repo>
cd BuffByte-backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Core Settings
NODE_ENV=development
PORT=3000
DB_TYPE=mongodb

# Database
MONGODB_URI=mongodb://localhost:27017/buffer_lyte
MONGODB_DB_NAME=buffer_lyte

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# AI Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
ANTHROPIC_USE_MOCK_DATA=false

# Trial Limits
CONTENT_TRIAL_LIMIT=5

# Prompts (customize as needed)
CONTENT_SYSTEM_PROMPT=You are an expert content analyzer...
CONTENT_USER_PROMPT=Analyze this content: {{CONTENT}}
```

### 3. Database Setup
```bash
# Start MongoDB locally
brew services start mongodb-community
# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 4. Run the Application
```bash
# Development with hot reload
npm run dev

# Production build and start
npm run build && npm start

# Run tests
npm test
```

Visit `http://localhost:3000/health` to verify the installation.

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login

### Content Analysis
- `POST /api/v1/app/analyze` - Analyze text/video content (requires auth)
- `GET /api/v1/app/:type/chats` - Get analysis history (requires auth)

### Dashboard
- `GET /api/v1/app/dashboard` - Get cached dashboard data (requires auth)
- `POST /api/v1/app/dashboard/trends` - Fetch fresh trend data (requires auth)

### System
- `GET /health` - Basic health check
- `GET /api/health` - Detailed system health

## 🏗 Architecture

### Core Services
- **AnthropicService** (`src/services/core/ai/anthropic/`) - AI integration with caching
- **DashboardService** (`src/services/dashboard.service.ts`) - Trend analytics
- **TrialLimitService** (`src/services/trialLimit.service.ts`) - Usage tracking
- **CacheService** (`src/services/core/cache/`) - Multi-level caching

### Data Models
- **User** - Authentication and profile management
- **Chat** - Content analysis history
- **Trends** - Dashboard analytics data
- **AuditLog** - System activity tracking

### Smart Caching Strategy
```typescript
// Content Analysis Caching
const cacheKey = generateCacheKey(content, contentType);
const cachedResult = this.getCachedResult(cacheKey);
if (cachedResult) {
  return cachedResult; // Avoid API call
}
```

## 🔧 Configuration

### Environment Variables

**Core Configuration**
```env
NODE_ENV=development|production
PORT=3000
DB_TYPE=mongodb
```

**Database**
```env
MONGODB_URI=mongodb://localhost:27017/buffer_lyte
MONGODB_DB_NAME=buffer_lyte
```

**AI & Analysis**
```env
ANTHROPIC_API_KEY=your-key
ANTHROPIC_MODEL=claude-3-sonnet-20240229
CONTENT_TRIAL_LIMIT=5
```

**Security**
```env
JWT_SECRET=your-secret-min-32-chars
JWT_EXPIRE=24h
BCRYPT_ROUNDS=12
```

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build and run
docker build -t BuffByte .
docker run -p 3000:3000 --env-file .env BuffByte
```

### Production Environment
```env
NODE_ENV=production
JWT_SECRET=strong-production-secret
MONGODB_URI=mongodb://your-production-cluster
ANTHROPIC_API_KEY=your-production-api-key
```

### Process Management (PM2)
```bash
npm install -g pm2
pm2 start dist/server.js --name BuffByte
pm2 save && pm2 startup
```

## 📊 Business Model

### Trial System
- **Free Tier**: 5 content analyses per day
- **Rate Limiting**: 2 requests per hour per user
- **Usage Tracking**: Automatic trial counter with 24h reset

### Caching Strategy
- **Cost Optimization**: Avoid duplicate AI API calls
- **Performance**: Sub-second response for cached content
- **Scalability**: Database persistence for long-term storage

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- analyzer.test.ts
```

## 📈 Monitoring

### Health Checks
```bash
curl http://localhost:3000/health        # Basic health
curl http://localhost:3000/api/health    # Detailed health
```

### Cache Statistics
Check cache performance via health endpoints or logs.

## 🤝 Development

### Code Quality
```bash
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript
```

### Project Structure
```
src/
├── controllers/      # Request handlers (analyzer, dashboard, auth)
├── services/         # Business logic (AI, caching, trials)
├── models/           # MongoDB schemas (User, Chat, Trends)
├── middleware/       # Auth, validation, error handling
├── config/           # Environment configuration
└── utils/            # Helpers and utilities
```

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

**BuffByte** - Making AI content analysis accessible and scalable 🚀