// ============================================================
// Firebase JWT Auth Middleware
// ============================================================

import { Response, NextFunction } from 'express';
import { getAuth } from '../services/firebaseAdmin';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

/**
 * Middleware: Extract and verify Firebase ID token from Authorization header.
 * Attaches decoded user to `req.user`.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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

  try {
    const decoded = await getAuth().verifyIdToken(token);

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
