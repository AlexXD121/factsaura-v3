# Reddit API Integration Documentation

## Overview

The Reddit API integration provides real-time monitoring and trending content detection from Reddit, one of the largest social media platforms. This integration is crucial for FactSaura's multi-source monitoring approach to detect misinformation and viral content across different platforms.

## Features

### Core Functionality
- **Trending Posts**: Fetch hot, new, rising, or top posts from any subreddit
- **Search Capability**: Search for specific content across Reddit
- **Crisis Monitoring**: Automated monitoring of crisis-related subreddits
- **Subreddit Specific**: Get posts from specific subreddits
- **Crisis Scoring**: Automatic scoring of posts for crisis/misinformation potential

### Crisis Detection
- **Keyword Monitoring**: Detects posts containing crisis-related keywords
- **Engagement Analysis**: High engagement posts with controversy indicators
- **Subreddit Filtering**: Monitors specific crisis-related subreddits
- **Urgency Levels**: Categorizes posts as critical, high, medium, or low urgency

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=FactSaura:v1.0.0 (by /u/factsaura)

# Reddit Monitoring Configuration
REDDIT_CRISIS_SUBREDDITS=news,worldnews,breakingnews,emergencies,conspiracy,misinformation
REDDIT_TRENDING_SUBREDDITS=all,popular,news,worldnews,technology,science,politics
```

### Getting Reddit API Credentials

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Fill in the required information:
   - **Name**: FactSaura
   - **Description**: AI-powered misinformation detection
   - **About URL**: (optional)
   - **Redirect URI**: http://localhost (required but not used for script apps)
5. Copy the client ID (under the app name) and client secret
6. Use your Reddit username and password

## API Endpoints

### Base URL
```
http://localhost:3001/api/reddit
```

### Available Endpoints

#### 1. Get Trending Posts
```http
GET /api/reddit/trending
```

**Query Parameters:**
- `subreddit` (string, default: 'all') - Subreddit to fetch from
- `sort` (string, default: 'hot') - Sort method: hot, new, rising, top
- `timeframe` (string, default: 'day') - Time period for 'top' sort: hour, day, week, month, year, all
- `limit` (number, default: 25) - Number of posts to fetch (max 100)

**Example:**
```bash
curl "http://localhost:3001/api/reddit/trending?subreddit=news&sort=hot&limit=10"
```

#### 2. Search Posts
```http
GET /api/reddit/search
```

**Query Parameters:**
- `q` (string, required) - Search query
- `subreddit` (string, default: 'all') - Subreddit to search in
- `sort` (string, default: 'relevance') - Sort method: relevance, hot, top, new, comments
- `timeframe` (string, default: 'all') - Time period for search
- `limit` (number, default: 25) - Number of results

**Example:**
```bash
curl "http://localhost:3001/api/reddit/search?q=misinformation&subreddit=news&sort=relevance&limit=5"
```

#### 3. Monitor Crisis Content
```http
GET /api/reddit/crisis
```

Automatically monitors crisis-related subreddits and returns posts with crisis scoring.

**Example:**
```bash
curl "http://localhost:3001/api/reddit/crisis"
```

#### 4. Get Subreddit Posts
```http
GET /api/reddit/subreddit/:name
```

**Path Parameters:**
- `name` (string, required) - Subreddit name (without r/)

**Query Parameters:**
- `sort` (string, default: 'hot') - Sort method
- `limit` (number, default: 25) - Number of posts
- `timeframe` (string, default: 'day') - Time period for 'top' sort

**Example:**
```bash
curl "http://localhost:3001/api/reddit/subreddit/technology?sort=hot&limit=10"
```

#### 5. Service Status
```http
GET /api/reddit/status
```

Returns service health, configuration status, and rate limit information.

#### 6. Test Connection
```http
GET /api/reddit/test
```

Tests the Reddit API connection and returns connection status.

## Response Format

### Successful Response
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "reddit-1234567890-news-abc123",
        "title": "Breaking: Important News",
        "content": "Post content or URL",
        "url": "https://reddit.com/r/news/comments/abc123",
        "externalUrl": "https://example.com/news-article",
        "author": "username",
        "subreddit": "news",
        "score": 1500,
        "upvoteRatio": 0.85,
        "numComments": 250,
        "created": "2024-01-15T10:30:00.000Z",
        "isVideo": false,
        "isImage": false,
        "isLink": true,
        "isText": false,
        "flair": "Breaking News",
        "nsfw": false,
        "stickied": false,
        "locked": false,
        "detectedAt": "2024-01-15T10:35:00.000Z",
        "platform": "reddit",
        "contentType": "reddit_post",
        "language": "en",
        "wordCount": 0,
        "engagement": {
          "score": 1500,
          "comments": 250,
          "upvoteRatio": 0.85
        },
        "crisisScore": 0.7,
        "urgencyLevel": "high"
      }
    ],
    "metadata": {
      "source": "reddit",
      "type": "trending",
      "context": {
        "subreddit": "news",
        "sort": "hot"
      },
      "retrievedCount": 1,
      "timestamp": "2024-01-15T10:35:00.000Z",
      "requestsRemaining": 55
    }
  },
  "message": "Reddit trending posts retrieved successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Reddit API rate limit exceeded. Try again later.",
  "message": "Failed to fetch trending Reddit posts"
}
```

