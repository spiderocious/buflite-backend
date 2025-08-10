#!/usr/bin/env node

/**
 * Backend Template Server Entry Point
 * This file loads environment variables and starts the Express application
 */

import dotenv from 'dotenv';
import path from 'path';
import { logger } from './src/utils/logger';

// Load environment variables based on NODE_ENV

const envFile = '.env';
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

// Fallback to default .env if specific env file doesn't exist
if (!process.env.DB_TYPE) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}



// Log startup information
console.info('🚀 Starting Backend Template Server...');
logger.info(`📋 Environment: ${envPath}`);
logger.info(`📁 Loaded envsss from: ${envFile}`);

// ADD PROCESS MONITORING HERE
process.on('exit', (code) => {
  logger.error(`🚪 Process exiting with code: ${code}`);
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

console.log(`I AM HERE`);
// Import and start the application
import('./src/app')
  .then((appModule) => {
    const app = appModule.default;
    logger.info('📦 App module loaded successfully');
    return app.start();
  })
  .then(() => {
    logger.info('✅ Application started successfully');
  })
  .catch((error) => {
    logger.error('💥 Failed to start application:', error);
    process.exit(1);
  });