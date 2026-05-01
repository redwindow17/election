import request from 'supertest';

const originalEnv = process.env;

jest.setTimeout(15000);

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

  const { validateEnv } = require('./config/environment');
  validateEnv();
  const { createApp } = require('./app');
  return createApp();
}

const validGuidePayload = {
  age: 28,
  state: 'Delhi',
  question: 'How can I prepare for voting day?',
  voterIdStatus: 'registered',
  language: 'en',
};

function authHeaders() {
  return {
    Authorization: 'Bearer demo-token',
    'X-Demo-User': 'demo-test-user',
  };
}

afterAll(() => {
  process.env = originalEnv;
});

describe('Google services workflow', () => {
  it('creates a guide, exports it, accepts feedback, and returns demo insights', async () => {
    const app = buildTestApp();

    const guideResponse = await request(app)
      .post('/api/election/guide')
      .set(authHeaders())
      .send(validGuidePayload)
      .expect(200);

    const conversationId = guideResponse.body.data.conversationId;
    expect(conversationId).toMatch(/^demo-conversation-/);

    const exportResponse = await request(app)
      .post(`/api/election/conversations/${conversationId}/export`)
      .set(authHeaders())
      .send({})
      .expect(200);

    expect(exportResponse.body.data).toMatchObject({
      provider: 'inline-demo',
      conversationId,
    });
    expect(exportResponse.body.data.inlineExport.data.query).toMatchObject({
      state: 'Delhi',
      voterIdStatus: 'registered',
    });

    const feedbackResponse = await request(app)
      .post(`/api/election/conversations/${conversationId}/feedback`)
      .set(authHeaders())
      .send({ rating: 5, useful: true, comment: 'Clear and useful.' })
      .expect(200);

    expect(feedbackResponse.body.data).toMatchObject({ rating: 5, useful: true });

    const insightsResponse = await request(app)
      .get('/api/election/insights')
      .set(authHeaders())
      .expect(200);

    expect(insightsResponse.body.data).toMatchObject({
      guideCreated: 1,
      exportCreated: 1,
      feedbackSubmitted: 1,
      source: 'demo',
    });
  });

  it('enforces Firebase App Check when configured', async () => {
    const app = buildTestApp({ FIREBASE_APPCHECK_REQUIRED: 'true' });

    const response = await request(app)
      .get('/api/election/insights')
      .set(authHeaders())
      .expect(401);

    expect(response.body.error).toMatch(/App Check/i);
  });

  it('reports safe Google service status without exposing secrets', async () => {
    const app = buildTestApp({
      GOOGLE_CLOUD_PROJECT: 'test-project',
      GCS_EXPORT_BUCKET: 'test-bucket',
      BIGQUERY_DATASET: 'election_analytics',
    });

    const response = await request(app).get('/api/health/google-services').expect(200);

    expect(response.body.data.vertexAi.mode).toBe('enabled');
    expect(response.body.data.cloudStorage.bucket).toBe('configured');
    expect(response.body.data.bigQuery.dataset).toBe('configured');
    expect(JSON.stringify(response.body)).not.toContain('test-salt');
  });
});
