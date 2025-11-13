# GDELT API Integration Documentation

## Overview

The GDELT (Global Database of Events, Language, and Tone) API integration provides real-time global news events and crisis monitoring capabilities for FactSaura. GDELT is a completely free API that monitors news sources worldwide and provides comprehensive event data with tone analysis and geographic information.

## Features

### 🌍 Global Event Monitoring
- Real-time access to global news events
- Crisis detection and urgency scoring
- Geographic distribution analysis
- Tone analysis (positive/negative sentiment)

### 🚨 Crisis-Specific Capabilities
- Automatic crisis keyword detection
- Urgency level classification (critical, high, medium, low)
- Geographic relevance scoring
- Multi-source event correlation

### 📊 Advanced Analytics
- Crisis score calculation based on multiple factors
- Geographic event distribution
- Trending topic analysis
- Source credibility assessment

## API Endpoints

### Base URL: `/api/gdelt`

#### 1. Global Events
```
GET /api/gdelt/events
```

**Query Parameters:**
- `query` (string): Search query (default: "crisis OR emergency")
- `timespan` (string): Time range - "1day", "3days", "1week" (default: "3days")
- `maxrecords` (number): Maximum records to return (default: 250)
- `mode` (string): Response mode - "artlist", "timeline", "wordcloud" (default: "artlist")
- `sort` (string): Sort order - "hybridrel", "date" (default: "hybridrel")

**Example:**
```bash
curl "http://localhost:3001/api/gdelt/events?query=earthquake&timespan=1day&maxrecords=10"
```

#### 2. Crisis Monitoring
```
GET /api/gdelt/crisis
```

Monitors crisis-related events with automatic urgency scoring and geographic analysis.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "gdelt-1699123456-emergency-alert",
        "title": "Emergency Alert: Flood Warning Issued",
        "content": "Emergency flood warning content...",
        "url": "https://example.com/flood-warning",
        "publishedAt": "2024-01-01T12:00:00Z",
        "source": {
          "name": "news.com",
          "country": "US",
          "language": "english"
        },
        "location": {
          "country": "US",
          "coordinates": { "latitude": null, "longitude": null }
        },
        "tone": {
          "score": -5.2,
          "positive": false,
          "negative": true,
          "neutral": false
        },
        "crisisScore": 0.85,
        "urgencyLevel": "critical",
        "geographicRelevance": {
          "country": "US",
          "isPriorityCountry": true,
          "relevanceScore": 0.8,
          "region": "North America"
        },
        "themes": ["CRISIS", "EMERGENCY", "DISASTER"],
        "platform": "gdelt",
        "contentType": "global_event"
      }
    ],
    "metadata": {
      "source": "gdelt",
      "type": "crisis",
      "totalResults": 1,
      "timestamp": "2024-01-01T12:00:00Z"
    }
  }
}
```

#### 3. Trending Topics
```
GET /api/gdelt/trending
```

**Query Parameters:**
- `timespan` (string): Time range (default: "1day")
- `maxrecords` (number): Maximum records (default: 100)
- `sourcecountry` (string): Filter by source country
- `theme` (string): Filter by theme

#### 4. Event Search
```
GET /api/gdelt/search
```

**Query Parameters:**
- `q` (string, required): Search query
- `timespan` (string): Time range (default: "3days")
- `maxrecords` (number): Maximum records (default: 250)
- `mode` (string): Response mode (default: "artlist")
- `sort` (string): Sort order (default: "hybridrel")
- `sourcecountry` (string): Filter by source country
- `sourcelang` (string): Source language (default: "english")

#### 5. Geographic Events
```
GET /api/gdelt/geographic
```

Returns events with geographic distribution analysis.

**Query Parameters:**
- `query` (string): Search query (default: "crisis OR emergency")
- `timespan` (string): Time range (default: "1day")
- `maxrecords` (number): Maximum records (default: 500)

#### 6. Service Status
```
GET /api/gdelt/status
```

Returns service health and configuration information.

#### 7. Connection Test
```
GET /api/gdelt/test
```

Tests the GDELT API connection and returns diagnostic information.

## Crisis Scoring Algorithm

The crisis score (0-1) is calculated based on multiple factors:

### 1. Keyword Matching (up to 0.45)
- Matches against crisis keywords from environment variables
- Each keyword match adds 0.15 points (max 3 matches)

### 2. Tone Analysis (up to 0.2)
- Negative tone with score < -5: +0.2 points
- Negative tone with score < -2: +0.1 points

### 3. Crisis Themes (up to 0.3)
- Matches against predefined crisis themes
- Each theme match adds 0.1 points (max 3 matches)

### 4. Recency Bonus (up to 0.15)
- Events < 1 hour old: +0.15 points
- Events < 6 hours old: +0.1 points
- Events < 24 hours old: +0.05 points

### Urgency Levels
- **Critical**: Crisis score ≥ 0.8
- **High**: Crisis score ≥ 0.6
- **Medium**: Crisis score ≥ 0.4
- **Low**: Crisis score < 0.4

## Geographic Analysis

### Priority Countries
The system prioritizes events from key countries:
- US, IN, GB, CA, AU, DE, FR, JP

### Geographic Relevance
- Priority countries: relevance score 0.8
- Other countries: relevance score 0.5

### Regional Classification
Events are classified into regions:
- North America, Europe, Asia, Oceania, South America, Africa, Other

## Configuration

### Environment Variables
```bash
# Crisis detection keywords (comma-separated)
CRISIS_KEYWORDS=flood,earthquake,emergency,scam,fake,misinformation
```

### Crisis Themes
Predefined themes for crisis detection:
- CRISIS, DISASTER, EMERGENCY, FLOOD, EARTHQUAKE, FIRE
- MEDICAL_EMERGENCY, EPIDEMIC, VIOLENCE, CONFLICT, TERRORISM
- MISINFORMATION, FAKE_NEWS, CONSPIRACY, SCAM, FRAUD

## Rate Limiting

- **Limit**: 100 requests per minute (conservative)
- **Reset**: Every 60 seconds
- **Behavior**: Returns rate limit error when exceeded

## Error Handling

### Common Error Responses

#### Rate Limit Exceeded
```json
{
  "success": false,
  "error": "GDELT API rate limit exceeded. Try again later.",
  "message": "Failed to fetch global events"
}
```

#### Missing Query Parameter
```json
{
  "success": false,
  "error": "Query parameter is required",
  "message": "Please provide a search query"
}
```

#### API Connection Error
```json
{
  "success": false,
  "error": "Network timeout",
  "message": "Failed to fetch global events"
}
```

## Testing

### Unit Tests
```bash
# Run GDELT service tests
npm test -- --testPathPattern=gdeltApiService.test.js

