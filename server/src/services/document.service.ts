import { randomUUID } from 'crypto';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { DocumentModel, IDocumentDocument } from '../models/Document.model';
import { ApiError } from '../utils/ApiError';
import { splitTextIntoChunks } from '../utils/chunker';
import { validateMagicBytes, detectFileType } from '../utils/magicBytes';
import { validateObjectId } from '../utils/sanitize';
import { DocumentStatus } from '../types/enums';
import { PaginationMeta } from '../types/api.types';
import * as voyageService from './voyage.service';
import * as qdrantService from './qdrant.service';
import { QdrantPoint } from './qdrant.service';

/**
 * Document ingestion service.
 *
 * Owns the full RAG ingestion pipeline: magic-byte validation, text
 * extraction, chunking, embedding, vector upsert, and metadata persistence.
 * The raw file is never written to disk — only the in-memory buffer is used.
 */

const MIME_PDF = 'application/pdf';
const MIME_DOCX =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MIME_TXT = 'text/plain';

/**
 * Extracts plain text from a file buffer based on its MIME type.
 *
 * @throws ApiError.badRequest for unsupported MIME types.
 */
export const parseFile = async (
  buffer: Buffer,
  mimetype: string,
): Promise<string> => {
  switch (mimetype) {
    case MIME_PDF: {
      const result = await pdfParse(buffer);
      return result.text;
    }
    case MIME_DOCX: {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case MIME_TXT:
      return buffer.toString('utf-8');
    default:
      throw ApiError.badRequest(`Unsupported file type: ${mimetype}`);
  }
};

/**
 * Background processing stage of ingestion. Runs after the Document record is
 * created so the HTTP request can return immediately. On any failure the
 * document status is set to FAILED and the error is logged server-side (never
 * leaking secrets).
 */
export const processDocumentAsync = async (
  documentId: string,
  buffer: Buffer,
  mimetype: string,
  originalName: string,
): Promise<void> => {
  try {
    const text = await parseFile(buffer, mimetype);
    const chunks = splitTextIntoChunks(text);

    if (chunks.length === 0) {
      await DocumentModel.findByIdAndUpdate(documentId, {
        chunkCount: 0,
        qdrantPointIds: [],
        status: DocumentStatus.READY,
      });
      return;
    }

    const embeddings = await voyageService.generateEmbeddings(chunks);

    const points: QdrantPoint[] = chunks.map((chunk, index) => ({
      id: randomUUID(),
      vector: embeddings[index] as number[],
      payload: {
        documentId,
        chunkIndex: index,
        text: chunk,
        originalName,
      },
    }));

    await qdrantService.upsertVectors(points);

    await DocumentModel.findByIdAndUpdate(documentId, {
      chunkCount: points.length,
      qdrantPointIds: points.map((point) => point.id),
      status: DocumentStatus.READY,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Document ingestion failed for ${documentId}:`,
      error instanceof Error ? error.message : 'unknown error',
    );
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: DocumentStatus.FAILED,
    }).catch(() => {
      /* swallow — already in failure path */
    });
  }
};

/**
 * Validates and persists a document's metadata, then kicks off asynchronous
 * processing (parse → embed → upsert) without blocking. Returns the freshly
 * created record in PROCESSING state so the controller can respond 202.
 *
 * @throws ApiError.badRequest if file content does not match its declared type.
 */
export const ingestDocument = async (
  file: Express.Multer.File,
  uploadedBy: string,
): Promise<IDocumentDocument> => {
  if (!validateMagicBytes(file.buffer, file.mimetype)) {
    throw ApiError.badRequest('File content does not match its type');
  }

  const fileType = detectFileType(file.buffer, file.mimetype);
  if (fileType === null) {
    throw ApiError.badRequest('File content does not match its type');
  }

  const document = await DocumentModel.create({
    filename: randomUUID(),
    originalName: file.originalname,
    fileType,
    fileSize: file.size,
    uploadedBy,
    chunkCount: 0,
    qdrantPointIds: [],
    status: DocumentStatus.PROCESSING,
  });

  // Fire-and-forget: processing continues after the HTTP response is sent.
  void processDocumentAsync(
    document.id,
    file.buffer,
    file.mimetype,
    file.originalname,
  ).catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(
      `Unhandled ingestion error for ${document.id}:`,
      error instanceof Error ? error.message : 'unknown error',
    );
  });

  return document;
};

/**
 * Returns a paginated, newest-first list of documents.
 */
export const listDocuments = async (
  page: number,
  pageSize: number,
): Promise<{ documents: IDocumentDocument[]; pagination: PaginationMeta }> => {
  const safePage = page > 0 ? page : 1;
  const safePageSize = pageSize > 0 ? pageSize : 10;
  const skip = (safePage - 1) * safePageSize;

  const [documents, total] = await Promise.all([
    DocumentModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safePageSize)
      .exec(),
    DocumentModel.countDocuments().exec(),
  ]);

  const pagination: PaginationMeta = {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.ceil(total / safePageSize),
  };

  return { documents, pagination };
};

/**
 * Deletes a document and all of its associated vectors. Vectors are removed
 * from Qdrant first so a partial failure never leaves orphaned embeddings
 * pointing at a deleted metadata record.
 *
 * @throws ApiError.badRequest for an invalid id, ApiError.notFound if missing.
 */
export const deleteDocument = async (documentId: string): Promise<void> => {
  if (!validateObjectId(documentId)) {
    throw ApiError.badRequest('Invalid document id');
  }

  const document = await DocumentModel.findById(documentId).exec();
  if (document === null) {
    throw ApiError.notFound('Document not found');
  }

  await qdrantService.deleteVectorsByDocumentId(documentId);
  await DocumentModel.findByIdAndDelete(documentId).exec();
};
