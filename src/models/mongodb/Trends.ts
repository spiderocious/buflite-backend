import mongoose, { Document, Schema } from 'mongoose';

export interface Trends extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  data: Record<string, any>;
  modelName: string;
  createdAt: Date;
  updatedAt: Date;
}

const trendsSchema = new Schema<Trends>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    data: {
      type: Object,
      required: true,
    },
    modelName: {
      type: String,
      default: 'defaultModel',
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
    },
  }
);

trendsSchema.index({ createdAt: -1 }); // Index for sorting by creation date
trendsSchema.index({ modelName: 1 }); // Index for model name queries

export const TrendsModel = mongoose.model<Trends>('Trends', trendsSchema);
export default TrendsModel;
