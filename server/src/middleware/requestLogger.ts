import { RequestHandler } from 'express';

/**
 * Logs method, path, status code, and response time once the response is
 * finished. Deliberately never logs request bodies, headers, cookies, or any
 * credential material to avoid leaking secrets.
 */
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = process.hrtime.bigint();
  const { method, originalUrl } = req;

  res.on('finish', () => {
    const elapsedNs = process.hrtime.bigint() - start;
    const elapsedMs = Number(elapsedNs) / 1_000_000;
    // eslint-disable-next-line no-console
    console.log(
      `${method} ${originalUrl} ${res.statusCode} ${elapsedMs.toFixed(1)}ms`
    );
  });

  next();
};
