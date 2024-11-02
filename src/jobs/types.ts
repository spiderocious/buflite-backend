export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface JobFunction {
  (): Promise<any>;
}

export interface SerializedJobFunction {
  functionName: string;
  args: any[];
  module?: string;
}

export interface JobOptions {
  priority?: JobPriority;
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
  scheduledAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  memoryUsage?: number;
}

export interface JobProgress {
  current: number;
  total: number;
  message?: string;
  percentage: number;
}

export interface JobData {
  id: string;
  name: string;
  functionData: SerializedJobFunction;
  status: JobStatus;
  priority: JobPriority;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: JobResult;
  error?: string;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  tags: string[];
  metadata: Record<string, any>;
  progress?: JobProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobQueueStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  averageExecutionTime: number;
  successRate: number;
}

export interface JobProcessor {
  name: string;
  concurrency?: number;
  process: (job: JobData) => Promise<any>;
}

export interface JobServiceConfig {
  pollInterval: number;
  maxConcurrency: number;
  defaultMaxRetries: number;
  defaultRetryDelay: number;
  defaultTimeout: number;
  cleanupInterval: number;
  maxJobAge: number; // milliseconds
}