## Crisis Detection Algorithm

### Crisis Score Calculation

The crisis score (0-1) is calculated based on:

1. **Crisis Keywords** (0.3 points): Posts containing emergency, crisis, fake, misinformation, etc.
2. **Crisis Subreddits** (0.2 points): Posts from monitored crisis subreddits
3. **High Engagement** (0.2 points): Posts with high scores (viral potential)
4. **Comment Activity** (0.15 points): Posts with many comments (discussion/controversy)
5. **Low Upvote Ratio** (0.15 points): Controversial posts (potential misinformation)
6. **Recency** (0.1 points): Recent posts get higher priority

### Urgency Levels

- **Critical** (≥0.8): Immediate attention required
- **High** (≥0.6): High priority monitoring
- **Medium** (≥0.4): Standard monitoring
- **Low** (<0.4): Background monitoring

## Rate Limiting

- **Limit**: 60 requests per minute
- **Auto-reset**: Rate limit resets every minute
- **Delay**: 1 second between requests (configured in snoowrap)
- **Monitoring**: Request count tracked and reported in status endpoints

## Testing

### Run Service Tests
```bash
# Test the Reddit service directly
node scripts/test-reddit.js

# Test HTTP endpoints
node scripts/test-reddit-endpoints.js

# Run unit tests
npm test -- redditApiService.test.js
npm test -- redditApiController.test.js
```

### Manual Testing
```bash
# Test connection
curl http://localhost:3001/api/reddit/test

# Get service status
curl http://localhost:3001/api/reddit/status

# Fetch trending posts
curl "http://localhost:3001/api/reddit/trending?subreddit=news&limit=5"
```

## Integration with FactSaura

### Multi-Source Monitoring
The Reddit integration works alongside NewsAPI and other sources to provide comprehensive content monitoring:

```javascript
// Example: Combined monitoring
const newsData = await newsApiService.monitorCrisisContent();
const redditData = await redditApiService.monitorCrisisContent();

const combinedCrisisContent = [
  ...newsData.articles.map(article => ({ ...article, source: 'news' })),
  ...redditData.posts.map(post => ({ ...post, source: 'reddit' }))
];
```

### AI Analysis Integration
Reddit posts can be analyzed by the AI service for misinformation detection:

```javascript
// Example: AI analysis of Reddit posts
const redditPosts = await redditApiService.getTrendingPosts();
for (const post of redditPosts.posts) {
  const analysis = await aiService.analyzeContent(post.title + ' ' + post.content);
  post.aiAnalysis = analysis;
}
```

## Troubleshooting

### Common Issues

1. **"Reddit API not configured"**
   - Check that all Reddit credentials are set in .env
   - Ensure credentials are not placeholder values

2. **"Rate limit exceeded"**
   - Wait for rate limit to reset (1 minute)
   - Reduce request frequency
   - Check request count in status endpoint

3. **"Connection failed"**
   - Verify Reddit credentials are correct
   - Check internet connection
   - Ensure Reddit account is not suspended

4. **"Subreddit not found"**
   - Verify subreddit name is correct
   - Check if subreddit is private or banned
   - Try with a different subreddit

### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=reddit:* node server.js
```

## Security Considerations

- Store Reddit credentials securely in environment variables
- Never commit credentials to version control
- Use read-only Reddit account for monitoring
- Implement proper error handling to avoid credential leakage
- Monitor rate limits to avoid API suspension

## Future Enhancements

- **Real-time Streaming**: Implement Reddit's real-time API for instant updates
- **Comment Analysis**: Analyze post comments for additional context
- **User Reputation**: Track user credibility and posting patterns
- **Subreddit Reputation**: Score subreddits based on misinformation frequency
- **Image Analysis**: Analyze images and videos posted on Reddit
- **Cross-platform Correlation**: Link Reddit posts to news articles and other sources