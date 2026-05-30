import request from 'supertest';
import express from 'express';
import corsMiddleware from '../../src/middleware/cors.js';

const createApp = () => {
  const app = express();
  app.use(corsMiddleware);
  app.get('/test', (req, res) => res.json({ ok: true }));
  return app;
};

describe('CORS Middleware', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('should allow requests with allowed origin', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:5173',
    );
  });

  test('should allow requests with another allowed origin', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:4173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:4173',
    );
  });

  test('should allow requests without origin', async () => {
    const res = await request(app).get('/test');

    expect(res.status).toBe(200);
  });

  test('should reject requests with disallowed origin', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'http://malicious-site.com');

    expect(res.status).toBe(500);
  });

  test('should include credentials header', async () => {
    const res = await request(app)
      .get('/test')
      .set('Origin', 'http://localhost:5173');

    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
