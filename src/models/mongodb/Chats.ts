import mongoose, { Document, Schema } from 'mongoose';

export enum ChatStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Chat extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  message: string;
  sender: string;
  response: string;
  modelName: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  status: ChatStatus;
}

const chatSchema = new Schema<Chat>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      default: '',
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ChatStatus),
      default: ChatStatus.PENDING,
      required: true,
    },
    type: {
      type: String,
      default: 'content',
      required: true,
    },
    modelName: {
      type: String,
      default: 'anthropic',
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
    },
    toObject: {
      virtuals: true,
      getters: true,
      versionKey: false,
    },
  }
);

chatSchema.index({ id: 1, sender: 1 }, { unique: true });
chatSchema.index({ createdAt: -1 });

export const ChatModel = mongoose.model<Chat>('Chat', chatSchema);
