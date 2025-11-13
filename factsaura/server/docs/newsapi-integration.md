# NewsAPI.org Integration Documentation

## Overview

The NewsAPI integration provides real-time news monitoring and trending topic detection for the FactSaura platform. This integration is part of the multi-source monitoring system that enables automatic misinformation detection and crisis content monitoring.

## Features

### ✅ Implemented Features

1. **Real-time News Monitoring**
   - Trending news articles from 70+ sources
   - Crisis-related content detection
   - Source credibility verification
   - Rate limiting and error handling

2. **Search Functionality**
   - Full-text search across news articles
   - Date range filtering
   - Source-specific searches
   - Sorting by relevance, popularity, or date

3. **Crisis Content Monitoring**
   - Automatic detection of crisis-related keywords
   - Urgency level classification (critical, high, medium, low)
   - Crisis scoring algorithm
   - 24-hour monitoring window

4. **Source Credibility System**
   - 13 trusted mainstream sources identified
   - Credibility scoring (0.6-0.9 scale)
   - Verification status tracking
   - Source reliability indicators

## API Endpoints

### Base URL: `/api/news`

#### 1. GET `/trending`
Get trending news articles with crisis detection.

**Query Parameters:**
- `country` (string): Country code (default: 'us')
- `category` (string): News category (default: 'general')
- `pageSize` (number): Articles per page (default: 20, max: 100)
- `page` (number): Page number (default: 1)

**Example:**
```bash
GET /api/news/trending?country=us&category=technology&pageSize=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "newsapi-1731326864000-tech-breakthrough-example",
        "title": "Major Tech Breakthrough Announced",
        "description": "Description of the breakthrough...",
        "content": "Full article content...",
        "url": "https://example.com/article",
        "urlToImage": "https://example.com/image.jpg",
        "publishedAt": "2025-11-11T10:00:00Z",
        "source": {
          "id": "reuters",
          "name": "Reuters",
          "credibility": {
            "sourceId": "reuters",
            "isTrusted": true,
            "credibilityScore": 0.9,
            "category": "trusted_mainstream",
            "verificationStatus": "verified"
          }
        },
        "author": "Tech Reporter",
        "detectedAt": "2025-11-11T11:33:48.000Z",
        "platform": "newsapi",
        "contentType": "news_article",
        "language": "en",
        "wordCount": 250
      }
    ],
    "metadata": {
      "source": "newsapi",
      "type": "trending",
      "query": null,
      "totalResults": 34,
      "retrievedCount": 10,
      "timestamp": "2025-11-11T11:33:48.000Z",
      "requestsRemaining": 96
    }
  },
  "message": "Trending news retrieved successfully"
}
```

#### 2. GET `/search`
Search news articles with advanced filtering.

**Query Parameters:**
- `q` (string, required): Search query
- `sortBy` (string): Sort order ('relevancy', 'popularity', 'publishedAt')
- `pageSize` (number): Articles per page (default: 20)
- `page` (number): Page number (default: 1)
- `from` (string): Start date (ISO format)
- `to` (string): End date (ISO format)
- `sources` (string): Comma-separated source IDs

**Example:**
```bash
GET /api/news/search?q=artificial%20intelligence&sortBy=popularity&sources=reuters,bbc-news
```

#### 3. GET `/crisis`
Monitor crisis-related content with urgency classification.

**Response includes additional fields:**
```json
{
  "articles": [
    {
      "...": "standard article fields",
      "crisisScore": 0.8,
      "urgencyLevel": "high"
    }
  ]
}
```

**Urgency Levels:**
- `critical`: Crisis score ≥ 0.8
- `high`: Crisis score ≥ 0.6
- `medium`: Crisis score ≥ 0.4
- `low`: Crisis score < 0.4

#### 4. GET `/status`
Get service health and configuration status.

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "NewsAPI",
    "status": "configured",
    "apiKey": "present",
    "requestsUsed": 4,
    "requestsRemaining": 96,
    "rateLimitReset": "2025-11-11T12:33:00.660Z",
    "trustedSourcesCount": 13,
    "crisisKeywordsCount": 6,
    "connectionTest": {
      "success": true,
      "status": "connected",
      "articlesFound": 34,
      "message": "NewsAPI connection successful"
    }
  }
}
```

#### 5. GET `/test`
Test API connection and configuration.

## Configuration

### Environment Variables

Add to `.env` file:
```bash
# External API Keys
NEWSAPI_KEY=your_newsapi_api_key_here

