import { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';
import { ApiError } from '../utils/ApiError';

const BEARER_PREFIX = 'Bearer ';

/**
 * Authenticates a request via the `Authorization: Bearer <token>` header.
 * On success, attaches `req.user = { id, role }`. Throws ApiError.unauthorized
 * for missing/malformed headers or invalid tokens.
 */
export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith(BEARER_PREFIX)) {
      throw ApiError.unauthorized('Missing or malformed authorization header');
    }

    const token = header.slice(BEARER_PREFIX.length).trim();
    if (token.length === 0) {
      throw ApiError.unauthorized('Missing access token');
    }

    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (err) {
    next(err);
  }
};
