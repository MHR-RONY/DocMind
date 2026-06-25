import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validateBody } from '../middleware/validate';
import { createSessionSchema } from '../validators/chat.validators';
import * as chatSessionController from '../controllers/chatSession.controller';

const router = Router();

router.get('/sessions', authenticate, chatSessionController.listSessions);
router.post(
  '/sessions',
  authenticate,
  validateBody(createSessionSchema),
  chatSessionController.createSession,
);
router.get('/sessions/:id', authenticate, chatSessionController.getSession);
router.delete('/sessions/:id', authenticate, chatSessionController.deleteSession);

export default router;
