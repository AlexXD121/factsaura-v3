/**
 * Content Scraping Controller Tests
 * Tests for the content scraping scheduler API endpoints
 */

const request = require('supertest');
const express = require('express');
const contentScrapingRoutes = require('../routes/contentScraping');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/content-scraping', contentScrapingRoutes);

describe('Content Scraping Controller', () => {
  let schedulerStarted = false;

  afterAll(async () => {
    // Clean up - stop scheduler if it was started
    if (schedulerStarted) {
      await request(app)
        .post('/api/content-scraping/stop')
        .expect(200);
    }
  });

  describe('GET /api/content-scraping/status', () => {
    it('should return scheduler status', async () => {
      const response = await request(app)
        .get('/api/content-scraping/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBeDefined();
      expect(response.body.status.isRunning).toBeDefined();
      expect(response.body.status.intervalMinutes).toBeDefined();
      expect(response.body.latestContent).toBeDefined();
    });
  });

  describe('POST /api/content-scraping/start', () => {
    it('should start the scheduler successfully', async () => {
      const response = await request(app)
        .post('/api/content-scraping/start')
        .send({ intervalMinutes: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('started successfully');
      expect(response.body.status.isRunning).toBe(true);
      
      schedulerStarted = true;
    });

    it('should return error if scheduler is already running', async () => {
      const response = await request(app)
        .post('/api/content-scraping/start')
        .send({ intervalMinutes: 10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already running');
    });
  });

  describe('POST /api/content-scraping/run', () => {
    it('should force run a scraping cycle', async () => {
      const response = await request(app)
        .post('/api/content-scraping/run')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed successfully');
      expect(response.body.result).toBeDefined();
    }, 30000); // 30 second timeout for scraping
  });

  describe('GET /api/content-scraping/content', () => {
    it('should return latest scraped content', async () => {
      const response = await request(app)
        .get('/api/content-scraping/content')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.content).toBeDefined();
      expect(response.body.content.news).toBeDefined();
      expect(response.body.content.reddit).toBeDefined();
      expect(response.body.content.gdelt).toBeDefined();
    });
  });

  describe('GET /api/content-scraping/analysis', () => {
    it('should return content analysis', async () => {
      const response = await request(app)
        .get('/api/content-scraping/analysis')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.analysis).toBeDefined();
      expect(response.body.contentSummary).toBeDefined();
    });
  });

  describe('PUT /api/content-scraping/config', () => {
    it('should update scheduler configuration', async () => {
      const response = await request(app)
        .put('/api/content-scraping/config')
        .send({ intervalMinutes: 15 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated to 15 minutes');
      expect(response.body.status.intervalMinutes).toBe(15);
    });

    it('should reject invalid interval', async () => {
      const response = await request(app)
        .put('/api/content-scraping/config')
        .send({ intervalMinutes: 0 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid interval');
    });
  });

  describe('GET /api/content-scraping/errors', () => {
    it('should return scheduler errors', async () => {
      const response = await request(app)
        .get('/api/content-scraping/errors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errorCount).toBeDefined();
    });
  });

  describe('DELETE /api/content-scraping/errors', () => {
    it('should clear scheduler errors', async () => {
      const response = await request(app)
        .delete('/api/content-scraping/errors')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('cleared successfully');
    });
  });

  describe('POST /api/content-scraping/stop', () => {
    it('should stop the scheduler successfully', async () => {
      const response = await request(app)
        .post('/api/content-scraping/stop')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('stopped successfully');
      expect(response.body.status.isRunning).toBe(false);
      
      schedulerStarted = false;
    });

    it('should return error if scheduler is not running', async () => {
      const response = await request(app)
        .post('/api/content-scraping/stop')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not running');
    });
  });
});