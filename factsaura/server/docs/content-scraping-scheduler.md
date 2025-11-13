# Content Scraping Scheduler Documentation

## Overview

The Content Scraping Scheduler is a core component of FactSaura that automatically monitors multiple data sources for trending content and potential misinformation. It runs every 5-10 minutes to collect data from NewsAPI, Reddit, and GDELT, then analyzes the content for crisis indicators and trending topics.

## Features

### 🔄 Automated Scheduling
- Configurable interval (1-60 minutes)
- Auto-start on server startup (optional)
- Manual trigger capability
- Start/stop controls via API

### 📊 Multi-Source Monitoring
- **NewsAPI**: Trending news and crisis content
- **Reddit**: Popular posts and community discussions
- **GDELT**: Global events and crisis monitoring

### 🚨 Crisis Detection
- Real-time crisis content identification
- Urgency level classification (critical, high, medium, low)
- Geographic relevance scoring
- Trending topic analysis

### 📈 Analytics & Reporting
- Content aggregation and analysis
- Source breakdown statistics
- Error tracking and reporting
- Performance monitoring

## API Endpoints

### Start Scheduler
```http
POST /api/content-scraping/start
Content-Type: application/json

{
  "intervalMinutes": 5
}
```

### Stop Scheduler
```http
POST /api/content-scraping/stop
```

### Get Status
```http
GET /api/content-scraping/status
```

### Force Run Cycle
```http
POST /api/content-scraping/run
```

### Get Latest Content
```http
GET /api/content-scraping/content
```

### Update Configuration
```http
PUT /api/content-scraping/config
Content-Type: application/json

{
  "intervalMinutes": 10
}
```

### Get Analysis
```http
GET /api/content-scraping/analysis
```

### Error Management
```http
GET /api/content-scraping/errors
DELETE /api/content-scraping/errors
```

## Configuration

### Environment Variables

```bash
# Auto-start scheduler on server startup
AUTO_START_SCHEDULER=true

# Scraping interval in minutes (1-60)
SCRAPER_INTERVAL_MINUTES=5

# Crisis detection thresholds
SCRAPER_CRISIS_THRESHOLD=0.7
SCRAPER_TRENDING_THRESHOLD=0.6
```

### API Service Configuration

The scheduler uses the existing API services:
- NewsAPI (requires `NEWSAPI_KEY`)
- Reddit API (requires Reddit credentials)
- GDELT API (no API key required)

## Data Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NewsAPI       │    │   Reddit API     │    │   GDELT API     │
│   - Trending    │    │   - Hot Posts    │    │   - Global      │
│   - Crisis      │    │   - Crisis       │    │   - Crisis      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────────┐
                    │  Content Scraping       │
                    │  Scheduler              │
                    │  - Parallel scraping    │
                    │  - Error handling       │
                    │  - Rate limiting        │
                    └─────────────────────────┘
                                 │
                    ┌─────────────────────────┐
                    │  Content Analysis       │
                    │  - Crisis scoring       │
                    │  - Trending detection   │
                    │  - Geographic relevance │
                    └─────────────────────────┘
                                 │
                    ┌─────────────────────────┐
                    │  Content Cache          │
                    │  - Latest content       │
                    │  - Analysis results     │
                    │  - Statistics           │
                    └─────────────────────────┘
