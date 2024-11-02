import { config as dotEnvConfig } from 'dotenv';

// Load environment variables
dotEnvConfig();

export interface DatabaseConfig {
  type: 'mongodb' | 'mysql';
  mongodb: {
    uri: string;
    testUri: string;
    options: {
      maxPoolSize: number;
      serverSelectionTimeoutMS: number;
      socketTimeoutMS: number;
      bufferCommands: boolean;
      dbName?: string;
    };
  };
  mysql: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    testDatabase: string;
    options: {
      connectionLimit: number;
      acquireTimeout: number;
      timeout: number;
      reconnect: boolean;
    };
  };
}

export interface AppConfig {
  port: number;
  env: string;
  corsOrigin: string;
}

export interface JWTConfig {
  secret: string;
  expire: string;
  refreshExpire: string;
}

export interface CacheConfig {
  defaultTTL: number;
  checkPeriod: number;
}

export interface EmailConfig {
  provider: 'resend' | 'sendgrid';
  resend: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  sendgrid: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
}

export interface AnalyticsConfig {
  enabled: boolean;
  provider: 'mixpanel' | 'amplitude';
  mixpanel: {
    token: string;
  };
  amplitude: {
    apiKey: string;
  };
}

export interface JobsConfig {
  pollInterval: number;
  maxRetries: number;
  cleanupInterval: number;
}

export interface SecurityConfig {
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

export interface LoggingConfig {
  level: string;
  file: string;
}

export const config = {
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  } as AppConfig,

  database: {
    type: (process.env.DB_TYPE as 'mongodb' | 'mysql') || 'mongodb',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/buffer_lyte',
      testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/buffer_lyte_test',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        dbName: process.env.MONGODB_DB_NAME || 'buffer_lyte',
      },
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      database: process.env.MYSQL_DATABASE || 'buffer_lyte',
      username: process.env.MYSQL_USERNAME || 'root',
      password: process.env.MYSQL_PASSWORD || 'password',
      testDatabase: process.env.MYSQL_TEST_DATABASE || 'buffer_lyte_test',
      options: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
      },
    },
  } as DatabaseConfig,

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expire: process.env.JWT_EXPIRE || '24h',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  } as JWTConfig,

  cache: {
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '600'),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '120'),
  } as CacheConfig,

  email: {
    provider: (process.env.EMAIL_PROVIDER as 'resend' | 'sendgrid') || 'resend',
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.FROM_NAME || 'Backend Template',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.FROM_NAME || 'Backend Template',
    },
  } as EmailConfig,

  analytics: {
    enabled: process.env.ANALYTICS_ENABLED === 'true',
    provider: (process.env.ANALYTICS_PROVIDER as 'mixpanel' | 'amplitude') || 'mixpanel',
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN || '',
    },
    amplitude: {
      apiKey: process.env.AMPLITUDE_API_KEY || '',
    },
  } as AnalyticsConfig,

  jobs: {
    pollInterval: parseInt(process.env.JOB_POLL_INTERVAL || '5000'),
    maxRetries: parseInt(process.env.JOB_MAX_RETRIES || '3'),
    cleanupInterval: parseInt(process.env.JOB_CLEANUP_INTERVAL || '86400000'),
  } as JobsConfig,

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  } as SecurityConfig,

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  } as LoggingConfig,
};

/**
 * Validate configuration
 */
export const validateConfig = (): void => {
  const requiredForProduction = [
    'JWT_SECRET',
  ];

  // Database specific required variables
  if (config.database.type === 'mongodb') {
    requiredForProduction.push('MONGODB_URI');
  } else if (config.database.type === 'mysql') {
    requiredForProduction.push(
      'MYSQL_HOST',
      'MYSQL_DATABASE',
      'MYSQL_USERNAME',
      'MYSQL_PASSWORD'
    );
  }

  // Only enforce required vars in production
  if (config.app.env === 'production') {
    const missing = requiredForProduction.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
    }
  }

  // Validate JWT secret strength in production
  if (config.app.env === 'production' && config.jwt.secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }

  // Validate database type
  if (!['mongodb', 'mysql'].includes(config.database.type)) {
    throw new Error('DB_TYPE must be either "mongodb" or "mysql"');
  }

  // Warn about optional but recommended variables
  const recommended = [
    'RESEND_API_KEY',
  ];

  if (config.analytics.enabled) {
    recommended.push('MIXPANEL_TOKEN');
  }

  const missingRecommended = recommended.filter(key => !process.env[key]);

  if (missingRecommended.length > 0 && config.app.env === 'production') {
    console.warn(`Missing recommended environment variables: ${missingRecommended.join(', ')}`);
  }
};

export default config;
