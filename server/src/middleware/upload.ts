import multer from 'multer';
import { ApiError } from '../utils/ApiError';

/**
 * Multer upload middleware.
 *
 * Files are held in memory only — never written to disk — so the raw buffer
 * can be magic-byte validated and parsed in-process. This `fileFilter` is the
 * first, cheap gate on the declared MIME type; authoritative content
 * verification (magic bytes) happens later in the document service.
 */

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 1;

const ALLOWED_MIME_TYPES = new Set<string>([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: MAX_FILES,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest('Unsupported file type'));
      return;
    }
    cb(null, true);
  },
});

/** Accepts a single file under the `file` field. */
export const uploadSingle = upload.single('file');
