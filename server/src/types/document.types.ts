import { Types } from 'mongoose';
import { DocumentStatus } from './enums';

export type DocumentFileType = 'pdf' | 'docx' | 'txt';

/**
 * Mongoose document shape for an ingested Document's metadata.
 * The raw file is never persisted to disk; only metadata and the
 * Qdrant point ids for its embedded chunks are stored.
 */
export interface IDocument {
  filename: string;
  originalName: string;
  fileType: DocumentFileType;
  fileSize: number;
  uploadedBy: Types.ObjectId;
  chunkCount: number;
  qdrantPointIds: string[];
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A retrieved source chunk reference returned alongside chat answers
 * so the client can attribute responses to their source documents.
 */
export interface SourceDoc {
  documentId: string;
  originalName: string;
  chunkIndex: number;
  score: number;
}
