import { config } from '@/config';

// Dynamic model imports based on database type
export const getModels = () => {
  if (config.database.type === 'mongodb') {
    return require('./mongodb');
  } else if (config.database.type === 'mysql') {
    return require('./mysql');
  } else {
    throw new Error(`Unsupported database type: ${config.database.type}`);
  }
};

// Re-export based on current database type
export const { User, Job, AuditLog } = getModels();

// Export types
export type { IUser, IJob, IAuditLog } from './mongodb';
export type { JobStatus } from './mysql';
