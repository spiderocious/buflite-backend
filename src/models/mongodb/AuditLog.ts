import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: string;
  user: string;
  description: string;
  data?: any;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    environment: string;
    version?: string;
    requestId?: string;
  };
}

const auditLogSchema = new Schema<IAuditLog>({
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [100, 'Action cannot be longer than 100 characters'],
    index: true
  },
  user: {
    type: String,
    required: [true, 'User is required'],
    trim: true,
    default: 'SYSTEM',
    maxlength: [255, 'User cannot be longer than 255 characters'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be longer than 1000 characters']
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    trim: true,
    maxlength: [45, 'IP address cannot be longer than 45 characters'] // IPv6 max length
  },
  userAgent: {
    type: String,
    trim: true,
    maxlength: [500, 'User agent cannot be longer than 500 characters']
  },
  metadata: {
    environment: {
      type: String,
      default: process.env.NODE_ENV || 'development'
    },
    version: {
      type: String,
      default: process.env.npm_package_version || '1.0.0'
    },
    requestId: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: false, // We're using our own timestamp field
  collection: 'audit_logs'
});

// Compound indexes for efficient querying
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, user: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 }); // For general time-based queries

// TTL index - optional: auto-delete logs after certain period (e.g., 1 year)
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
