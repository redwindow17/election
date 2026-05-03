// ============================================================
// Error Handler Middleware Tests
// ============================================================

import request from 'supertest';
import express from 'express';
import { errorHandler } from './errorHandler';

function buildErrorApp(error: Error & { statusCode?: number }) {
  const app = express();
  app.get('/test', (_req, _res, next) => next(error));
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('returns 500 for generic errors', async () => {
    const app = buildErrorApp(new Error('Something broke'));
    const response = await request(app).get('/test').expect(500);
    expect(response.body.success).toBe(false);
  });

  it('uses statusCode from error when present', async () => {
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const app = buildErrorApp(err);
    await request(app).get('/test').expect(404);
  });

  it('returns error message in development mode', async () => {
    process.env.NODE_ENV = 'development';
    const app = buildErrorApp(new Error('Dev error message'));
    const response = await request(app).get('/test').expect(500);
    expect(response.body.error).toBe('Dev error message');
  });

  it('returns generic message in production mode', async () => {
    process.env.NODE_ENV = 'production';
    const app = buildErrorApp(new Error('Internal details'));
    const response = await request(app).get('/test').expect(500);
    expect(response.body.error).toBe('An internal server error occurred');
    expect(response.body.error).not.toContain('Internal details');
  });

  it('does not leak stack trace in production', async () => {
    process.env.NODE_ENV = 'production';
    const app = buildErrorApp(new Error('Secret error'));
    const response = await request(app).get('/test').expect(500);
    expect(response.body.stack).toBeUndefined();
  });

  it('returns JSON response', async () => {
    const app = buildErrorApp(new Error('JSON error'));
    const response = await request(app).get('/test').expect(500);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('success', false);
  });
});
