#!/usr/bin/env node

/**
 * Backend Template Server Entry Point
 * This file loads environment variables and starts the Express application
 */

// Register path mappings for TypeScript
import 'tsconfig-paths/register';

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';

// Load appropriate .env file
const envFile = nodeEnv === 'production' ? '.env' : `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

// Fallback to default .env if specific env file doesn't exist
if (!process.env.DB_TYPE) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

import { logger } from './src/utils/logger';

// Log startup information
logger.info('🚀 Starting Backend Template Server...');
logger.info(`📋 Environment: ${nodeEnv}`);
logger.info(`📁 Loaded env from: ${envFile}`);

// Import and start the application
import('./src/app')
  .then((appModule) => {
    const app = appModule.default;
    return app.start();
  })
  .catch((error) => {
    logger.error('💥 Failed to start application:', error);
    process.exit(1);
  });
