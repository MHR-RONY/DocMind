import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { chatLimiter } from '../middleware/rateLimiters';
import { validateBody } from '../middleware/validate';
import { sendMessageSchema } from '../validators/chat.validators';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// Mounted under /api/chat alongside chatSession.routes by app.ts.
router.post(
  '/sessions/:id/messages',
  authenticate,
  chatLimiter,
  validateBody(sendMessageSchema),
  chatController.sendMessage,
);

export default router;
