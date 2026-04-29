// ============================================================
// Firebase Client SDK Initialization
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import type { AppUser } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export type AuthUserLike = AppUser & {
  getIdToken: () => Promise<string>;
};

const missingFirebaseConfig = Object.entries(firebaseConfig)
  .filter(([, value]) => !value || value === '...' || String(value).startsWith('your-'))
  .map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);

export const isFirebaseConfigured = missingFirebaseConfig.length === 0;

const demoAuth = {
  currentUser: null as AuthUserLike | null,
};

export function setDemoCurrentUser(user: AuthUserLike | null) {
  demoAuth.currentUser = user;
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth: Auth | typeof demoAuth = app ? getAuth(app) : demoAuth;

export default app;
