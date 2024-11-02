# 🚀 Node.js/TypeScript Backend Template

A production-ready, scalable Node.js/TypeScript backend template with dual database support (MongoDB & MySQL), comprehensive authentication, audit logging, caching, email services, and more.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0+-green.svg)](https://www.mongodb.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Audit Logging](#-audit-logging)
- [Email Service](#-email-service)
- [Cache Management](#-cache-management)
- [Background Jobs](#-background-jobs)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Features

### 🔐 Authentication & Security
- **JWT-based authentication** with access & refresh tokens
- **Password hashing** with bcrypt
- **Email verification** and password reset
- **Rate limiting** and security headers (Helmet)
- **CORS configuration** for cross-origin requests
- **Input validation** with Joi and express-validator

### 📊 Database Support
- **Dual database support**: MongoDB (Mongoose) & MySQL (TypeORM)
- **Environment-based database selection**
- **Database health monitoring**
- **Migration support** (MySQL) and schema validation
- **Connection pooling** and optimization

### 🔍 Audit Logging
- **Comprehensive audit trail** for all user actions
- **Configurable exemptions** to prevent recursive logging
- **Advanced filtering** by action, user, date range
- **Statistics and analytics** dashboard
- **Environment-based enablement**

### 📧 Email Services
- **Multi-provider support** (Resend, SendGrid ready)
- **Template-based emails** with variable substitution
- **Batch email sending** for newsletters
- **Email validation** and delivery tracking
- **HTML and text format support**

### ⚡ Performance & Caching
- **In-memory caching** with node-cache
- **Cache statistics** and monitoring
- **TTL management** and automatic cleanup
- **Cache-aside pattern** implementation
- **Performance metrics** tracking

### 🔧 Background Jobs
- **Async job processing** with queue management
- **Retry mechanisms** with exponential backoff
- **Job scheduling** and monitoring
- **Database-backed persistence**
- **Configurable job types**

### 📈 Monitoring & Logging
- **Structured logging** with Winston
- **Request logging** with Morgan
- **Health check endpoints** with system metrics
- **Error tracking** and alerting
- **Performance monitoring**

### 🧪 Development Tools
- **TypeScript** for type safety
- **ESLint & Prettier** for code quality
- **Jest** for testing with coverage
- **Nodemon** for development hot-reload
- **Docker Compose** for local development

## 🛠 Tech Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express.js 4.18+
- **Authentication**: JWT (jsonwebtoken)

### Databases
- **MongoDB**: Mongoose 8.0+ (ODM)
- **MySQL**: TypeORM 0.3+ (ORM)

### Email & Communication
- **Email Service**: Resend (primary), SendGrid (ready)
- **Analytics**: Mixpanel (optional)

### Development & Tools
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, Prettier
- **Build**: TypeScript Compiler
- **Development**: Nodemon
- **Containerization**: Docker & Docker Compose

### Security & Performance
- **Security**: Helmet, CORS, bcryptjs
- **Rate Limiting**: express-rate-limit
- **Validation**: Joi, express-validator, Zod
- **Caching**: node-cache
- **Compression**: compression middleware

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB 7.0+ or MySQL 8.0+
- Docker & Docker Compose (optional)

### 1. Clone & Install
```bash
git clone https://github.com/spiderocious/node-ts-mongo-mysql-template.git
cd node-ts-mongo-mysql-template
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (see Configuration section)
nano .env
```

### 3. Database Setup
```bash
# Option A: Using Docker (Recommended for development)
npm run docker:dev

# Option B: Local databases
# Make sure MongoDB/MySQL is running locally
# Update connection strings in .env
```

### 4. Run the Application
```bash
# Development mode with hot-reload
npm run dev

# Production build and start
npm run start:prod

# Run tests
npm test
```

The server will start on `http://localhost:3000` 🎉

### 5. Verify Installation
```bash
# Health check
curl http://localhost:3000/health

# API documentation (requires INTERNAL_API_TOKEN)
curl -H "x-internal-token: your-token" http://localhost:3000/api/docs
```

## 📁 Project Structure

```
backend_template/
├── 📁 src/
│   ├── 📁 config/           # Configuration files
│   │   ├── database.ts      # Database factory & connections
│   │   ├── mongodb.ts       # MongoDB configuration
│   │   ├── mysql.ts         # MySQL configuration
│   │   └── index.ts         # Main config exports
│   ├── 📁 controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── auditLog.controller.ts
│   │   ├── email.controller.ts
│   │   ├── cache.controller.ts
│   │   └── health.controller.ts
│   ├── 📁 middleware/       # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── internalAuth.ts  # Internal API protection
│   │   ├── validation.ts    # Input validation
│   │   ├── cache.middleware.ts
│   │   └── errorHandler.ts  # Global error handling
│   ├── 📁 models/          # Data models
│   │   ├── mongodb/        # Mongoose models
│   │   └── mysql/          # TypeORM entities
│   ├── 📁 routes/          # API routes
│   │   ├── auth.routes.ts
│   │   ├── auditLog.routes.ts
│   │   ├── email.routes.ts
│   │   └── index.ts
│   ├── 📁 services/        # Business logic
│   │   ├── auditLog.service.ts
│   │   ├── email.service.ts
│   │   └── core/           # Core services
│   │       ├── cache/      # Caching service
│   │       └── email/      # Email providers
│   ├── 📁 jobs/           # Background jobs
│   │   ├── job.service.ts
│   │   └── types.ts
│   ├── 📁 types/          # TypeScript types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── 📁 utils/          # Utility functions
│   │   ├── logger.ts      # Winston logger
│   │   ├── response.ts    # API response helpers
│   │   ├── validation.ts  # Validation schemas
│   │   ├── jwt.ts         # JWT utilities
│   │   └── helpers.ts     # Common helpers
│   └── app.ts             # Express app setup
├── 📁 docker/             # Docker configuration
│   ├── mongodb/
│   └── mysql/
├── 📁 logs/               # Application logs
├── 📄 server.ts           # Application entry point
├── 📄 docker-compose.yml  # Development containers
├── 📄 package.json        # Dependencies & scripts
├── 📄 tsconfig.json       # TypeScript configuration
├── 📄 jest.config.js      # Test configuration
└── 📄 .env.example        # Environment template
```

## ⚙️ Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and configure:

#### Core Settings
```env
NODE_ENV=development          # Environment: development, production, test
PORT=3000                    # Server port
DB_TYPE=mongodb              # Database: 'mongodb' or 'mysql'
```

#### Database Configuration
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/backend_template
MONGODB_DB_NAME=backend_template

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=backend_template
MYSQL_USERNAME=root
MYSQL_PASSWORD=password
```

#### Security & Authentication
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

#### Email Service
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name
```

#### Internal API Protection
```env
INTERNAL_API_TOKEN=your-super-secure-internal-api-token
```

#### Audit Logging
```env
LOG_AUDIT=true
AUDIT_EXEMPTED_ACTIONS=AUDIT_LOGS_ACCESSED,AUDIT_CONFIG_ACCESSED
```

See `.env.example` for complete configuration options.

## 🗄️ Database Setup

### Option 1: Docker (Recommended)
```bash
# Start both MongoDB and MySQL
npm run docker:dev

# Stop databases
npm run docker:down
```

### Option 2: Local Installation

#### MongoDB
```bash
# Install MongoDB 7.0+
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

#### MySQL
```bash
# Install MySQL 8.0+
brew install mysql
brew services start mysql

# Or using Docker
docker run -d -p 3306:3306 --name mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=backend_template \
  mysql:8.0
```

### Database Selection
Set `DB_TYPE` in your `.env` file:
- `DB_TYPE=mongodb` - Uses MongoDB with Mongoose
- `DB_TYPE=mysql` - Uses MySQL with TypeORM

The application automatically connects to the selected database type.

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### API Endpoints

#### 🏥 Health & System
- `GET /health` - Basic health check
- `GET /api/health` - Detailed health with metrics
- `GET /api/docs` - API documentation (Internal token required)

#### 🔐 Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email

#### 📊 Audit Logs (Internal token required)
- `GET /api/v1/audit` - Get audit logs with filters
- `GET /api/v1/audit/stats` - Get audit statistics
- `GET /api/v1/audit/config` - Get audit configuration
- `PUT /api/v1/audit/config` - Update audit configuration
- `GET /api/v1/audit/actions` - Get available actions
- `GET /api/v1/audit/users` - Get available users

#### 📧 Email Service (Internal token required)
- `POST /api/v1/email/send` - Send single email
- `POST /api/v1/email/send-template` - Send template email
- `POST /api/v1/email/send-batch` - Send batch emails
- `GET /api/v1/email/templates` - Get email templates
- `POST /api/v1/email/validate` - Validate email address

#### 🗄️ Cache Management (Internal token required)
- `GET /api/v1/cache/stats` - Get cache statistics
- `GET /api/v1/cache/keys` - Get all cache keys
- `GET /api/v1/cache/get/:key` - Get cache value
- `POST /api/v1/cache/set` - Set cache value
- `DELETE /api/v1/cache/keys/:key` - Delete cache key
- `DELETE /api/v1/cache/flush` - Clear all cache

### Postman Collections

Two Postman collections are provided:

1. **Complete API Collection**: `backend-template-api.postman_collection.json`
   - All endpoints with examples
   - Environment variables for tokens
   - Automated token management

2. **Audit Logs Collection**: `audit-logs.postman_collection.json`
   - Dedicated audit log endpoints
   - Advanced filtering examples
   - Statistics and configuration management

Import either collection into Postman and update the environment variables.

## 🔐 Authentication

### JWT Token Flow

1. **Registration/Login**: User receives access token (24h) and refresh token (7d)
2. **API Requests**: Include access token in Authorization header
3. **Token Refresh**: Use refresh token to get new access token
4. **Logout**: Invalidates current session

### Example Usage

```javascript
// Registration
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}

// Login Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "firstName": "..." },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}

// Authenticated Request
GET /api/v1/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Internal API Protection

Some endpoints require internal API token for admin/system operations:

```bash
# Set in .env
INTERNAL_API_TOKEN=your-super-secure-internal-api-token

# Use in requests
curl -H "x-internal-token: your-token" http://localhost:3000/api/v1/email/send
```

## 🔍 Audit Logging

### Overview
Comprehensive audit logging tracks all user actions and system events for compliance and monitoring.

### Features
- **Action Tracking**: Every user action is logged with context
- **User Attribution**: Links actions to specific users or system
- **Metadata Storage**: IP addresses, user agents, request data
- **Configurable Exemptions**: Prevent recursive logging
- **Advanced Filtering**: Query by action, user, date range
- **Statistics Dashboard**: Analytics and metrics
- **Environment Control**: Enable/disable per environment

### Configuration
```env
# Enable audit logging
LOG_AUDIT=true

# Exempt actions from logging (comma-separated)
AUDIT_EXEMPTED_ACTIONS=AUDIT_LOGS_ACCESSED,AUDIT_CONFIG_ACCESSED
```

### Usage Example
```javascript
// Automatic logging (built into auth controller)
// Manual logging in your code
import { AuditLogService } from './services/auditLog.service';

const auditLog = AuditLogService.getInstance();
auditLog.log('USER_ACTION', 'user@example.com', 'User performed action', { 
  metadata: 'additional data' 
});
```

### Audit Log Schema
```typescript
interface IAuditLog {
  action: string;           // Action performed
  user: string;            // User identifier
  description: string;     // Human-readable description
  data?: any;             // Additional context data
  timestamp: Date;        // When action occurred
  ipAddress?: string;     // Client IP address
  userAgent?: string;     // Client user agent
  metadata?: any;         // Extra metadata
}
```

## 📧 Email Service

### Supported Providers
- **Resend** (Primary) - Modern email API
- **SendGrid** (Ready) - Enterprise email service

### Configuration
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name
```

### Usage Examples

#### Send Simple Email
```typescript
POST /api/v1/email/send
{
  "to": "recipient@example.com",
  "subject": "Welcome!",
  "html": "<h1>Welcome to our platform!</h1>",
  "text": "Welcome to our platform!"
}
```

#### Send Template Email
```typescript
POST /api/v1/email/send-template
{
  "to": "recipient@example.com",
  "templateId": "welcome",
  "variables": {
    "name": "John Doe",
    "company": "Acme Corp"
  }
}
```

#### Send Batch Emails
```typescript
POST /api/v1/email/send-batch
{
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Newsletter #1",
      "html": "<p>Content for user 1</p>"
    },
    {
      "to": "user2@example.com", 
      "subject": "Newsletter #2",
      "html": "<p>Content for user 2</p>"
    }
  ]
}
```

### Email Templates
Templates support variable substitution:
```html
<!-- Welcome template -->
<h1>Welcome {{name}}!</h1>
<p>Thanks for joining {{company}}.</p>
```

## ⚡ Cache Management

### Features
- **In-memory caching** with node-cache
- **TTL support** with automatic expiration
- **Performance metrics** and statistics
- **Cache-aside pattern** implementation
- **Manual cache control** via API

### Configuration
```env
CACHE_DEFAULT_TTL=600      # Default TTL in seconds
CACHE_CHECK_PERIOD=120     # Cleanup interval in seconds
```

### Usage Examples

#### Programmatic Usage
```typescript
import { CacheService } from './services/core/cache';

const cache = CacheService.getInstance();

// Set cache
cache.set('user:123', userData, 3600); // 1 hour TTL

// Get cache
const userData = cache.get('user:123');

// Delete cache
cache.del('user:123');

// Get statistics
const stats = cache.getStats();
```

#### API Management
```bash
# Get cache statistics
GET /api/v1/cache/stats

# Set cache value
POST /api/v1/cache/set
{
  "key": "my-key",
  "value": "my-value", 
  "ttl": 3600
}

# Get cache value
GET /api/v1/cache/get/my-key

# Clear all cache
DELETE /api/v1/cache/flush
```

### Cache Middleware
```typescript
import { cacheMiddleware } from './middleware/cache.middleware';

// Cache GET requests for 10 minutes
router.get('/api/data', cacheMiddleware(600), controller.getData);
```

## 🔧 Background Jobs

### Features
- **Async job processing** with database persistence
- **Retry mechanisms** with exponential backoff
- **Job scheduling** and monitoring
- **Configurable job types**
- **Failure handling** and alerting

### Configuration
```env
JOB_POLL_INTERVAL=5000      # Job polling interval (ms)
JOB_MAX_RETRIES=3           # Maximum retry attempts
JOB_CLEANUP_INTERVAL=86400000 # Cleanup interval (ms)
```

### Usage Example
```typescript
import { JobService } from './jobs/job.service';

const jobService = JobService.getInstance();

// Schedule a job
await jobService.scheduleJob('SEND_EMAIL', {
  to: 'user@example.com',
  subject: 'Welcome!',
  template: 'welcome'
}, new Date(Date.now() + 5000)); // 5 seconds from now

// Process jobs (automatically runs in background)
jobService.processJobs();
```

### Job Types
- `SEND_EMAIL` - Email sending jobs
- `CLEANUP_LOGS` - Log cleanup jobs
- `USER_NOTIFICATION` - User notification jobs
- Custom job types can be added

## 🧪 Testing

### Test Framework
- **Jest** for unit and integration tests
- **Supertest** for API endpoint testing
- **Coverage reporting** with Istanbul

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Test Structure
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Example Test
```typescript
describe('Auth Controller', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });
});
```

## 🚀 Deployment

### Environment Setup

#### Production Environment Variables
```env
NODE_ENV=production
PORT=3000

