// ============================================================
// Hash Utility Tests
// ============================================================

import { hashIdentifier, createEventId } from './hash';

describe('hashIdentifier', () => {
  it('returns a hex string', () => {
    const result = hashIdentifier('user-123', 'test-salt');
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it('returns a 64-character SHA-256 hex string', () => {
    const result = hashIdentifier('user-123', 'test-salt');
    expect(result).toHaveLength(64);
  });

  it('produces the same hash for the same input', () => {
    const a = hashIdentifier('user-123', 'test-salt');
    const b = hashIdentifier('user-123', 'test-salt');
    expect(a).toBe(b);
  });

  it('produces different hashes for different values', () => {
    const a = hashIdentifier('user-123', 'test-salt');
    const b = hashIdentifier('user-456', 'test-salt');
    expect(a).not.toBe(b);
  });

  it('produces different hashes for different salts', () => {
    const a = hashIdentifier('user-123', 'salt-a');
    const b = hashIdentifier('user-123', 'salt-b');
    expect(a).not.toBe(b);
  });

  it('does not include the original value in the hash', () => {
    const result = hashIdentifier('sensitive-user-id', 'test-salt');
    expect(result).not.toContain('sensitive-user-id');
  });
});

describe('createEventId', () => {
  it('returns a string starting with the prefix', () => {
    const id = createEventId('guide_created');
    expect(id).toMatch(/^guide_created-/);
  });

  it('returns unique IDs on each call', () => {
    const a = createEventId('test');
    const b = createEventId('test');
    expect(a).not.toBe(b);
  });

  it('includes a timestamp component', () => {
    const before = Date.now();
    const id = createEventId('test');
    const after = Date.now();
    const parts = id.split('-');
    const timestamp = Number(parts[1]);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});
