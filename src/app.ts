import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { config, validateConfig } from './config';
import { logger, loggerStream } from './utils/logger';
import { SuccessResponse } from './utils/response';
import { setupErrorHandlers } from './middleware/errorHandler';
import DatabaseFactory, { getDatabaseHealth } from './config/database';
import { CacheService } from './services/core/cache';
import routes from './routes';

class App {
  public app: Application;
  public port: number;

  constructor() {
    this.app = express();
    this.port = config.app.port;

    // Initialize the application
    this.initializeConfig();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize configuration and validate environment
   */
  private initializeConfig(): void {
    try {
      validateConfig();
      logger.info('Configuration validated successfully');
    } catch (error) {
      logger.error('Configuration validation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize middleware
   */
  private initializeMiddleware(): void {
    // Trust proxy (for load balancers, reverse proxies)
    this.app.set('trust proxy', 1);

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: "*",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
      ]
    }));

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // HTTP request logging with Morgan
    const morganFormat = config.app.env === 'production' 
      ? 'combined' 
      : ':method :url :status :res[content-length] - :response-time ms';
    
    this.app.use(morgan(morganFormat, { 
      stream: loggerStream,
      skip: (req: Request) => {
        // Skip logging for health check endpoints
        return req.url === '/health' || req.url === '/api/health';
      }
    }));

    logger.info('Middleware initialized successfully');
  }

  /**
   * Initialize routes
   */
  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      const health = await getDatabaseHealth();
      const cacheHealth = CacheService.getHealth();
      
      SuccessResponse(res, 'Backend Template API is running', {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.app.env,
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: health,
          cache: cacheHealth
        }
      });
    });

    // API health endpoint
    this.app.get('/api/health', async (req: Request, res: Response) => {
      const health = await getDatabaseHealth();
      const cacheHealth = CacheService.getHealth();
      const cacheStats = CacheService.getCacheStats();
      
      SuccessResponse(res, 'API is healthy', {
        timestamp: new Date().toISOString(),
        services: {
          database: health.status,
          cache: {
            status: cacheHealth.status,
            enabled: cacheHealth.enabled,
            hitRate: cacheStats.hitRate + '%',
            keys: cacheStats.keys
          },
        }
      });
    });

    // Mount all API routes
    this.app.use('/api', routes);
    logger.info('Routes initialized successfully');
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // Setup comprehensive error handling middleware
    setupErrorHandlers(this.app);

    logger.info('Error handling initialized successfully');
  }

  /**
   * Start the Express server
   */
  public async start(): Promise<void> {
    try {
      // Initialize security systems first

      // Connect to database
      await DatabaseFactory.connect();
      logger.info('Database connected successfully');

      // Start the server
      const server = this.app.listen(this.port, () => {
        logger.info(`Backend Template API server started successfully`);
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${config.app.env}`);
        logger.info(`Database: ${config.database.type}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        logger.info(`API base: http://localhost:${this.port}/api`);
        logger.info('System monitoring started');
      });

      // Server error handler
      server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.syscall !== 'listen') {
          throw error;
        }

        switch (error.code) {
          case 'EACCES':
            logger.error(`Port ${this.port} requires elevated privileges`);
            process.exit(1);
            break;
          case 'EADDRINUSE':
            logger.error(`Port ${this.port} is already in use`);
            process.exit(1);
            break;
          default:
            throw error;
        }
      });

      // Setup graceful shutdown handlers
      const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
      signals.forEach((signal) => {
        process.on(signal, () => this.gracefulShutdown(signal));
      });

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Graceful shutdown initiated by ${signal}`);
    
    try {
      // Close database connections
      await DatabaseFactory.disconnect();
      logger.info('Database connections closed');
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.info('Forcing shutdown');
        process.exit(1);
      }, 10000);
      
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and export the app instance
const app = new App();

// Start the server if this file is run directly
if (require.main === module) {
  app.start().catch((error) => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });
}

export default app;
export { App };
