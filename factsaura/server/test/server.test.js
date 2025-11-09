const request = require('supertest');
const app = require('../server');

describe('FactSaura Backend Server', () => {
  describe('GET /health', () => {
    it('should return 200 and server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'FactSaura backend is running');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'FactSaura API v1.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('posts', '/api/posts');
      expect(response.body.endpoints).toHaveProperty('ai', '/api/ai');
      expect(response.body.endpoints).toHaveProperty('users', '/api/users');
    });
  });

  describe('GET /api/posts', () => {
    it('should return not implemented message', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(501);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_IMPLEMENTED');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });
});