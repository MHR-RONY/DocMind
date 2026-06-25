import { RequestHandler } from 'express';
import { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';
import { ApiFieldError } from '../types/api.types';
import { stripDollarKeys } from '../utils/sanitize';

/**
 * Request-validation middleware factories.
 *
 * Each factory sanitizes its target against NoSQL operator injection
 * (`stripDollarKeys`) BEFORE parsing, then validates with the supplied Zod
 * schema. On failure, Zod issues are mapped to the standard `ApiFieldError[]`
 * shape and forwarded as a 400 via the global error handler. On success the
 * parsed (coerced/transformed) value is made available to downstream handlers.
 */

/** Maps Zod issues to the API's field-error envelope. */
const toFieldErrors = (
  issues: { path: PropertyKey[]; message: string }[],
): ApiFieldError[] =>
  issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

/**
 * Validates `req.body`. The parsed value is reassigned to `req.body` so any
 * Zod coercion/transforms apply downstream.
 */
export const validateBody = <T>(schema: ZodType<T>): RequestHandler => {
  return (req, _res, next) => {
    const sanitized = stripDollarKeys(req.body);
    const result = schema.safeParse(sanitized);
    if (!result.success) {
      next(ApiError.badRequest('Validation failed', toFieldErrors(result.error.issues)));
      return;
    }
    req.body = result.data;
    next();
  };
};

/**
 * Validates `req.params`. Parsed values are merged back in place via
 * `Object.assign` (params are a fixed string dictionary, so reassigning the
 * reference is avoided).
 */
export const validateParams = <T>(schema: ZodType<T>): RequestHandler => {
  return (req, _res, next) => {
    const sanitized = stripDollarKeys(req.params);
    const result = schema.safeParse(sanitized);
    if (!result.success) {
      next(ApiError.badRequest('Validation failed', toFieldErrors(result.error.issues)));
      return;
    }
    Object.assign(req.params, result.data);
    next();
  };
};

/**
 * Validates `req.query`. Express 4 exposes `req.query` via a getter that cannot
 * be reassigned, and `Object.assign` would not apply Zod's numeric coercion;
 * the parsed result is therefore stored on `res.locals.query` for controllers
 * to read in a type-safe way.
 */
export const validateQuery = <T>(schema: ZodType<T>): RequestHandler => {
  return (req, res, next) => {
    const sanitized = stripDollarKeys(req.query);
    const result = schema.safeParse(sanitized);
    if (!result.success) {
      next(ApiError.badRequest('Validation failed', toFieldErrors(result.error.issues)));
      return;
    }
    res.locals.query = result.data;
    next();
  };
};
