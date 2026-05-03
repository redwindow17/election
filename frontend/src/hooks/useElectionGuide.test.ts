// ============================================================
// useElectionGuide Hook Tests
// ============================================================

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useElectionGuide } from './useElectionGuide';
import { fetchElectionGuide } from '../services/apiService';
import { measureAsync } from '../services/telemetryService';

vi.mock('../services/apiService', () => ({
  fetchElectionGuide: vi.fn(),
}));

vi.mock('../services/telemetryService', () => ({
  measureAsync: vi.fn((_, fn) => fn()),
}));

const mockInput = {
  age: 28,
  state: 'Delhi',
  question: 'How do I register to vote?',
  voterIdStatus: 'registered' as const,
  language: 'en' as const,
};

const mockResponse = {
  personalizedAdvice: 'Check your voter registration.',
  steps: [{ stepNumber: 1, title: 'Step 1', description: 'Do this.' }],
  conversationId: 'conv-1',
};

describe('useElectionGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts with null result and no loading', () => {
    const { result } = renderHook(() => useElectionGuide());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets result on successful API call', async () => {
    vi.mocked(fetchElectionGuide).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useElectionGuide());

    await act(async () => {
      await result.current.generateGuide(mockInput);
    });

    expect(result.current.result).toEqual(mockResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets fallback result and error message on API failure', async () => {
    vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useElectionGuide());

    await act(async () => {
      await result.current.generateGuide(mockInput);
    });

    // Should show fallback guide
    expect(result.current.result).not.toBeNull();
    expect(result.current.result?.conversationId).toBe('local-preview');
    // Should surface the error
    expect(result.current.error).toContain('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('clears result when clearResult is called', async () => {
    vi.mocked(fetchElectionGuide).mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useElectionGuide());

    await act(async () => {
      await result.current.generateGuide(mockInput);
    });

    act(() => {
      result.current.clearResult();
    });

    expect(result.current.result).toBeNull();
  });

  it('clears error when clearError is called', async () => {
    vi.mocked(fetchElectionGuide).mockRejectedValue(new Error('Fail'));
    const { result } = renderHook(() => useElectionGuide());

    await act(async () => {
      await result.current.generateGuide(mockInput);
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('sets loading to true during API call', async () => {
    let resolveGuide!: (value: typeof mockResponse) => void;
    vi.mocked(fetchElectionGuide).mockReturnValue(
      new Promise((resolve) => { resolveGuide = resolve; })
    );

    const { result } = renderHook(() => useElectionGuide());

    act(() => {
      void result.current.generateGuide(mockInput);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveGuide(mockResponse);
    });

    expect(result.current.loading).toBe(false);
  });
});
