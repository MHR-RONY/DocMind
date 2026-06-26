import { ApiFieldError } from '../types/api.types';

/**
 * Operational application error carrying an HTTP status code and optional
 * field-level validation errors. Distinguishes expected (operational) errors
 * from unexpected programming errors so the global handler can respond safely.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: ApiFieldError[];

  constructor(
    statusCode: number,
    message: string,
    errors?: ApiFieldError[],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Preserve prototype chain when targeting ES (transpiled) output.
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors?: ApiFieldError[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized', errors?: ApiFieldError[]): ApiError {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Forbidden', errors?: ApiFieldError[]): ApiError {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Not found', errors?: ApiFieldError[]): ApiError {
    return new ApiError(404, message, errors);
  }

  static conflict(message = 'Conflict', errors?: ApiFieldError[]): ApiError {
    return new ApiError(409, message, errors);
  }

  static tooManyRequests(message = 'Too many requests', errors?: ApiFieldError[]): ApiError {
    return new ApiError(429, message, errors);
  }

  static internal(message = 'Internal server error', errors?: ApiFieldError[]): ApiError {
    // Internal errors are non-operational by default.
    return new ApiError(500, message, errors, false);
  }

  static notImplemented(message = 'Not implemented', errors?: ApiFieldError[]): ApiError {
    return new ApiError(503, message, errors);
  }
}