# Use strong secrets
JWT_SECRET=your-production-jwt-secret-min-32-chars
INTERNAL_API_TOKEN=your-production-internal-token

# Production database
MONGODB_URI=mongodb://your-production-cluster
# or
MYSQL_HOST=your-production-host

# Email service
RESEND_API_KEY=your-production-resend-key

# Disable debug features
DETAILED_ERRORS=false
ENABLE_REQUEST_LOGGING=false
```

### Docker Deployment

#### Build Image
```bash
# Build production image
docker build -t backend-template .

# Run container
docker run -p 3000:3000 --env-file .env backend-template
```

#### Docker Compose (Production)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mongodb
      - redis
```

### Cloud Deployment

#### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

#### AWS/GCP/Azure
- Use container services (ECS, Cloud Run, Container Instances)
- Set up managed databases (Atlas, RDS, Cloud SQL)
- Configure environment variables in your cloud platform
- Set up load balancers and health checks

### Process Management

#### PM2 (Production)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/server.js --name backend-template

# Monitor
pm2 status
pm2 logs backend-template

# Auto-restart on reboot
pm2 startup
pm2 save
```

### Health Checks
Configure your load balancer to use:
- `GET /health` - Basic health check
- `GET /api/health` - Detailed health with database status

### Performance Optimization

#### Production Checklist
- [ ] Enable compression middleware
- [ ] Use Redis for caching (replace node-cache)
- [ ] Set up database connection pooling
- [ ] Configure proper logging levels
- [ ] Enable rate limiting
- [ ] Set up monitoring (New Relic, DataDog)
- [ ] Configure HTTPS/SSL
- [ ] Set up CDN for static assets
- [ ] Database indexing optimization
- [ ] Enable gzip compression

## 📊 Monitoring & Logging

### Application Logs
```typescript
import { logger } from './utils/logger';

