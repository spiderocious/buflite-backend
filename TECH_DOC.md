# Technical Documentation - BuffByte

## System Architecture

### Overview
BuffByte is a Node.js/TypeScript backend service that provides AI-powered content analysis using Anthropic's Claude API. The system implements intelligent caching, user authentication, and trial-based usage limits.

### Core Components

#### 1. Application Entry Point
- **File**: `server.ts`
- **Purpose**: Bootstrap application with environment configuration
- **Key Features**: Environment-specific configuration loading, graceful error handling

#### 2. Express Application
- **File**: `src/app.ts`
- **Purpose**: Main Express application setup and middleware configuration
- **Middleware Stack**:
  - Security: Helmet, CORS
  - Logging: Morgan with Winston
  - Compression: gzip compression
  - Body parsing: JSON/URL-encoded
  - Rate limiting: express-rate-limit

### Service Architecture

#### 1. Anthropic AI Service
- **Location**: `src/services/core/ai/anthropic/`
- **Primary Functions**:
  - Content analysis using Claude API
  - Smart caching to reduce API costs
  - Mock data support for development
  - Request/response logging with audit trails

**Key Features**:
```typescript
// Intelligent caching strategy
const cacheKey = generateCacheKey(content, contentType);
if (cacheFirst && cachedResult) {
  return cachedResult; // Avoid API call
}
```

#### 2. Dashboard Service
- **File**: `src/services/dashboard.service.ts`
- **Purpose**: Provides trend analysis and business intelligence data
- **Caching Strategy**:
  - Memory cache: 1 hour TTL
  - Database persistence: 10 hours
  - AI-generated insights using web search tools

#### 3. Trial Limit Service
- **File**: `src/services/trialLimit.service.ts`
- **Purpose**: Manages user usage limits and trial tracking
- **Features**:
  - Daily reset cycles (24-hour TTL)
  - Per-user, per-content-type tracking
  - Configurable limits via environment variables

#### 4. Cache Service
- **Location**: `src/services/core/cache/`
- **Implementation**: node-cache with TTL management
- **Use Cases**:
  - AI response caching
  - Trial limit tracking
  - Dashboard data caching

### Data Models

#### User Model (`src/models/mongodb/User.ts`)
```typescript
interface IUser {
  email: string;
  password: string; // bcrypt hashed
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}
```

#### Chat Model (`src/models/mongodb/Chats.ts`)
```typescript
interface Chat {
  id: string; // UUID
  message: string; // Original content
  response: string; // AI analysis result
  sender: string; // User ID
  type: string; // 'content' | 'video'
  status: 'pending' | 'completed' | 'failed';
  modelName: string; // AI model used
}
```

#### Trends Model (`src/models/mongodb/Trends.ts`)
```typescript
interface Trends {
  id: string;
  data: Record<string, any>; // AI-generated insights
  modelName: string;
  createdAt: Date;
}
```

### Authentication & Security

#### JWT Implementation
- **Location**: `src/utils/jwt.ts`
- **Token Types**: Access tokens (24h) and refresh tokens (7d)
- **Security**: bcrypt password hashing (12 rounds)

#### Rate Limiting
```typescript
// Per-user rate limiting
rateLimitByUser(2, 3600000) // 2 requests per hour
```

#### Trial System
- **Default Limit**: 5 analyses per day per user
- **Reset Mechanism**: Automatic 24-hour cycles
- **Storage**: Cache-based with TTL expiration

### API Design

#### Route Structure
```
/api/v1/auth/*          # Authentication endpoints
/api/v1/app/analyze     # Content analysis
/api/v1/app/dashboard   # Dashboard data
/api/v1/app/:type/chats # Analysis history
/health                 # System health checks
```

#### Request Flow
1. **Authentication**: JWT middleware validates tokens
2. **Rate Limiting**: Check user-specific limits
3. **Trial Validation**: Verify usage allowances
4. **Cache Check**: Look for cached responses
5. **AI Processing**: Call Anthropic API if needed
6. **Response Caching**: Store results for future use
7. **Audit Logging**: Record system activity

### Configuration Management

#### Environment Variables
```bash
# Core Settings
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://cluster/buffer_lyte

# AI Configuration
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-sonnet-20240229
CONTENT_TRIAL_LIMIT=5

# Security
JWT_SECRET=32-char-minimum-secret
BCRYPT_ROUNDS=12
```

### Error Handling

#### Global Error Middleware
- **Location**: `src/middleware/errorHandler.ts`
- **Features**: Structured error responses, logging integration
- **Error Types**: Request errors, validation errors, system errors

### Database Design

#### MongoDB Connection
- **Configuration**: `src/config/mongodb.ts`
- **Features**: Connection pooling, health monitoring
- **Collections**: users, chats, trends, auditlogs

#### Health Monitoring
```typescript
// Database health check
{
  status: 'connected' | 'disconnected' | 'error',
  type: 'mongodb',
  database: string,
  collections: number
}
```

### Performance Optimizations

#### Caching Strategy
1. **Content Analysis**: Hash-based keys with 1-hour TTL
2. **Dashboard Data**: Singleton pattern with 10-hour persistence
3. **Trial Limits**: User-based keys with 24-hour expiration

#### Database Optimizations
- **Indexes**: Email (unique), creation dates, user IDs
- **Connection Pooling**: Max 10 connections
- **Query Optimization**: Selective field projection

### Monitoring & Observability

#### Logging
- **Implementation**: Winston with structured logging
- **Log Levels**: error, warn, info, debug
- **Output**: Console (development), file (production)

#### Health Checks
- **Basic**: `GET /health` - Simple uptime check
- **Detailed**: `GET /api/health` - Service status with metrics

#### Audit Logging
- **Service**: `src/services/auditLog.service.ts`
- **Coverage**: User actions, AI requests, system events
- **Retention**: Configurable via environment settings

### Deployment Architecture

#### Docker Configuration
```yaml
# MongoDB + Mongo Express
services:
  mongodb:
    image: mongo:7.0
    ports: ["27017:27017"]
  
  mongo-express:
    image: mongo-express:1.0.0
    ports: ["8081:8081"]
```

#### Production Considerations
- **Process Management**: PM2 for zero-downtime deployments
- **Environment Isolation**: Separate development/production configs
- **Secret Management**: Environment variable injection
- **Health Monitoring**: Endpoint-based health checks for load balancers

### Development Workflow

#### Code Quality Tools
```bash
npm run lint        # ESLint for code standards
npm run format      # Prettier for formatting
npm run typecheck   # TypeScript compilation check
```

#### Testing Strategy
- **Framework**: Jest with supertest
- **Coverage**: Integration and unit tests
- **Mock Data**: Development-time AI response mocking

### Security Considerations

#### Data Protection
- **Password Security**: bcrypt with 12 salt rounds
- **JWT Security**: 32+ character secrets, token rotation
- **Input Validation**: express-validator middleware

#### API Security
- **Rate Limiting**: User-based request throttling
- **CORS**: Configurable cross-origin policies
- **Headers**: Security headers via Helmet middleware

### Scaling Considerations

#### Horizontal Scaling
- **Stateless Design**: Session data in JWT tokens
- **Cache Distribution**: Ready for Redis migration
- **Database**: MongoDB replica sets supported

#### Cost Optimization
- **AI API Caching**: Prevents duplicate expensive calls
- **Trial Limits**: Controls usage and costs
- **Smart Caching**: Multi-level cache hierarchy