// ============================================================
// authMiddleware — Unit Tests
// ============================================================
// Covers: missing header, wrong scheme, empty token, demo
// token acceptance, X-Demo-User header, Firebase unavailable.
// ============================================================

import request from 'supertest';

const originalEnv = process.env;

function buildTestApp(extraEnv: NodeJS.ProcessEnv = {}) {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    DEMO_AUTH_ENABLED: 'true',
    FIREBASE_PROJECT_ID: '',
    GOOGLE_CLOUD_PROJECT: '',
    ANALYTICS_SALT: 'test-salt',
    ...extraEnv,
  };
  const { validateEnv } = require('../../config/environment');
  validateEnv();
  const { createApp } = require('../../app');
  return createApp();
}

afterAll(() => { process.env = originalEnv; });

describe('authMiddleware', () => {
  // ── Missing / malformed header ─────────────────────────
  describe('missing or malformed Authorization header', () => {
    it('returns 401 when Authorization header is absent', async () => {
      const app = buildTestApp();
      const res = await request(app).get('/api/election/history').expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/authorization/i);
    });

    it('returns 401 when scheme is not Bearer', async () => {
      const app = buildTestApp();
      const res = await request(app)
        .get('/api/election/history')
        .set('Authorization', 'Basic abc123')
        .expect(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 401 when token is empty after Bearer', async () => {
      const app = buildTestApp();
      const res = await request(app)
        .get('/api/election/history')
        .set('Authorization', 'Bearer ')
        .expect(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Demo auth ──────────────────────────────────────────
  describe('demo auth mode', () => {
    it('accepts demo-token when DEMO_AUTH_ENABLED=true', async () => {
      const app = buildTestApp({ DEMO_AUTH_ENABLED: 'true' });
      const res = await request(app)
        .get('/api/election/history')
        .set('Authorization', 'Bearer demo-token')
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('uses X-Demo-User header as user ID', async () => {
      const app = buildTestApp({ DEMO_AUTH_ENABLED: 'true' });
      // Create a guide for a specific user
      await request(app)
        .post('/api/election/guide')
        .set('Authorization', 'Bearer demo-token')
        .set('X-Demo-User', 'specific-user-abc')
        .send({ age: 28, state: 'Delhi', question: 'How do I vote?' });

      const res = await request(app)
        .get('/api/election/history')
        .set('Authorization', 'Bearer demo-token')
        .set('X-Demo-User', 'specific-user-abc')
        .expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('defaults to "demo-user" when X-Demo-User is absent', async () => {
      const app = buildTestApp({ DEMO_AUTH_ENABLED: 'true' });
      const res = await request(app)
        .get('/api/election/history')
        .set('Authorization', 'Bearer demo-token')
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── Firebase unavailable ───────────────────────────────
  describe('Firebase not configured', () => {
    it('returns 503 when Firebase is not configured and demo auth is disabled', async () => {
      const app = buildTestApp({ DEMO_AUTH_ENABLED: 'false' });
      const res = await request(app)
        .get('/api/election/history')
        .set('Authorization', 'Bearer real-firebase-token')
        .expect(503);
      expect(res.body.error).toMatch(/firebase/i);
    });
  });
});
