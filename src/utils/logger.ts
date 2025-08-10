import { config } from '@/config';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend-template' },
  transports: [],
});

  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
      )
    ),
  }));


// Stream object for Morgan HTTP logger
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export { logger };
export default logger;
