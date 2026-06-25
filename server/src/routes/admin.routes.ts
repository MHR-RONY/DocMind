import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import { validateQuery, validateParams, validateBody } from '../middleware/validate';
import { listDocumentsQuerySchema, documentIdParamSchema } from '../validators/document.validators';
import { blockUserSchema } from '../validators/admin.validators';
import { UserRole } from '../types/enums';
import * as adminController from '../controllers/admin.controller';

const router = Router();

// Every admin route requires an authenticated ADMIN principal.
router.use(authenticate, requireRole(UserRole.ADMIN));

router.get(
  '/users',
  validateQuery(listDocumentsQuerySchema),
  adminController.listUsers,
);
router.patch(
  '/users/:id/block',
  validateParams(documentIdParamSchema),
  validateBody(blockUserSchema),
  adminController.setBlock,
);
router.get('/stats', adminController.getStats);

export default router;
