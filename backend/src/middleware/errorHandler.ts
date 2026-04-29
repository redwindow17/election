// ============================================================
// Global Error Handler Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Catch-all error handler.
 * Logs the full error with Winston, returns a safe JSON response.
 * Never leaks stack traces in production.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    name: err.name,
  });

  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
