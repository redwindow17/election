// ============================================================
// Rate Limiter Middleware
// ============================================================

import rateLimit from 'express-rate-limit';
import { getConfig } from '../config/environment';

/**
 * Create rate limiter configured from environment variables.
 * Default: 50 requests per 15 minutes per IP.
 */
export function createRateLimiter() {
  const config = getConfig();

  return rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests. Please try again later.',
    },
  });
}
