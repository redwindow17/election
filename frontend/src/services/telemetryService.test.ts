import { describe, expect, it, vi } from 'vitest';
import { measureAsync, trackClientEvent } from './telemetryService';

describe('telemetryService', () => {
  it('does not block when Firebase analytics is not configured', async () => {
    await expect(trackClientEvent('test_event', { source: 'test' })).resolves.toBeUndefined();
  });

  it('returns measured action results in demo mode', async () => {
    const action = vi.fn().mockResolvedValue('done');

    await expect(measureAsync('demo_trace', action)).resolves.toBe('done');
    expect(action).toHaveBeenCalledTimes(1);
  });
});
