import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { JobStatus, JobPriority, JobResult, JobProgress, SerializedJobFunction } from '@/jobs/types';

@Entity('jobs')
@Index(['status', 'priority', 'createdAt'])
@Index(['status', 'scheduledAt'])
@Index(['createdAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name!: string;

  @Column({ type: 'json' })
  functionData!: SerializedJobFunction;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  })
  @Index()
  status!: JobStatus;

  @Column({ 
    type: 'enum', 
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  })
  @Index()
  priority!: JobPriority;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  scheduledAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'json', nullable: true })
  result?: JobResult;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'int', default: 0 })
  retryCount!: number;

  @Column({ type: 'int', default: 3 })
  maxRetries!: number;

  @Column({ type: 'int', default: 5000 })
  retryDelay!: number;

  @Column({ type: 'int', default: 300000 })
  timeout!: number;

  @Column({ type: 'json', default: () => "'[]'" })
  @Index()
  tags!: string[];

  @Column({ type: 'json', default: () => "'{}'" })
  metadata!: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  progress?: JobProgress;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Virtual property for execution duration
  get executionDuration(): number | null {
    if (this.startedAt && this.completedAt) {
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
    return null;
  }

  // Virtual property for next retry time
  get nextRetryAt(): Date | null {
    if (this.status === 'failed' && this.retryCount < this.maxRetries) {
      const lastFailure = this.updatedAt || this.createdAt;
      return new Date(lastFailure.getTime() + this.retryDelay);
    }
    return null;
  }
}
