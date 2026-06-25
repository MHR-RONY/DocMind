import { Schema, model, Document, Model } from 'mongoose';
import { IChatSession } from '../types/chatSession.types';

/**
 * Mongoose document for a ChatSession.
 */
export interface IChatSessionDocument extends IChatSession, Document {}

const chatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const ChatSession: Model<IChatSessionDocument> = model<IChatSessionDocument>(
  'ChatSession',
  chatSessionSchema
);
