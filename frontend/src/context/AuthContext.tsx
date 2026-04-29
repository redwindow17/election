// ============================================================
// Auth Context — Firebase Auth State Provider
// ============================================================

import React, { createContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { auth, isFirebaseConfigured, setDemoCurrentUser } from '../config/firebase';
import type { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

type FirebaseUserProfile = Pick<AppUser, 'uid' | 'email' | 'displayName' | 'photoURL'>;

function mapFirebaseUser(user: FirebaseUserProfile): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

function createDemoUser(email = 'demo@example.com'): AppUser {
  return {
    uid: `demo-${email.toLowerCase()}`,
    email,
    displayName: email.split('@')[0],
    photoURL: null,
  };
}

function persistDemoUser(nextUser: AppUser | null) {
  if (nextUser) {
    localStorage.setItem('demoAuthUser', JSON.stringify(nextUser));
    setDemoCurrentUser({
      ...nextUser,
      getIdToken: async () => '',
    });
  } else {
    localStorage.removeItem('demoAuthUser');
    setDemoCurrentUser(null);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const storedUser = localStorage.getItem('demoAuthUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as AppUser;
        setUser(parsedUser);
        persistDemoUser(parsedUser);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth as Auth, (firebaseUser) => {
      setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      if (isFirebaseConfigured) {
        await signInWithEmailAndPassword(auth as Auth, email, password);
      } else {
        const demoUser = createDemoUser(email);
        persistDemoUser(demoUser);
        setUser(demoUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      if (isFirebaseConfigured) {
        await createUserWithEmailAndPassword(auth as Auth, email, password);
      } else {
        const demoUser = createDemoUser(email);
        persistDemoUser(demoUser);
        setUser(demoUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      if (isFirebaseConfigured) {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth as Auth, provider);
      } else {
        const demoUser = createDemoUser('google-demo@example.com');
        demoUser.displayName = 'Google Demo';
        persistDemoUser(demoUser);
        setUser(demoUser);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (isFirebaseConfigured) {
        await firebaseSignOut(auth as Auth);
      } else {
        persistDemoUser(null);
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signInWithGoogle, signOut, getIdToken, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}
