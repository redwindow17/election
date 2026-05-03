// ============================================================
// Auth Middleware Tests
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
  const { validateEnv } = require('../config/environment');
  validateEnv();
  const { createApp } = require('../app');
  return createApp();
}

afterAll(() => {
  process.env = originalEnv;
});

describe('authMiddleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const app = buildTestApp();
    const response = await request(app)
      .get('/api/election/history')
      .expect(401);
    expect(response.body.error).toMatch(/authorization/i);
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const app = buildTestApp();
    const response = await request(app)
      .get('/api/election/history')
      .set('Authorization', 'Basic abc123')
      .expect(401);
    expect(response.body.error).toMatch(/authorization/i);
  });

  it('returns 401 when token is empty after Bearer', async () => {
    const app = buildTestApp();
    const response = await request(app)
      .get('/api/election/history')
      .set('Authorization', 'Bearer ')
      .expect(401);
    expect(response.body.success).toBe(false);
  });

  it('accepts demo token when DEMO_AUTH_ENABLED is true', async () => {
    const app = buildTestApp({ DEMO_AUTH_ENABLED: 'true' });
    const response = await request(app)
      .get('/api/election/history')
      .set('Authorization', 'Bearer demo-token')
      .expect(200);
    expect(response.body.success).toBe(true);
  });

  it('uses X-Demo-User header for demo user ID', async () => {
    const app = buildTestApp({ DEMO_AUTH_ENABLED: 'true' });
    // Create a guide first so history is non-empty
    await request(app)
      .post('/api/election/guide')
      .set('Authorization', 'Bearer demo-token')
      .set('X-Demo-User', 'specific-test-user')
      .send({
        age: 28,
        state: 'Delhi',
        question: 'How do I register to vote?',
        voterIdStatus: 'registered',
        language: 'en',
      });

    const response = await request(app)
      .get('/api/election/history')
      .set('Authorization', 'Bearer demo-token')
      .set('X-Demo-User', 'specific-test-user')
      .expect(200);
    expect(response.body.success).toBe(true);
  });

  it('returns 503 when Firebase is not configured and demo auth is disabled', async () => {
    const app = buildTestApp({ DEMO_AUTH_ENABLED: 'false' });
    const response = await request(app)
      .get('/api/election/history')
      .set('Authorization', 'Bearer real-firebase-token')
      .expect(503);
    expect(response.body.error).toMatch(/firebase/i);
  });
});
