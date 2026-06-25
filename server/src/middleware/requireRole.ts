import { RequestHandler } from 'express';
import { UserRole } from '../types/enums';
import { ApiError } from '../utils/ApiError';

/**
 * Restricts access to the given roles. Requires `authenticate` to have run
 * first so `req.user` is populated.
 */
export const requireRole = (...roles: UserRole[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
};
