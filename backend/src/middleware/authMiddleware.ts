// ============================================================
// Firebase JWT Auth Middleware with demo-safe fallback
// ============================================================

import { Response, NextFunction } from 'express';
import { getConfig } from '../config/environment';
import { getAuth } from '../services/firebaseAdmin';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

function getDemoUserId(req: AuthenticatedRequest): string {
  const headerUser = req.header('X-Demo-User');
  return headerUser?.trim() || 'demo-user';
}

/**
 * Middleware: Extract and verify Firebase ID token from Authorization header.
 * In local/demo mode, accepts a `Bearer demo-token` token so reviewers can run
 * protected flows without a real Firebase project.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const config = getConfig();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token is empty',
    });
    return;
  }

  if (config.DEMO_AUTH_ENABLED && token.startsWith('demo-')) {
    req.user = {
      uid: getDemoUserId(req),
      email: 'demo@example.com',
      name: 'Demo User',
    };
    next();
    return;
  }

  const auth = getAuth();
  if (!auth) {
    res.status(503).json({
      success: false,
      error: 'Firebase Authentication is not configured. Use demo auth locally or configure Firebase.',
    });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };

    logger.debug('User authenticated', { uid: decoded.uid });
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error });
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token',
    });
  }
}
