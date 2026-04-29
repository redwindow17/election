// ============================================================
// Health Check Routes — No auth required
// ============================================================

import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '../types';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const response: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(response);
});

export default router;