// Log levels: error, warn, info, debug
logger.info('User logged in', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', { error: error.message });
```

### Health Monitoring
```bash
# Basic health
curl http://localhost:3000/health

# Detailed health with metrics
curl http://localhost:3000/api/health
```

### Performance Metrics
- Request/response times
- Database query performance
- Cache hit/miss ratios
- Memory and CPU usage
- Error rates and types

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Make your changes
6. Run tests: `npm test`
7. Commit changes: `git commit -m 'Add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Format code with Prettier
- Write tests for new features
- Update documentation

### Pull Request Guidelines
- Describe your changes clearly
- Include tests for new functionality
- Ensure all tests pass
- Update documentation if needed
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](http://localhost:3000/api/docs) (when running locally)
- [Postman Collections](./backend-template-api.postman_collection.json)

### Common Issues

#### Database Connection Issues
```bash
# Check database status
npm run docker:dev  # Start databases
```

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Authentication Issues
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration
# Use shorter expiration for testing: JWT_EXPIRE=1m
```

### Getting Help
- Create an issue on GitHub
- Check existing documentation
- Review Postman collection examples

---

## 🎉 Conclusion

This backend template provides a solid foundation for building scalable Node.js applications with:

- ✅ **Production-ready** authentication and security
- ✅ **Dual database support** for flexibility  
- ✅ **Comprehensive audit logging** for compliance
- ✅ **Modern development tools** and practices
- ✅ **Extensive documentation** and examples
- ✅ **Easy deployment** options

### Next Steps
1. **Customize** the template for your specific needs
2. **Add business logic** in controllers and services
3. **Extend models** for your data requirements
4. **Configure** production environment
5. **Deploy** to your preferred platform

Happy coding! 🚀

---

*Made with ❤️ by the Backend Template Team*
