// ============================================================
// Firebase App Check Middleware
// ============================================================

import { Response, NextFunction } from 'express';
import { getConfig } from '../config/environment';
import { getAppCheck } from '../services/firebaseAdmin';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

export async function appCheckMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const config = getConfig();
  const token = req.header('X-Firebase-AppCheck');
  const appCheck = getAppCheck();

  if (!config.FIREBASE_APPCHECK_REQUIRED) {
    if (token && appCheck) {
      appCheck.verifyToken(token).catch((error) => {
        logger.warn('Optional App Check verification failed', { error });
      });
    }
    next();
    return;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Missing Firebase App Check token',
    });
    return;
  }

  if (!appCheck) {
    res.status(503).json({
      success: false,
      error: 'Firebase App Check is required but not configured',
    });
    return;
  }

  try {
    await appCheck.verifyToken(token);
    next();
  } catch (error) {
    logger.warn('App Check verification failed', { error });
    res.status(401).json({
      success: false,
      error: 'Invalid Firebase App Check token',
    });
  }
}
