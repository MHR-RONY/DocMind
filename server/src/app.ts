import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import { generalLimiter } from './middleware/rateLimiters';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { ApiError } from './utils/ApiError';

import authRoutes from './routes/auth.routes';
import documentRoutes from './routes/document.routes';
import chatSessionRoutes from './routes/chatSession.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();

// 1. Secure HTTP headers.
app.use(helmet());

// 2. CORS — explicit origin (no wildcard) so credentialed refresh cookies work.
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  }),
);

// 3. Cookie parsing (refresh token lives in an httpOnly cookie).
app.use(cookieParser());

// 4. JSON body parsing.
app.use(express.json({ limit: '10mb' }));

// 5. Broad per-IP rate limit (authenticated sessions are exempt via the limiter's skip).
app.use(generalLimiter);

// 6. Request logging (never logs bodies, cookies, or secrets).
app.use(requestLogger);

// 7–10. Feature routes.
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatSessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Unmatched routes → 404 through the standard error envelope.
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// 11. Global error handler — must be last.
app.use(errorHandler);

export default app;
