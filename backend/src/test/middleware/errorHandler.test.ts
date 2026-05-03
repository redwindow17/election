// ============================================================
// errorHandler middleware — Unit Tests
// ============================================================
// Covers: 500 default, custom statusCode, dev vs prod message,
// no stack trace in production, JSON content-type.
// ============================================================

import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../middleware/errorHandler';

function buildErrorApp(error: Error & { statusCode?: number }) {
  const app = express();
  app.get('/test', (_req, _res, next) => next(error));
  app.use(errorHandler);
  return app;
}

describe('errorHandler', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  // ── Status codes ───────────────────────────────────────
  describe('status codes', () => {
    it('returns 500 for generic errors', async () => {
      const app = buildErrorApp(new Error('Something broke'));
      await request(app).get('/test').expect(500);
    });

    it('uses statusCode from error when present', async () => {
      const err = Object.assign(new Error('Not found'), { statusCode: 404 });
      const app = buildErrorApp(err);
      await request(app).get('/test').expect(404);
    });

    it('uses statusCode 422 when set', async () => {
      const err = Object.assign(new Error('Unprocessable'), { statusCode: 422 });
      const app = buildErrorApp(err);
      await request(app).get('/test').expect(422);
    });
  });

  // ── Response body ──────────────────────────────────────
  describe('response body', () => {
    it('returns JSON with success: false', async () => {
      const app = buildErrorApp(new Error('Error'));
      const res = await request(app).get('/test').expect(500);
      expect(res.body.success).toBe(false);
    });

    it('returns JSON content-type', async () => {
      const app = buildErrorApp(new Error('Error'));
      const res = await request(app).get('/test');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });

  // ── Development mode ───────────────────────────────────
  describe('development mode', () => {
    it('returns actual error message in development', async () => {
      process.env.NODE_ENV = 'development';
      const app = buildErrorApp(new Error('Dev error message'));
      const res = await request(app).get('/test').expect(500);
      expect(res.body.error).toBe('Dev error message');
    });

    it('includes stack trace in development', async () => {
      process.env.NODE_ENV = 'development';
      const app = buildErrorApp(new Error('Dev error'));
      const res = await request(app).get('/test').expect(500);
      expect(res.body.stack).toBeDefined();
    });
  });

  // ── Production mode ────────────────────────────────────
  describe('production mode', () => {
    it('returns generic message in production', async () => {
      process.env.NODE_ENV = 'production';
      const app = buildErrorApp(new Error('Internal details'));
      const res = await request(app).get('/test').expect(500);
      expect(res.body.error).toBe('An internal server error occurred');
    });

    it('does not leak original error message in production', async () => {
      process.env.NODE_ENV = 'production';
      const app = buildErrorApp(new Error('Secret internal error'));
      const res = await request(app).get('/test').expect(500);
      expect(res.body.error).not.toContain('Secret internal error');
    });

    it('does not include stack trace in production', async () => {
      process.env.NODE_ENV = 'production';
      const app = buildErrorApp(new Error('Error'));
      const res = await request(app).get('/test').expect(500);
      expect(res.body.stack).toBeUndefined();
    });
  });
});
