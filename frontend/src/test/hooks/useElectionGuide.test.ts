// ============================================================
// useElectionGuide Hook — Unit Tests
// ============================================================
// Covers: initial state, successful generation, API failure
// with fallback + error message, clearResult, clearError,
// loading flag lifecycle.
// ============================================================

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useElectionGuide } from '../../hooks/useElectionGuide';
import { fetchElectionGuide } from '../../services/apiService';

vi.mock('../../services/apiService', () => ({
  fetchElectionGuide: vi.fn(),
}));

const INPUT = {
  age: 28,
  state: 'Delhi',
  question: 'How do I register to vote?',
  voterIdStatus: 'registered' as const,
  language: 'en' as const,
};

const MOCK_RESPONSE = {
  personalizedAdvice: 'Check your voter registration.',
  steps: [{ stepNumber: 1, title: 'Step 1', description: 'Do this.' }],
  conversationId: 'conv-1',
};

describe('useElectionGuide', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Initial state ──────────────────────────────────────
  describe('initial state', () => {
    it('result is null', () => {
      const { result } = renderHook(() => useElectionGuide());
      expect(result.current.result).toBeNull();
    });

    it('loading is false', () => {
      const { result } = renderHook(() => useElectionGuide());
      expect(result.current.loading).toBe(false);
    });

    it('error is null', () => {
      const { result } = renderHook(() => useElectionGuide());
      expect(result.current.error).toBeNull();
    });
  });

  // ── Successful generation ──────────────────────────────
  describe('successful generation', () => {
    it('sets result on success', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      expect(result.current.result).toEqual(MOCK_RESPONSE);
    });

    it('clears error on success', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      expect(result.current.error).toBeNull();
    });

    it('loading is false after success', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      expect(result.current.loading).toBe(false);
    });
  });

  // ── API failure ────────────────────────────────────────
  describe('API failure', () => {
    it('sets fallback result on failure', async () => {
      vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.conversationId).toBe('local-preview');
    });

    it('sets error message on failure', async () => {
      vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      expect(result.current.error).toContain('Network error');
    });

    it('loading is false after failure', async () => {
      vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Fail'));
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      expect(result.current.loading).toBe(false);
    });
  });

  // ── Loading lifecycle ──────────────────────────────────
  describe('loading lifecycle', () => {
    it('sets loading=true during API call', async () => {
      let resolve!: (v: typeof MOCK_RESPONSE) => void;
      vi.mocked(fetchElectionGuide).mockReturnValue(new Promise((r) => { resolve = r; }));
      const { result } = renderHook(() => useElectionGuide());
      act(() => { void result.current.generateGuide(INPUT); });
      expect(result.current.loading).toBe(true);
      await act(async () => { resolve(MOCK_RESPONSE); });
      expect(result.current.loading).toBe(false);
    });
  });

  // ── clearResult ────────────────────────────────────────
  describe('clearResult', () => {
    it('sets result back to null', async () => {
      vi.mocked(fetchElectionGuide).mockResolvedValue(MOCK_RESPONSE);
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      act(() => { result.current.clearResult(); });
      expect(result.current.result).toBeNull();
    });
  });

  // ── clearError ─────────────────────────────────────────
  describe('clearError', () => {
    it('sets error back to null', async () => {
      vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Fail'));
      const { result } = renderHook(() => useElectionGuide());
      await act(async () => { await result.current.generateGuide(INPUT); });
      act(() => { result.current.clearError(); });
      expect(result.current.error).toBeNull();
    });
  });
});
