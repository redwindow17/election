// ============================================================
// Firebase Admin SDK — Singleton Initialization
// ============================================================

import * as admin from 'firebase-admin';
import { getConfig } from '../config/environment';
import logger from '../utils/logger';

let initialized = false;

/**
 * Initialize Firebase Admin SDK with Application Default Credentials.
 * Safe to call multiple times — only initializes once.
 */
export function initializeFirebaseAdmin(): admin.app.App {
  if (initialized) {
    return admin.app();
  }

  const config = getConfig();

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
    logger.error('Failed to initialize Firebase Admin SDK', { error });
    throw error;
  }
}

/**
 * Get Firestore instance (shorthand).
 */
export function getFirestore(): admin.firestore.Firestore {
  return admin.firestore();
}

/**
 * Get Auth instance (shorthand).
 */
export function getAuth(): admin.auth.Auth {
  return admin.auth();
}

export default admin;
