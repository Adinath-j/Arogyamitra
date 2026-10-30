import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Exception: ${err.message || err}`, err.stack);
  const status = err.status || err.statusCode || 500;
  const detail = err.detail || err.message || 'Internal Server Error';
  res.status(status).json({ detail });
}