```

## Content Analysis

### Crisis Scoring Algorithm

The scheduler calculates crisis scores (0-1) based on:

1. **Keyword Matching** (0-0.45 points)
   - Crisis keywords in content
   - Emergency-related terms
   - Misinformation indicators

2. **Source Credibility** (0-0.2 points)
   - Trusted news sources
   - Verified social media accounts
   - Official government sources

3. **Engagement Metrics** (0-0.2 points)
   - High comment activity
   - Viral sharing patterns
   - Community reactions

4. **Temporal Factors** (0-0.15 points)
   - Recent content (< 2 hours)
   - Breaking news indicators
   - Real-time updates

### Urgency Levels

- **Critical** (≥0.8): Immediate threat to public safety
- **High** (≥0.6): Significant misinformation or crisis
- **Medium** (≥0.4): Moderate concern or trending topic
- **Low** (<0.4): General monitoring

## Error Handling

### Rate Limiting
- Automatic rate limit detection
- Graceful degradation when limits exceeded
- Service-specific rate limit management

### API Failures
- Individual service failure isolation
- Retry mechanisms with exponential backoff
- Fallback to available services

### Error Tracking
- Comprehensive error logging
- Error history with timestamps
- Automatic error cleanup (last 10 errors)

## Performance Considerations

### Parallel Processing
- Concurrent API calls to all services
- Promise.allSettled for fault tolerance
- Non-blocking error handling

### Memory Management
- Content cache size limits
- Automatic cleanup of old data
- Efficient data structures

### Network Optimization
- Request timeouts (30 seconds)
- Connection pooling
- Compression support

## Monitoring & Debugging

### Status Information
```javascript
{
  "isRunning": true,
  "intervalMinutes": 5,
  "runCount": 42,
  "lastRunTime": "2025-11-12T01:00:00.000Z",
  "nextRunTime": "2025-11-12T01:05:00.000Z",
  "totalContentItems": 156,
  "errorCount": 0,
  "serviceStatus": {
    "newsApi": true,
    "reddit": true,
    "gdelt": true
  }
}
```

### Content Statistics
```javascript
{
  "totalItems": 156,
  "crisisItems": 8,
  "trendingItems": 23,
  "sourceBreakdown": {
    "news": 67,
    "reddit": 45,
    "gdelt": 44
  }
}
```

## Usage Examples

### Basic Setup
```javascript
// Start scheduler with default 5-minute interval
const response = await fetch('/api/content-scraping/start', {
  method: 'POST'
});

// Check status
const status = await fetch('/api/content-scraping/status');
console.log(await status.json());
```

### Manual Content Analysis
```javascript
// Force run a scraping cycle
const cycle = await fetch('/api/content-scraping/run', {
  method: 'POST'
});

// Get analysis results
const analysis = await fetch('/api/content-scraping/analysis');
const results = await analysis.json();

console.log(`Found ${results.analysis.crisisItems} crisis alerts`);
```

### Configuration Management
```javascript
// Update interval to 10 minutes
await fetch('/api/content-scraping/config', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ intervalMinutes: 10 })
});

// Stop scheduler
await fetch('/api/content-scraping/stop', {
  method: 'POST'
});
```

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=contentScrapingController.test.js
```

### Manual Testing
```bash
node scripts/test-content-scraping-scheduler.js
```

### Integration Testing
The scheduler integrates with:
- API Key Management system
- Rate limiting middleware
- Error tracking system
- WebSocket notifications (future)

## Troubleshooting

### Common Issues

1. **Scheduler Won't Start**
   - Check API key configuration
   - Verify environment variables
   - Check service availability

2. **No Content Retrieved**
   - Verify API credentials
   - Check rate limits
   - Review error logs

3. **High Error Rate**
   - Check network connectivity
   - Verify API service status
   - Review rate limit settings

### Debug Commands
```bash
# Check service health
curl http://localhost:3001/api/health

# Get scheduler status
curl http://localhost:3001/api/content-scraping/status

# View recent errors
curl http://localhost:3001/api/content-scraping/errors
```

## Future Enhancements

### Planned Features
- WebSocket real-time notifications
- Machine learning content classification
- Advanced crisis prediction algorithms
- Multi-language content support
- Custom alert rules and filters

### Scalability Improvements
- Redis-based job queues
- Distributed scraping workers
- Database persistence layer
- Caching optimization

## Security Considerations

### API Key Protection
- Environment variable storage
- Rotation support
- Access logging

### Rate Limit Compliance
- Respectful API usage
- Automatic backoff
- Service-specific limits

### Data Privacy
- No personal data storage
- Public content only
- GDPR compliance ready