// ============================================================
// Health Check Routes — No auth required
// ============================================================

import { Router, Request, Response } from 'express';
import { HealthCheckResponse } from '../types';
import { getConfig } from '../config/environment';
import { isFirebaseAdminConfigured } from '../services/firebaseAdmin';
import { getBigQueryStatus } from '../services/bigQueryService';
import { getCloudStorageStatus } from '../services/storageService';

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

router.get('/google-services', (_req: Request, res: Response) => {
  const config = getConfig();
  const firebaseAdminConfigured = isFirebaseAdminConfigured();

  res.status(200).json({
    success: true,
    data: {
      firebaseAuth: {
        mode: firebaseAdminConfigured ? 'enabled' : 'demo',
        demoAuthEnabled: config.DEMO_AUTH_ENABLED,
      },
      firestore: {
        mode: firebaseAdminConfigured ? 'enabled' : 'demo',
      },
      vertexAi: {
        mode: config.GOOGLE_CLOUD_PROJECT ? 'enabled' : 'demo',
        model: config.VERTEX_AI_MODEL,
        location: config.VERTEX_AI_LOCATION,
      },
      cloudStorage: getCloudStorageStatus(),
      bigQuery: getBigQueryStatus(),
      cloudFunctions: {
        configured: true,
        source: 'functions',
      },
      firebaseAnalytics: {
        mode: 'client',
      },
      performanceMonitoring: {
        mode: 'client',
      },
      appCheck: {
        required: config.FIREBASE_APPCHECK_REQUIRED,
        mode: firebaseAdminConfigured ? 'verifiable' : 'demo',
      },
    },
  });
});

export default router;
