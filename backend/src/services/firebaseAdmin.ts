// ============================================================
// Firebase Admin SDK - Singleton Initialization
// ============================================================

import * as admin from 'firebase-admin';
import { getConfig } from '../config/environment';
import logger from '../utils/logger';

let initialized = false;
let initializationAttempted = false;

function hasUsableFirebaseProject(): boolean {
  const config = getConfig();
  return Boolean(config.FIREBASE_PROJECT_ID);
}

/**
 * Initialize Firebase Admin SDK with Application Default Credentials.
 * Safe to call multiple times. In demo mode this returns null instead of
 * failing startup, so the app remains reviewable without a Google project.
 */
export function initializeFirebaseAdmin(): admin.app.App | null {
  if (initialized && admin.apps.length > 0) {
    return admin.app();
  }

  const config = getConfig();
  initializationAttempted = true;

  if (!hasUsableFirebaseProject()) {
    logger.warn('Firebase Admin SDK running in demo mode; FIREBASE_PROJECT_ID is not configured');
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: config.FIREBASE_PROJECT_ID,
    });

    initialized = true;
    logger.info('Firebase Admin SDK initialized', {
      projectId: config.FIREBASE_PROJECT_ID,
    });

    return app;
  } catch (error) {
    logger.warn('Firebase Admin SDK unavailable; continuing with demo-safe adapters', { error });
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  if (!initializationAttempted && hasUsableFirebaseProject()) {
    initializeFirebaseAdmin();
  }

  return initialized && admin.apps.length > 0;
}

export function getFirestore(): admin.firestore.Firestore | null {
  if (!isFirebaseAdminConfigured()) return null;
  return admin.firestore();
}

export function getAuth(): admin.auth.Auth | null {
  if (!isFirebaseAdminConfigured()) return null;
  return admin.auth();
}

export function getAppCheck(): admin.appCheck.AppCheck | null {
  if (!isFirebaseAdminConfigured()) return null;
  return admin.appCheck();
}

export default admin;
