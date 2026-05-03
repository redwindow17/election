// ============================================================
// useAuth Hook — Unit Tests
// ============================================================
// Covers: throws when used outside AuthProvider, returns
// context value when inside provider.
// ============================================================

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { AuthContext } from '../../context/AuthContext';
import React from 'react';

const MOCK_CONTEXT = {
  user: null,
  loading: false,
  error: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  getIdToken: vi.fn(),
  clearError: vi.fn(),
};

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress expected error output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });

  it('returns context value when inside AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: MOCK_CONTEXT }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });

  it('exposes all required context methods', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(AuthContext.Provider, { value: MOCK_CONTEXT }, children);

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signInWithGoogle).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
    expect(typeof result.current.getIdToken).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });
});
