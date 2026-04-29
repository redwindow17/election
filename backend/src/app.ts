// ============================================================
// Express App Setup — Helmet, CORS, Rate-limit, Routes
// ============================================================

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { getConfig } from './config/environment';
import { createRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import electionRoutes from './routes/electionRoutes';
import healthRoutes from './routes/healthRoutes';
import logger from './utils/logger';

export function createApp(): express.Application {
  const app = express();
  const config = getConfig();

  // ── Security Headers ──
  app.use(helmet());

  // ── CORS ──
  const allowedOrigins = config.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Body Parsing ──
  app.use(express.json({ limit: '10kb' }));

  // ── Rate Limiting ──
  app.use(createRateLimiter());

  // ── Request Logging ──
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // ── Routes ──
  app.use('/api/health', healthRoutes);
  app.use('/api/election', electionRoutes);

  // ── 404 Handler ──
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });

  // ── Global Error Handler ──
  app.use(errorHandler);

  return app;
}
