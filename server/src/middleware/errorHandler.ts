import { ErrorRequestHandler } from 'express';
import { config } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { ApiErrorResponse } from '../types/api.types';

/**
 * Global error handler. Must keep the 4-arg signature so Express recognizes it
 * as an error-handling middleware. Operational ApiErrors are surfaced to the
 * client; unexpected errors return a generic message in production and never
 * leak stack traces or internal details.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const isProduction = config.nodeEnv === 'production';

  if (err instanceof ApiError) {
    if (!err.isOperational) {
      // Non-operational: log full detail server-side for diagnostics.
      // eslint-disable-next-line no-console
      console.error('[errorHandler] Non-operational error:', err);
    }

    const body: ApiErrorResponse = {
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / unexpected error — always log server-side.
  // eslint-disable-next-line no-console
  console.error('[errorHandler] Unexpected error:', err);

  const message =
    isProduction || !(err instanceof Error)
      ? 'Internal server error'
      : err.message;

  const body: ApiErrorResponse = {
    success: false,
    message,
  };
  res.status(500).json(body);
};