# Crisis Detection Keywords (comma-separated)
CRISIS_KEYWORDS=flood,earthquake,emergency,scam,fake,misinformation
```

### Trusted Sources

The following sources are classified as trusted mainstream media:
- Reuters (`reuters`)
- Associated Press (`ap-news`)
- BBC News (`bbc-news`)
- CNN (`cnn`)
- The Guardian (`the-guardian-uk`)
- The New York Times (`the-new-york-times`)
- The Washington Post (`the-washington-post`)
- NPR (`npr`)
- ABC News (`abc-news`)
- CBS News (`cbs-news`)
- NBC News (`nbc-news`)
- Fox News (`fox-news`)
- USA Today (`usa-today`)

## Rate Limiting

### NewsAPI Free Tier Limits
- **1,000 requests per day**
- **100 requests per hour**
- **Automatic rate limiting implemented**

### Rate Limiting Features
- Request counting and tracking
- Hourly reset mechanism
- Graceful degradation when limits exceeded
- Rate limit status in API responses

## Crisis Detection Algorithm

### Crisis Score Calculation
```javascript
// Base score from crisis keywords (max 0.6)
score += Math.min(crisisMatches * 0.2, 0.6);

// Trusted source bonus (+0.2)
if (article.source.credibility.isTrusted) {
  score += 0.2;
}

// Recency bonus
if (hoursOld < 2) score += 0.2;      // Very recent
else if (hoursOld < 6) score += 0.1; // Recent

// Final score capped at 1.0
return Math.min(score, 1.0);
```

### Crisis Keywords
Default keywords monitored:
- `flood`
- `earthquake`
- `emergency`
- `scam`
- `fake`
- `misinformation`

## Error Handling

### Common Error Responses

#### API Key Not Configured
```json
{
  "success": false,
  "error": "NewsAPI not configured. Please set NEWSAPI_KEY environment variable.",
  "message": "Failed to fetch trending news"
}
```

#### Rate Limit Exceeded
```json
{
  "success": false,
  "error": "NewsAPI rate limit exceeded. Try again later.",
  "message": "Failed to fetch trending news"
}
```

#### Invalid API Key
```json
{
  "success": false,
  "error": "Your API key is invalid or incorrect. Check your key, or go to https://newsapi.org to create a free API key.",
  "status": "connection_failed"
}
```

## Testing

### Unit Tests
```bash
npm test -- newsApiService.test.js
```

### Integration Tests
```bash
# Test service functionality
node scripts/test-newsapi.js

# Test HTTP endpoints (requires running server)
node scripts/test-newsapi-endpoints.js
```

### Manual Testing
```bash
# Start the server
npm run dev

# Test endpoints
curl http://localhost:3001/api/news/status
curl http://localhost:3001/api/news/test
curl "http://localhost:3001/api/news/trending?pageSize=5"
curl "http://localhost:3001/api/news/search?q=technology&pageSize=3"
curl http://localhost:3001/api/news/crisis
```

## Usage Examples

### Basic News Monitoring
```javascript
const NewsApiService = require('./services/newsApiService');
const newsService = new NewsApiService();

// Get trending news
const trending = await newsService.getTrendingNews({
  country: 'us',
  pageSize: 10
});

// Monitor crisis content
const crisisContent = await newsService.monitorCrisisContent();

// Search for specific topics
const searchResults = await newsService.searchNews('artificial intelligence', {
  sortBy: 'popularity',
  pageSize: 5
});
```

### Crisis Detection Integration
```javascript
// Monitor for crisis content every 5 minutes
setInterval(async () => {
  try {
    const crisisContent = await newsService.monitorCrisisContent();
    
    // Filter high-urgency articles
    const criticalArticles = crisisContent.articles.filter(
      article => article.urgencyLevel === 'critical'
    );
    
    if (criticalArticles.length > 0) {
      // Trigger alert system
      console.log(`🚨 ${criticalArticles.length} critical articles detected!`);
    }
  } catch (error) {
    console.error('Crisis monitoring error:', error);
  }
}, 5 * 60 * 1000); // 5 minutes
```

## Next Steps

### Planned Enhancements
1. **Multi-language Support**: Extend beyond English content
2. **Advanced Filtering**: More sophisticated crisis detection
3. **Webhook Integration**: Real-time notifications
4. **Caching Layer**: Reduce API calls with intelligent caching
5. **Analytics Dashboard**: Usage metrics and performance tracking

### Integration with Other Services
- **GDELT API**: Global event monitoring
- **Reddit API**: Social media trend detection
- **Mastodon API**: Decentralized social monitoring
- **Google Fact Check**: Cross-verification

## Support

### Getting API Key
1. Visit [NewsAPI.org](https://newsapi.org/register)
2. Register for free account
3. Get API key from dashboard
4. Add to `.env` file as `NEWSAPI_KEY=your_key_here`

### Troubleshooting
- Check API key validity with `/api/news/test` endpoint
- Monitor rate limits with `/api/news/status` endpoint
- Review error logs for detailed error messages
- Ensure environment variables are properly loaded

## Security Considerations

- API key stored in environment variables (not in code)
- Rate limiting prevents abuse
- Input validation on all parameters
- Error messages don't expose sensitive information
- HTTPS recommended for production deployment