# Run GDELT controller tests
npm test -- --testPathPattern=gdeltApiController.test.js
```

### Integration Tests
```bash
# Test GDELT service functionality
node scripts/test-gdelt.js

# Test GDELT API endpoints (requires server running)
node scripts/test-gdelt-endpoints.js
```

### Manual Testing
```bash
# Start the server
npm run dev

# Test endpoints
curl "http://localhost:3001/api/gdelt/test"
curl "http://localhost:3001/api/gdelt/crisis"
curl "http://localhost:3001/api/gdelt/search?q=earthquake"
```

## Implementation Details

### Service Architecture
```
GdeltApiService
├── Rate Limiting
├── Request Processing
├── Response Processing
├── Crisis Scoring
├── Geographic Analysis
└── Error Handling
```

### Controller Architecture
```
GdeltApiController
├── HTTP Request Handling
├── Parameter Validation
├── Service Integration
├── Response Formatting
└── Error Management
```

### Data Flow
```
HTTP Request → Controller → Service → GDELT API → Processing → Response
```

## Advantages of GDELT

### 1. **Completely Free**
- No API key required
- No rate limits from GDELT side
- No usage costs

### 2. **Comprehensive Coverage**
- Global news monitoring
- Multiple languages
- Real-time updates

### 3. **Rich Metadata**
- Tone analysis
- Geographic information
- Source credibility data

### 4. **Crisis-Focused**
- Built-in event detection
- Sentiment analysis
- Geographic distribution

## Integration with FactSaura

### Multi-Source Monitoring
GDELT complements other data sources:
- **NewsAPI**: Mainstream news verification
- **Reddit**: Community discussions
- **GDELT**: Global events and crisis detection

### AI Agent Integration
GDELT data feeds into the 4-agent ecosystem:
- **Monitor Agent**: Uses GDELT for global event detection
- **Verification Agent**: Cross-references GDELT events
- **Learning Agent**: Analyzes GDELT patterns
- **Response Agent**: Generates reports from GDELT data

### Crisis Response Pipeline
```
GDELT Crisis Detection → AI Analysis → Community Alert → User Notification
```

## Future Enhancements

### 1. **Enhanced Geographic Features**
- Geocoding integration
- Distance-based relevance
- Regional crisis patterns

### 2. **Advanced Analytics**
- Trend prediction
- Event correlation
- Source reliability scoring

### 3. **Real-time Streaming**
- WebSocket integration
- Live event feeds
- Instant crisis alerts

### 4. **Machine Learning Integration**
- Pattern recognition
- Anomaly detection
- Predictive modeling

## Troubleshooting

### Common Issues

#### No Events Returned
- Check query parameters
- Verify timespan is appropriate
- Try broader search terms

#### Rate Limit Errors
- Wait for rate limit reset
- Reduce request frequency
- Implement request queuing

#### Connection Timeouts
- Check network connectivity
- Verify GDELT API status
- Implement retry logic

### Debug Commands
```bash
# Check service status
curl "http://localhost:3001/api/gdelt/status"

# Test connection
curl "http://localhost:3001/api/gdelt/test"

# View service logs
tail -f logs/gdelt-service.log
```

## Conclusion

The GDELT API integration provides FactSaura with powerful global event monitoring and crisis detection capabilities. Its free access, comprehensive coverage, and rich metadata make it an ideal complement to other data sources in the multi-agent misinformation detection system.