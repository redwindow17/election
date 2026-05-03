// ============================================================
// hash utilities — Unit Tests
// ============================================================
// Covers: hashIdentifier determinism, uniqueness, length,
// salt isolation; createEventId prefix, uniqueness, timestamp.
// ============================================================

import { hashIdentifier, createEventId } from '../../utils/hash';

describe('hashIdentifier', () => {
  // ── Output format ──────────────────────────────────────
  describe('output format', () => {
    it('returns a lowercase hex string', () => {
      const result = hashIdentifier('user-123', 'test-salt');
      expect(result).toMatch(/^[0-9a-f]+$/);
    });

    it('returns a 64-character SHA-256 hex string', () => {
      const result = hashIdentifier('user-123', 'test-salt');
      expect(result).toHaveLength(64);
    });
  });

  // ── Determinism ────────────────────────────────────────
  describe('determinism', () => {
    it('produces the same hash for identical inputs', () => {
      const a = hashIdentifier('user-123', 'test-salt');
      const b = hashIdentifier('user-123', 'test-salt');
      expect(a).toBe(b);
    });
  });

  // ── Uniqueness ─────────────────────────────────────────
  describe('uniqueness', () => {
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
  });

  // ── Privacy ────────────────────────────────────────────
  describe('privacy', () => {
    it('does not include the original value in the hash', () => {
      const result = hashIdentifier('sensitive-user-id', 'test-salt');
      expect(result).not.toContain('sensitive-user-id');
    });

    it('does not include the salt in the hash', () => {
      const result = hashIdentifier('user-123', 'my-secret-salt');
      expect(result).not.toContain('my-secret-salt');
    });
  });
});

describe('createEventId', () => {
  // ── Format ─────────────────────────────────────────────
  describe('format', () => {
    it('starts with the given prefix', () => {
      const id = createEventId('guide_created');
      expect(id).toMatch(/^guide_created-/);
    });

    it('contains a timestamp component', () => {
      const before = Date.now();
      const id = createEventId('test');
      const after = Date.now();
      const parts = id.split('-');
      const timestamp = Number(parts[1]);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('contains a hex random suffix', () => {
      const id = createEventId('test');
      const parts = id.split('-');
      const suffix = parts[parts.length - 1];
      expect(suffix).toMatch(/^[0-9a-f]+$/);
    });
  });

  // ── Uniqueness ─────────────────────────────────────────
  describe('uniqueness', () => {
    it('generates unique IDs on each call', () => {
      const ids = new Set(Array.from({ length: 100 }, () => createEventId('test')));
      expect(ids.size).toBe(100);
    });
  });
});
