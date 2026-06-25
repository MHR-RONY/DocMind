import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { uploadLimiter } from '../middleware/rateLimiters';
import { uploadSingle } from '../middleware/upload';
import { validateQuery, validateParams } from '../middleware/validate';
import {
  listDocumentsQuerySchema,
  documentIdParamSchema,
} from '../validators/document.validators';
import { UserRole } from '../types/enums';
import * as documentController from '../controllers/document.controller';

const router = Router();

router.get(
  '/',
  authenticate,
  validateQuery(listDocumentsQuerySchema),
  documentController.list,
);
router.post(
  '/upload',
  authenticate,
  requireRole(UserRole.ADMIN),
  uploadLimiter,
  uploadSingle,
  documentController.upload,
);
router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN),
  validateParams(documentIdParamSchema),
  documentController.remove,
);

export default router;
