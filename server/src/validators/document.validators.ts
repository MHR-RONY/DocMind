import { z } from 'zod';

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

/**
 * Route param schema validating a 24-char hex MongoDB ObjectId.
 */
export const documentIdParamSchema = z
  .object({
    id: z.string().refine((value) => OBJECT_ID_REGEX.test(value), {
      message: 'Invalid document id',
    }),
  })
  .strict();

/**
 * Query schema for GET /api/documents with pagination.
 */
export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
