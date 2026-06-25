import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as documentService from '../services/document.service';
import { ListDocumentsQuery } from '../validators/document.validators';

/**
 * Document HTTP layer. Uploads are admin-only and accept a single in-memory
 * file; the service performs authoritative magic-byte validation and kicks off
 * asynchronous ingestion (hence the 202).
 */

export const upload = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  if (!req.file) {
    throw ApiError.badRequest('No file provided');
  }
  const document = await documentService.ingestDocument(req.file, req.user.id);
  ApiResponse.success(res, 202, 'Document accepted for processing', { document });
});

export const list = catchAsync(async (_req, res) => {
  // Pagination was validated/coerced by validateQuery and stored on res.locals.
  const { page, pageSize } = res.locals.query as ListDocumentsQuery;
  const { documents, pagination } = await documentService.listDocuments(
    page,
    pageSize,
  );
  ApiResponse.paginated(res, 'Documents retrieved', documents, pagination);
});

export const remove = catchAsync(async (req, res) => {
  await documentService.deleteDocument(req.params.id);
  ApiResponse.success(res, 200, 'Document deleted', {});
});
