import { Types } from 'mongoose';

/**
 * Mongoose document shape for a ChatSession.
 */
export interface IChatSession {
  userId: Types.ObjectId;
  title: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
