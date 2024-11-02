import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config';
import DatabaseFactory from '@/config/database';
import { logger } from '@/utils/logger';
import { CacheService } from '@/services/core/cache';
import { Job } from '@/models';
import {
  JobFunction,
  JobOptions,
  JobData,
  JobStatus,
  JobPriority,
  JobQueueStats,
  JobServiceConfig,
  SerializedJobFunction
} from './types';

class JobService {
  private static instance: JobService;
  private isProcessing = false;
  private runningJobs = new Map<string, Promise<any>>();
  private processors = new Map<string, Function>();
  private config: JobServiceConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private processingTimer?: NodeJS.Timeout;

  private constructor() {
    this.config = {
      pollInterval: config.jobs.pollInterval,
      maxConcurrency: 5,
      defaultMaxRetries: config.jobs.maxRetries,
      defaultRetryDelay: 5000,
      defaultTimeout: 300000, // 5 minutes
      cleanupInterval: config.jobs.cleanupInterval,
      maxJobAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    this.registerDefaultProcessors();
    this.startProcessing();
    this.startCleanup();

    logger.info('Job service initialized');
  }

  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService();
    }
    return JobService.instance;
  }

  /**
   * Schedule a job for execution at a specific time
   */
  public async scheduleJob(
    jobFunction: JobFunction,
    scheduledTime: Date | string,
    options: JobOptions = {}
  ): Promise<string> {
    try {
      const scheduledAt = typeof scheduledTime === 'string' 
        ? new Date(scheduledTime) 
        : scheduledTime;

      if (scheduledAt <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }

      const jobId = await this.createJob(jobFunction, {
        ...options,
        scheduledAt
      });

      logger.info(`Job scheduled: ${jobId} for ${scheduledAt.toISOString()}`);
      return jobId;
    } catch (error) {
      logger.error('Error scheduling job:', error);
      throw error;
    }
  }

  /**
   * Process a job immediately in the background
   */
  public async processInBackground<T = any>(
    jobFunction: JobFunction,
    jobName?: string,
    options: JobOptions = {}
  ): Promise<{ jobId: string; message: string }> {
    try {
      const jobId = await this.createJob(jobFunction, {
        ...options,
        scheduledAt: new Date() // Immediate execution
      }, jobName);

      logger.info(`Job queued for immediate processing: ${jobId}`);
      
      // Trigger immediate processing check
      setImmediate(() => this.processJobs());

      return {
        jobId,
        message: 'Job queued for background processing'
      };
    } catch (error) {
      logger.error('Error queuing background job:', error);
      throw error;
    }
  }

  /**
   * Get job status and details
   */
  public async getJobStatus(jobId: string): Promise<JobData | null> {
    try {
      let job;

      if (config.database.type === 'mongodb') {
        job = await Job.findOne({ id: jobId });
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        job = await jobRepository.findOne({ where: { id: jobId } });
      }

      if (!job) {
        return null;
      }

      return this.jobToData(job);
    } catch (error) {
      logger.error('Error getting job status:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending or scheduled job
   */
  public async cancelJob(jobId: string): Promise<boolean> {
    try {
      let result;

      if (config.database.type === 'mongodb') {
        result = await Job.findOneAndUpdate(
          { id: jobId, status: { $in: ['pending', 'failed'] } },
          { status: 'cancelled', updatedAt: new Date() },
          { new: true }
        );
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        result = await jobRepository.update(
          { id: jobId, status: 'pending' as any },
          { status: 'cancelled' as any }
        );
      }

      if (result) {
        logger.info(`Job cancelled: ${jobId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error cancelling job:', error);
      return false;
    }
  }

  /**
   * Get queue statistics
   */
  public async getQueueStats(): Promise<JobQueueStats> {
    try {
      const cacheKey = 'job:queue:stats';
      const cached = CacheService.getFromCache<JobQueueStats>(cacheKey);
      
      if (cached) {
        return cached;
      }

      let stats: JobQueueStats;

      if (config.database.type === 'mongodb') {
        const pipeline = [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              avgExecutionTime: {
                $avg: {
                  $cond: [
                    { $and: ['$startedAt', '$completedAt'] },
                    { $subtract: ['$completedAt', '$startedAt'] },
                    null
                  ]
                }
              }
            }
          }
        ];

        const results = await Job.aggregate(pipeline);
        stats = this.calculateStats(results);
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        
        const statusCounts = await jobRepository
          .createQueryBuilder('job')
          .select('job.status', 'status')
          .addSelect('COUNT(*)', 'count')
          .groupBy('job.status')
          .getRawMany();

        stats = this.calculateStatsFromCounts(statusCounts);
      }

      // Cache stats for 30 seconds
      CacheService.saveToCache(cacheKey, stats, { expiresIn: 30 });

      return stats;
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      throw error;
    }
  }

  /**
   * Register a custom job processor
   */
  public registerProcessor(name: string, processor: Function): void {
    this.processors.set(name, processor);
    logger.info(`📝 Job processor registered: ${name}`);
  }

  /**
   * Retry a failed job
   */
  public async retryJob(jobId: string): Promise<boolean> {
    try {
      let job;

      if (config.database.type === 'mongodb') {
        job = await Job.findOneAndUpdate(
          { id: jobId, status: 'failed' },
          { 
            status: 'pending',
            retryCount: 0,
            error: null,
            result: null,
            updatedAt: new Date()
          },
          { new: true }
        );
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        
        const result = await jobRepository.update(
          { id: jobId, status: 'failed' as any },
          { 
            status: 'pending' as any,
            retryCount: 0,
            error: null,
            result: null
          }
        );

        job = result.affected && result.affected > 0;
      }

      if (job) {
        logger.info(`🔄 Job retry queued: ${jobId}`);
        setImmediate(() => this.processJobs());
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error retrying job:', error);
      return false;
    }
  }

  /**
   * Get jobs by status with pagination
   */
  public async getJobs(
    status?: JobStatus,
    page = 1,
    limit = 20
  ): Promise<{ jobs: JobData[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      let jobs, total;

      if (config.database.type === 'mongodb') {
        const query = status ? { status } : {};
        
        jobs = await Job.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
        
        total = await Job.countDocuments(query);
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        
        const queryBuilder = jobRepository.createQueryBuilder('job');
        
        if (status) {
          queryBuilder.where('job.status = :status', { status });
        }
        
        jobs = await queryBuilder
          .orderBy('job.createdAt', 'DESC')
          .skip(skip)
          .take(limit)
          .getMany();
        
        total = await queryBuilder.getCount();
      }

      return {
        jobs: jobs.map((job: any) => this.jobToData(job)),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting jobs:', error);
      throw error;
    }
  }

  /**
   * Stop job processing
   */
  public stopProcessing(): void {
    this.isProcessing = false;
    
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = undefined;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    logger.info('Job processing stopped');
  }

  /**
   * Create a new job
   */
  private async createJob(
    jobFunction: JobFunction,
    options: JobOptions = {},
    customName?: string
  ): Promise<string> {
    const jobId = uuidv4();
    const functionData = this.serializeFunction(jobFunction);
    const jobName = customName || functionData.functionName || 'anonymous';

    const jobData = {
      id: jobId,
      name: jobName,
      functionData,
      status: 'pending' as JobStatus,
      priority: options.priority || 'normal' as JobPriority,
      scheduledAt: options.scheduledAt || new Date(),
      maxRetries: options.maxRetries || this.config.defaultMaxRetries,
      retryDelay: options.retryDelay || this.config.defaultRetryDelay,
      timeout: options.timeout || this.config.defaultTimeout,
      tags: options.tags || [],
      metadata: options.metadata || {},
      retryCount: 0
    };

    try {
      if (config.database.type === 'mongodb') {
        const job = new Job(jobData);
        await job.save();
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        const job = jobRepository.create(jobData);
        await jobRepository.save(job);
      }

      logger.debug(`💼 Job created: ${jobId} (${jobName})`);
      return jobId;
    } catch (error) {
      logger.error('Error creating job:', error);
      throw error;
    }
  }

  /**
   * Serialize job function for storage
   */
  private serializeFunction(fn: JobFunction): SerializedJobFunction {
    // For now, we'll store the function as a string
    // In production, you might want to use a more sophisticated approach
    return {
      functionName: fn.name || 'anonymous',
      args: [],
      // Store function code as string (be careful with this in production)
      module: fn.toString()
    };
  }

  /**
   * Start the job processing loop
   */
  private startProcessing(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processingTimer = setInterval(() => {
      this.processJobs();
    }, this.config.pollInterval);

    logger.info('🔄 Job processing started');
  }

  /**
   * Start cleanup timer
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldJobs();
    }, this.config.cleanupInterval);

    logger.info('🧹 Job cleanup started');
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    try {
      if (this.runningJobs.size >= this.config.maxConcurrency) {
        return; // Max concurrency reached
      }

      const pendingJobs = await this.getPendingJobs();
      
      for (const job of pendingJobs) {
        if (this.runningJobs.size >= this.config.maxConcurrency) {
          break;
        }

        this.runningJobs.set(job.id, this.executeJob(job));
      }
    } catch (error) {
      logger.error('Error in job processing loop:', error);
    }
  }

  /**
   * Get pending jobs ready for execution
   */
  private async getPendingJobs(): Promise<any[]> {
    const now = new Date();
    
    try {
      if (config.database.type === 'mongodb') {
        return await Job.find({
          status: 'pending',
          $or: [
            { scheduledAt: { $lte: now } },
            { scheduledAt: null }
          ]
        })
        .sort({ priority: -1, createdAt: 1 })
        .limit(this.config.maxConcurrency - this.runningJobs.size);
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        
        return await jobRepository
          .createQueryBuilder('job')
          .where('job.status = :status', { status: 'pending' })
          .andWhere('(job.scheduledAt <= :now OR job.scheduledAt IS NULL)', { now })
          .orderBy('job.priority', 'DESC')
          .addOrderBy('job.createdAt', 'ASC')
          .limit(this.config.maxConcurrency - this.runningJobs.size)
          .getMany();
      }
    } catch (error) {
      logger.error('Error getting pending jobs:', error);
      return [];
    }
  }

  /**
   * Execute a single job
   */
  private async executeJob(job: any): Promise<void> {
    const startTime = Date.now();
    const jobData = this.jobToData(job);

    try {
      logger.info(`Executing job: ${job.id} (${job.name})`);

      // Update job status to running
      await this.updateJobStatus(job.id, 'running', {
        startedAt: new Date()
      });

      // Execute the job with timeout
      const result = await Promise.race([
        this.runJobFunction(jobData),
        this.createTimeoutPromise(jobData.timeout)
      ]);

      const executionTime = Date.now() - startTime;

      // Update job as completed
      await this.updateJobStatus(job.id, 'completed', {
        completedAt: new Date(),
        result: {
          success: true,
          data: result,
          executionTime
        }
      });

      logger.info(`Job completed: ${job.id} in ${executionTime}ms`);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`Job failed: ${job.id} - ${errorMessage}`);

      // Handle retry logic
      if (job.retryCount < job.maxRetries) {
        await this.scheduleRetry(job);
      } else {
        await this.updateJobStatus(job.id, 'failed', {
          completedAt: new Date(),
          error: errorMessage,
          result: {
            success: false,
            error: errorMessage,
            executionTime
          }
        });
      }
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  /**
   * Run the actual job function
   */
  private async runJobFunction(jobData: JobData): Promise<any> {
    const { functionData } = jobData;

    // Check if we have a registered processor
    const processor = this.processors.get(functionData.functionName);
    if (processor) {
      return await processor(jobData);
    }

    // Try to reconstruct and execute the function
    // This is a simplified approach - in production you'd want better security
    if (functionData.module) {
      try {
        // Create function from stored code
        const fn = new Function('return ' + functionData.module)();
        return await fn();
      } catch (error) {
        throw new Error(`Failed to execute job function: ${error}`);
      }
    }

    throw new Error(`No processor found for job: ${functionData.functionName}`);
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Job timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Schedule a job retry
   */
  private async scheduleRetry(job: any): Promise<void> {
    const retryAt = new Date(Date.now() + job.retryDelay);
    
    await this.updateJobStatus(job.id, 'pending', {
      retryCount: job.retryCount + 1,
      scheduledAt: retryAt,
      error: null
    });

    logger.info(`🔄 Job retry scheduled: ${job.id} (attempt ${job.retryCount + 1}/${job.maxRetries})`);
  }

  /**
   * Clean up old completed jobs
   */
  private async cleanupOldJobs(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.maxJobAge);
      let deletedCount = 0;

      if (config.database.type === 'mongodb') {
        const result = await Job.deleteMany({
          status: { $in: ['completed', 'failed', 'cancelled'] },
          completedAt: { $lt: cutoffDate }
        });
        deletedCount = result.deletedCount || 0;
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        
        const result = await jobRepository
          .createQueryBuilder()
          .delete()
          .where('status IN (:...statuses)', { statuses: ['completed', 'failed', 'cancelled'] })
          .andWhere('completedAt < :cutoffDate', { cutoffDate })
          .execute();
        
        deletedCount = result.affected || 0;
      }

      if (deletedCount > 0) {
        logger.info(`🧹 Cleaned up ${deletedCount} old jobs`);
      }
    } catch (error) {
      logger.error('Error during job cleanup:', error);
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string, 
    status: JobStatus, 
    updates: Partial<any> = {}
  ): Promise<void> {
    try {
      const updateData = {
        status,
        ...updates,
        updatedAt: new Date()
      };

      if (config.database.type === 'mongodb') {
        await Job.findOneAndUpdate({ id: jobId }, updateData);
      } else {
        const connection = DatabaseFactory.getMySQLConnection();
        const jobRepository = connection.getRepository(Job);
        await jobRepository.update({ id: jobId }, updateData);
      }
    } catch (error) {
      logger.error('Error updating job status:', error);
    }
  }

  /**
   * Convert job model to JobData
   */
  private jobToData(job: any): JobData {
    return {
      id: job.id,
      name: job.name,
      functionData: job.functionData,
      status: job.status,
      priority: job.priority,
      scheduledAt: job.scheduledAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      result: job.result,
      error: job.error,
      retryCount: job.retryCount,
      maxRetries: job.maxRetries,
      retryDelay: job.retryDelay,
      timeout: job.timeout,
      tags: job.tags || [],
      metadata: job.metadata || {},
      progress: job.progress,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    };
  }

  /**
   * Calculate stats from aggregation results
   */
  private calculateStats(results: any[]): JobQueueStats {
    const stats = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageExecutionTime: 0,
      successRate: 0
    };

    let totalExecutionTime = 0;
    let executionCount = 0;

    results.forEach(result => {
      const status = result._id;
      const count = result.count;

      stats.total += count;
      stats[status as keyof JobQueueStats] = count;

      if (result.avgExecutionTime) {
        totalExecutionTime += result.avgExecutionTime * count;
        executionCount += count;
      }
    });

    stats.averageExecutionTime = executionCount > 0 ? totalExecutionTime / executionCount : 0;
    stats.successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return stats;
  }

  /**
   * Calculate stats from status counts (MySQL)
   */
  private calculateStatsFromCounts(statusCounts: any[]): JobQueueStats {
    const stats = {
      total: 0,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageExecutionTime: 0,
      successRate: 0
    };

    statusCounts.forEach(({ status, count }) => {
      stats.total += parseInt(count);
      stats[status as keyof JobQueueStats] = parseInt(count);
    });

    stats.successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return stats;
  }

  /**
   * Register default job processors
   */
  private registerDefaultProcessors(): void {
    // Email processor
    this.registerProcessor('sendEmail', async (jobData: JobData) => {
      const { metadata } = jobData;
      logger.info(`📧 Sending email to: ${metadata.to}`);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { messageId: 'email_' + Date.now() };
    });

    // Data processing processor
    this.registerProcessor('processData', async (jobData: JobData) => {
      const { metadata } = jobData;
      logger.info(`Processing data: ${metadata.type}`);
      
      // Simulate data processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { processedCount: Math.floor(Math.random() * 1000) };
    });

    // File cleanup processor
    this.registerProcessor('cleanupFiles', async (jobData: JobData) => {
      const { metadata } = jobData;
      logger.info(`Cleaning up files: ${metadata.path}`);
      
      // Simulate file cleanup
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { deletedFiles: Math.floor(Math.random() * 50) };
    });

    // Report generation processor
    this.registerProcessor('generateReport', async (jobData: JobData) => {
      const { metadata } = jobData;
      logger.info(`📋 Generating report: ${metadata.reportType}`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      return { 
        reportId: 'report_' + Date.now(),
        path: `/reports/${metadata.reportType}_${Date.now()}.pdf`
      };
    });
  }
}

// Export singleton instance
export const jobService = JobService.getInstance();
export default jobService;
