import { config as dotEnvConfig } from 'dotenv';
import { PromptType } from '../constants/prompts';

// Load environment variables
dotEnvConfig();

export interface DatabaseConfig {
  type: 'mongodb';
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


export interface SecurityConfig {
  bcryptRounds: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

export interface LoggingConfig {
  level: string;
  file: string;
}

export interface AIConfig {
  anthropic: {
    apiKey: string;
    model: string;
    mock: boolean;
  };
}

type Prompt = {
  systemPrompt: string;
  userPrompt: string;
};

export type PromptConfig = {
  [K in PromptType]: Prompt;
};

export const config = {
  app: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  } as AppConfig,

  database: {
    type: 'mongodb',
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


  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  } as SecurityConfig,

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  } as LoggingConfig,

  ai: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-2',
      mock: process.env.ANTHROPIC_USE_MOCK_DATA === 'true',
    },
  } as AIConfig,

  prompts: {
    [PromptType.CONTENT]: {
      systemPrompt: process.env.CONTENT_SYSTEM_PROMPT || 'Analyze the content provided.',
      userPrompt: process.env.CONTENT_USER_PROMPT || 'Please analyze this content.',
    },
    [PromptType.VIDEO]: {
      systemPrompt: process.env.CONTENT_SYSTEM_PROMPT || 'Analyze the video content provided.',
      userPrompt: process.env.VIDEO_USER_PROMPT || 'Please analyze this video content.',
    },
    [PromptType.DASHBOARD]: {
      systemPrompt: process.env.DASHBOARD_SYSTEM_PROMPT || 'Analyze the dashboard data provided.',
      userPrompt: process.env.DASHBOARD_USER_PROMPT || 'Please analyze this dashboard data.',
    },
  }
};

/**
 * Validate configuration
 */
export const validateConfig = (): void => {
  const requiredForProduction = ['JWT_SECRET', 'MONGODB_URI'];


  // Only enforce required vars in production
  if (config.app.env === 'production') {
    const missing = requiredForProduction.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables for production: ${missing.join(', ')} Only found: ${Object.keys(process.env).join(', ')}`
      );
    }
  }

};

export default config;
