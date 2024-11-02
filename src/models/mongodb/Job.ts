import mongoose, { Document, Schema } from 'mongoose';
import { JobStatus, JobPriority, JobResult, JobProgress, SerializedJobFunction } from '@/jobs/types';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
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

const jobSchema = new Schema<IJob>({
  name: {
    type: String,
    required: [true, 'Job name is required'],
    trim: true,
    maxlength: [255, 'Job name cannot be longer than 255 characters'],
    index: true
  },
  functionData: {
    functionName: {
      type: String,
      required: true
    },
    args: {
      type: [Schema.Types.Mixed],
      default: []
    },
    module: {
      type: String,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal',
    index: true
  },
  scheduledAt: {
    type: Date,
    default: null,
    index: true
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  result: {
    success: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed, default: null },
    error: { type: String, default: null },
    executionTime: { type: Number, default: null },
    memoryUsage: { type: Number, default: null }
  },
  error: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 0
  },
  retryDelay: {
    type: Number,
    default: 5000, // 5 seconds
    min: 0
  },
  timeout: {
    type: Number,
    default: 300000, // 5 minutes
    min: 1000
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  progress: {
    current: { type: Number, default: 0 },
    total: { type: Number, default: 100 },
    message: { type: String, default: null },
    percentage: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient querying
jobSchema.index({ status: 1, priority: -1, createdAt: 1 });
jobSchema.index({ status: 1, scheduledAt: 1 });
jobSchema.index({ tags: 1, status: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ completedAt: -1 });

// Virtual for execution duration
jobSchema.virtual('executionDuration').get(function(this: IJob) {
  if (this.startedAt && this.completedAt) {
    return this.completedAt.getTime() - this.startedAt.getTime();
  }
  return null;
});

// Virtual for next retry time
jobSchema.virtual('nextRetryAt').get(function(this: IJob) {
  if (this.status === 'failed' && this.retryCount < this.maxRetries) {
    const lastFailure = this.updatedAt || this.createdAt;
    return new Date(lastFailure.getTime() + this.retryDelay);
  }
  return null;
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
