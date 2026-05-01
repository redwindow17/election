// ============================================================
// Firebase Client SDK Initialization
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { AppCheck } from 'firebase/app-check';
import type { Analytics } from 'firebase/analytics';
import type { Firestore } from 'firebase/firestore';
import type { FirebasePerformance } from 'firebase/performance';
import type { AppUser } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
};

export type AuthUserLike = AppUser & {
  getIdToken: () => Promise<string>;
};

const missingFirebaseConfig = Object.entries(requiredFirebaseConfig)
  .filter(([, value]) => !value || value === '...' || String(value).startsWith('your-'))
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);

export const isFirebaseConfigured = missingFirebaseConfig.length === 0;

const demoAuth = {
  currentUser: null as AuthUserLike | null,
};

export function setDemoCurrentUser(user: AuthUserLike | null) {
  demoAuth.currentUser = user;
}

export function getDemoCurrentUserId(): string | null {
  return demoAuth.currentUser?.uid ?? null;
}

const app: FirebaseApp | null = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth: Auth | typeof demoAuth = app ? getAuth(app) : demoAuth;

let firestorePromise: Promise<Firestore> | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;
let performancePromise: Promise<FirebasePerformance> | null = null;
let appCheckPromise: Promise<AppCheck> | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  return app;
}

export async function getFirestoreDb(): Promise<Firestore | null> {
  if (!app) return null;
  firestorePromise ??= import('firebase/firestore').then(({ getFirestore }) => getFirestore(app));
  return firestorePromise;
}

export async function getAnalyticsClient(): Promise<Analytics | null> {
  if (!app || typeof window === 'undefined') return null;
  analyticsPromise ??= import('firebase/analytics').then(async ({ getAnalytics, isSupported }) => {
    const supported = await isSupported();
    return supported ? getAnalytics(app) : null;
  });
  return analyticsPromise;
}

export async function getPerformanceClient(): Promise<FirebasePerformance | null> {
  if (!app || typeof window === 'undefined') return null;
  performancePromise ??= import('firebase/performance').then(({ getPerformance }) => getPerformance(app));
  return performancePromise;
}

async function getAppCheckClient(): Promise<AppCheck | null> {
  if (!app || !import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY || typeof window === 'undefined') {
    return null;
  }

  appCheckPromise ??= import('firebase/app-check').then(({ initializeAppCheck, ReCaptchaV3Provider }) =>
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    })
  );

  return appCheckPromise;
}

export async function getAppCheckToken(): Promise<string | null> {
  const appCheck = await getAppCheckClient();
  if (!appCheck) return null;

  const { getToken } = await import('firebase/app-check');
  const token = await getToken(appCheck, false);
  return token.token;
}

export default app;
