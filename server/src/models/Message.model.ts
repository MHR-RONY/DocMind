import { Schema, model, Document, Model } from 'mongoose';
import { IMessage } from '../types/message.types';
import { MessageRole } from '../types/enums';

/**
 * Mongoose document for a single chat Message.
 */
export interface IMessageDocument extends IMessage, Document {}

const tokenUsageSchema = new Schema(
  {
    inputTokens: { type: Number, required: true },
    outputTokens: { type: Number, required: true },
  },
  { _id: false }
);

const sourceDocSchema = new Schema(
  {
    documentId: { type: String, required: true },
    originalName: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const messageSchema = new Schema<IMessageDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MessageRole),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenUsage: {
      type: tokenUsageSchema,
      required: false,
    },
    sourceDocs: {
      type: [sourceDocSchema],
      required: false,
    },
  },
  { timestamps: true }
);

export const Message: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema);
