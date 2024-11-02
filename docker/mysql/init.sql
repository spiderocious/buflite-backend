-- MySQL initialization script
CREATE DATABASE IF NOT EXISTS backend_template_test;

-- Grant privileges to app_user for both databases
GRANT ALL PRIVILEGES ON backend_template.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON backend_template_test.* TO 'app_user'@'%';

FLUSH PRIVILEGES;

-- Create initial tables (if using MySQL as primary DB)
USE backend_template;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    isEmailVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (createdAt)
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
    scheduledAt TIMESTAMP NULL,
    startedAt TIMESTAMP NULL,
    completedAt TIMESTAMP NULL,
    result JSON NULL,
    error TEXT NULL,
    retryCount INT DEFAULT 0,
    maxRetries INT DEFAULT 3,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduledAt),
    INDEX idx_created_at (createdAt)
);
