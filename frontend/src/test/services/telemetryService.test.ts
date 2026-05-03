// ============================================================
// telemetryService — Unit Tests
// ============================================================
// Covers: trackClientEvent no-ops in demo mode, measureAsync
// returns action result, measureAsync handles action failure.
// ============================================================

import { describe, expect, it, vi } from 'vitest';

// Import the REAL module (not the mock from setup.ts)
// We need to un-mock it for this specific test file
vi.unmock('../../services/telemetryService');

import { measureAsync, trackClientEvent } from '../../services/telemetryService';

describe('telemetryService', () => {
  // ── trackClientEvent ───────────────────────────────────
  describe('trackClientEvent', () => {
    it('resolves without throwing when Firebase is not configured', async () => {
      await expect(trackClientEvent('test_event', { source: 'test' })).resolves.toBeUndefined();
    });

    it('resolves with no params', async () => {
      await expect(trackClientEvent('test_event')).resolves.toBeUndefined();
    });
  });

  // ── measureAsync ───────────────────────────────────────
  describe('measureAsync', () => {
    it('returns the action result', async () => {
      const action = vi.fn().mockResolvedValue('done');
      const result = await measureAsync('test_trace', action);
      expect(result).toBe('done');
    });

    it('calls the action exactly once', async () => {
      const action = vi.fn().mockResolvedValue(42);
      await measureAsync('test_trace', action);
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('propagates action errors', async () => {
      const action = vi.fn().mockRejectedValue(new Error('Action failed'));
      await expect(measureAsync('test_trace', action)).rejects.toThrow('Action failed');
    });

    it('works with synchronous-style async actions', async () => {
      const action = async () => ({ value: 99 });
      const result = await measureAsync('test_trace', action);
      expect(result).toEqual({ value: 99 });
    });
  });
});
