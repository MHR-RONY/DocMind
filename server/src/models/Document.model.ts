import { Schema, model, Document, Model } from 'mongoose';
import { IDocument } from '../types/document.types';
import { DocumentStatus } from '../types/enums';

/**
 * Mongoose document for ingested Document metadata.
 */
export interface IDocumentDocument extends IDocument, Document {}

const documentSchema = new Schema<IDocumentDocument>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    qdrantPointIds: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(DocumentStatus),
      default: DocumentStatus.PROCESSING,
    },
  },
  { timestamps: true }
);

export const DocumentModel: Model<IDocumentDocument> = model<IDocumentDocument>(
  'Document',
  documentSchema
);
