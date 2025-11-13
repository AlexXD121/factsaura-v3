# API Key Management System

## Overview

The API Key Management System provides centralized management of all external API keys used by FactSaura, including rate limiting, service health monitoring, and security features.

## Features

- **Centralized Configuration**: All API keys managed in one place
- **Rate Limiting**: Automatic rate limit tracking and enforcement
- **Service Health Monitoring**: Real-time status of all external services
- **Security**: API key masking for logs and debugging
- **Fallback Handling**: Graceful degradation when services are unavailable
- **Middleware Integration**: Automatic validation and rate limiting for routes

## Supported Services

### Required Services
- **NewsAPI.org**: News articles and trending topics
- **Reddit API**: Social media monitoring and trending content
- **Jan AI (Local)**: AI analysis and chat functionality

### Optional Services
- **GDELT Project**: Global events monitoring (free, no API key required)
- **Google Fact Check Tools**: Fact-checking database
- **OpenAI**: Fallback AI service

## Configuration

### Environment Variables

```bash
# NewsAPI Configuration
NEWSAPI_KEY=your_newsapi_key_here

# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=FactSaura:v1.0.0 (by /u/your_username)

# Jan AI Configuration
JAN_AI_HOST=127.0.0.1
JAN_AI_PORT=1337
JAN_AI_API_KEY=factsaura-key
JAN_AI_MODEL=Meta-Llama-3_1-8B-Instruct-IQ4_XS

# Optional Services
GOOGLE_FACT_CHECK_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Usage

### Basic Usage

```javascript
const { apiKeyManager } = require('../config/apiKeys');

// Check if service is available
if (apiKeyManager.isServiceAvailable('newsApi')) {
  // Service is configured and ready
}

// Check rate limits
if (apiKeyManager.checkRateLimit('newsApi')) {
  // Can make request
  apiKeyManager.incrementRateLimit('newsApi');
}

// Get service configuration
const config = apiKeyManager.getConfig('newsApi');
```

### Middleware Usage

```javascript
const { requireNewsAPI, requireRedditAPI } = require('../middleware/apiKeyMiddleware');

// Apply to routes
router.get('/trending', requireNewsAPI, controller.getTrendingNews);
router.get('/posts', requireRedditAPI, controller.getPosts);
```

### Service Health Monitoring

```javascript
// Get overall health
const health = apiKeyManager.getServiceHealth();

// Get specific service status
const newsStatus = apiKeyManager.getRateLimitStatus('newsApi');
```

## API Endpoints

### Health Monitoring Endpoints

- `GET /api/health` - Overall service health
- `GET /api/health/service/:service` - Specific service status
- `GET /api/health/rate-limits` - Rate limit status for all services
- `GET /api/health/test/:service` - Test connectivity to a service
- `GET /api/health/usage` - API usage statistics
- `POST /api/health/reset-rate-limits` - Reset rate limit counters (admin)

### Example Response

```json
{
  "status": "healthy",
  "score": 67,
  "timestamp": "2025-11-11T10:30:00.000Z",
  "services": {
    "newsApi": {
      "available": true,
      "required": true,
      "service": "NewsAPI.org",
      "rateLimit": {
        "current": 15,
        "limit": 1000,
        "period": "day",
        "remaining": 985
      }
    }
  }
}
```

## Rate Limits

| Service | Limit | Period | Notes |
|---------|-------|--------|-------|
| NewsAPI | 1000 | day | Free tier |
| Reddit | 60 | minute | Standard API |
| GDELT | 100 | minute | Conservative limit |
| Jan AI | 1000 | hour | Local server |
| Google Fact Check | 1000 | day | Free tier |
| OpenAI | 3000 | minute | Depends on plan |

## Error Handling

### Common Error Codes

- `SERVICES_UNAVAILABLE`: Required services not configured
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `INVALID_API_KEY`: API key is invalid or expired
- `SERVICE_NOT_FOUND`: Requested service doesn't exist

### Example Error Response

```json
{
  "error": "Rate Limit Exceeded",
  "message": "API rate limit exceeded for one or more services",
  "services": [
    {
      "service": "newsApi",
      "resetTime": "2025-11-12T00:00:00.000Z"
    }
  ],
  "retryAfter": 3600,
  "code": "RATE_LIMIT_EXCEEDED"
}
```

## Security Features

### API Key Masking

API keys are automatically masked in logs and responses:
- Keys ≤ 8 characters: `***`
- Longer keys: `abcd***xyz` (first 4 + last 4 characters)

### Environment Validation

- Required keys validated on startup
- Production mode enforces strict validation
- Development mode shows warnings for missing optional keys

## Testing

Run the test script to verify the system:

```bash
node scripts/test-api-key-management.js
```

This will test:
- Service availability
- Rate limiting functionality
- Configuration retrieval
- Error handling
- Key masking security

## Monitoring

### Service Health Dashboard

Access the health dashboard at `/api/health` to monitor:
- Service availability
- Rate limit usage
- API response times
- Error rates

### Alerts

The system can be configured to alert when:
- Required services become unavailable
- Rate limits approach thresholds
- API errors exceed normal rates

## Best Practices

1. **Environment Variables**: Store all API keys in environment variables
2. **Rate Limiting**: Always check rate limits before making API calls
3. **Error Handling**: Implement graceful fallbacks for service failures
4. **Monitoring**: Regularly check service health endpoints
5. **Security**: Never log or expose actual API keys
6. **Testing**: Use the test script to verify configuration changes

## Troubleshooting

### Common Issues

1. **Service Unavailable**: Check environment variables are set correctly
2. **Rate Limit Exceeded**: Wait for reset time or implement backoff strategy
3. **Invalid API Key**: Verify key is correct and hasn't expired
4. **Connection Timeout**: Check network connectivity and service status

### Debug Commands

```bash
# Test all services
node scripts/test-api-key-management.js

# Check specific service
curl http://localhost:3001/api/health/service/newsApi

# Test connectivity
curl http://localhost:3001/api/health/test/newsApi
```