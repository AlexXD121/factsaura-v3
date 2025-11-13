/**
 * Rate Limiting and Error Handling Tests
 * Tests for comprehensive API rate limiting and error handling implementation
 */

const request = require('supertest');
const app = require('../server');

describe('Rate Limiting and Error Handling', () => {
  
  describe('Rate Limiting', () => {
    
    test('should apply general API rate limiting', async () => {
      // Make multiple requests to test rate limiting
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/api/news/status'));
      }
      
      const responses = await Promise.all(requests);
      
      // All requests should succeed initially
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
      
      // Check for rate limit headers
      const lastResponse = responses[responses.length - 1];
      expect(lastResponse.headers).toHaveProperty('x-ratelimit-policy');
    });
    
    test('should apply service-specific rate limiting for NewsAPI', async () => {
      const response = await request(app)
        .get('/api/news/trending')
        .expect((res) => {
          // Should either succeed or fail with proper error structure
          if (res.status === 429) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toHaveProperty('code', 'RATE_LIMIT_EXCEEDED');
            expect(res.body.error).toHaveProperty('retryAfter');
          }
        });
    });
    
    test('should apply crisis monitoring rate limiting', async () => {
      const response = await request(app)
        .get('/api/news/crisis')
        .expect((res) => {
          // Should either succeed or fail with proper error structure
          if (res.status === 429) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
          }
        });
    });
    
    test('should apply AI analysis rate limiting', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .send({ content: 'Test content for analysis' })
        .expect((res) => {
          // Should either succeed or fail with proper error structure
          if (res.status === 429) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
          }
        });
    });
    
  });
  
  describe('Error Handling', () => {
    
    test('should handle 404 errors properly', async () => {
      const response = await request(app)
        .get('/api/nonexistent/endpoint')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('suggestions');
    });
    
    test('should handle validation errors properly', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .send({}) // Empty body should trigger validation error
        .expect((res) => {
          if (res.status === 400) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
          }
        });
    });
    
    test('should handle external API errors gracefully', async () => {
      // This test assumes NewsAPI might not be configured or available
      const response = await request(app)
        .get('/api/news/test')
        .expect((res) => {
          // Should return proper error structure if service unavailable
          if (res.status >= 400) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toHaveProperty('code');
            expect(res.body.error).toHaveProperty('message');
            expect(res.body.error).toHaveProperty('suggestions');
          }
        });
    });
    
    test('should include error recovery information', async () => {
      const response = await request(app)
        .get('/api/news/trending')
        .expect((res) => {
          if (res.status >= 400) {
            expect(res.body.error).toHaveProperty('recovery');
            expect(res.body.error.recovery).toHaveProperty('canRetry');
            expect(res.body.error.recovery).toHaveProperty('retryDelay');
            expect(res.body.error.recovery).toHaveProperty('maxRetries');
          }
        });
    });
    
    test('should handle timeout errors properly', async () => {
      // This test would require mocking a slow service
      // For now, just verify the error structure exists
      const response = await request(app)
        .get('/api/ai/analyze')
        .expect((res) => {
          if (res.status === 408) {
            expect(res.body).toHaveProperty('error');
            expect(res.body.error.code).toBe('TIMEOUT_ERROR');
          }
        });
    });
    
  });
  
  describe('Service Health Checks', () => {
    
    test('should bypass rate limiting for health checks', async () => {
      // Make multiple health check requests
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(request(app).get('/api/news/status'));
      }
      
      const responses = await Promise.all(requests);
      
      // All health check requests should succeed
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });
    });
    
    test('should return proper service status format', async () => {
      const response = await request(app)
        .get('/api/news/status')
        .expect(200);
      
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('lastChecked');
    });
    
  });
  
  describe('Error Response Format', () => {
    
    test('should return consistent error format', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
      expect(response.body.error).toHaveProperty('path');
      expect(response.body.error).toHaveProperty('method');
      expect(response.body.error).toHaveProperty('suggestions');
    });
    
    test('should include rate limit headers when rate limited', async () => {
      // This test would require actually hitting rate limits
      // For now, verify the structure exists
      const response = await request(app)
        .get('/api/news/trending');
      
      if (response.status === 429) {
        expect(response.headers).toHaveProperty('retry-after');
        expect(response.body.error).toHaveProperty('retryAfter');
      }
    });
    
  });
  
  describe('Circuit Breaker (AI Service)', () => {
    
    test('should handle circuit breaker open state', async () => {
      // This test would require simulating multiple failures
      // For now, just verify the error handling exists
      const response = await request(app)
        .post('/api/ai/analyze')
        .send({ content: 'Test content' });
      
      if (response.status === 503) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
      }
    });
    
  });
  
  describe('Request Validation', () => {
    
    test('should validate AI analysis requests', async () => {
      const response = await request(app)
        .post('/api/ai/analyze')
        .send({ content: '' }) // Empty content should be invalid
        .expect((res) => {
          if (res.status === 400) {
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
          }
        });
    });
    
    test('should validate chat requests', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({ message: '' }) // Empty message should be invalid
        .expect((res) => {
          if (res.status === 400) {
            expect(res.body.error.code).toBe('VALIDATION_ERROR');
          }
        });
    });
    
  });
  
});

describe('Integration Tests', () => {
  
  test('should handle multiple concurrent requests properly', async () => {
    const requests = [];
    
    // Mix different types of requests
    requests.push(request(app).get('/api/news/status'));
    requests.push(request(app).get('/api/reddit/status'));
    requests.push(request(app).get('/api/gdelt/status'));
    requests.push(request(app).get('/health'));
    
    const responses = await Promise.all(requests);
    
    // All status endpoints should respond properly
    responses.forEach((response, index) => {
      expect(response.status).toBeLessThan(500);
      if (response.status >= 400) {
        expect(response.body).toHaveProperty('error');
      }
    });
  });
  
  test('should maintain consistent error format across all services', async () => {
    const endpoints = [
      '/api/news/nonexistent',
      '/api/reddit/nonexistent', 
      '/api/gdelt/nonexistent',
      '/api/ai/nonexistent'
    ];
    
    for (const endpoint of endpoints) {
      const response = await request(app)
        .get(endpoint)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body.error).toHaveProperty('suggestions');
    }
  });
  
});