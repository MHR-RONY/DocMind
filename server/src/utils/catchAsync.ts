import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler so any rejected promise is forwarded to the
 * error-handling middleware via next(). Keeps controllers free of try/catch.
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
