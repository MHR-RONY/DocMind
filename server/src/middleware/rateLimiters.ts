import rateLimit, { Options } from 'express-rate-limit';
import { Request } from 'express';
import { config } from '../config/env';
import { ApiErrorResponse } from '../types/api.types';

const MINUTE = 60 * 1000;

const errorBody: ApiErrorResponse = {
  success: false,
  message: 'Too many requests',
};

// Shared custom handler so every limiter responds with the standard envelope.
const handler: Options['handler'] = (_req, res) => {
  res.status(429).json(errorBody);
};

// Key by authenticated user id when present, otherwise fall back to IP.
const userKeyGenerator = (req: Request): string => {
  return req.user?.id ?? req.ip ?? 'unknown';
};

export const authLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const chatLimiter = rateLimit({
  windowMs: 1 * MINUTE,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  handler,
});

export const uploadLimiter = rateLimit({
  windowMs: 10 * MINUTE,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  handler,
});

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Exempt authenticated sessions from the broad per-IP limit.
  skip: (req: Request) => Boolean(req.user),
  handler,
});
