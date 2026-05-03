// ============================================================
// Vitest Global Test Setup
// ============================================================
// Runs before every test file. Configures jest-dom matchers,
// stubs browser APIs that jsdom does not implement, and mocks
// the Firebase config module so tests never need real credentials.
// ============================================================

import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// ── Browser API stubs ──────────────────────────────────────
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: vi.fn(() => 'blob:guide-export'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: vi.fn(),
});

// Stub anchor click so download tests don't throw
HTMLAnchorElement.prototype.click = vi.fn();

// ── Firebase config mock ───────────────────────────────────
// All tests run without real Firebase credentials.
// Components that import from '../config/firebase' get this stub.
vi.mock('../config/firebase', () => ({
  auth: { currentUser: null },
  isFirebaseConfigured: false,
  setDemoCurrentUser: vi.fn(),
  getDemoCurrentUserId: vi.fn(() => null),
  getAppCheckToken: vi.fn(() => Promise.resolve(null)),
  getAnalyticsClient: vi.fn(() => Promise.resolve(null)),
  getPerformanceClient: vi.fn(() => Promise.resolve(null)),
  getFirestoreDb: vi.fn(() => Promise.resolve(null)),
  default: null,
}));

// ── Telemetry mock ─────────────────────────────────────────
// Prevent real analytics calls during tests
vi.mock('../services/telemetryService', () => ({
  trackClientEvent: vi.fn(() => Promise.resolve()),
  measureAsync: vi.fn((_name: string, fn: () => Promise<unknown>) => fn()),
}));
