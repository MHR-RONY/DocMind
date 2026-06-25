import { Types } from 'mongoose';
import { MessageRole } from './enums';
import { SourceDoc } from './document.types';

/**
 * Token accounting for an assistant message, as reported by the LLM.
 */
export interface ITokenUsage {
  inputTokens: number;
  outputTokens: number;
}

/**
 * Mongoose document shape for a single chat Message.
 * `tokenUsage` and `sourceDocs` are only present on assistant messages.
 */
export interface IMessage {
  sessionId: Types.ObjectId;
  role: MessageRole;
  content: string;
  tokenUsage?: ITokenUsage;
  sourceDocs?: SourceDoc[];
  createdAt: Date;
  updatedAt: Date;
}
