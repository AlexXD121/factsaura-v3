# Keyword-Based Content Filtering

## Overview

The Keyword-Based Content Filtering system provides centralized, intelligent filtering of content across all data sources (NewsAPI, Reddit, GDELT) to identify crisis situations, misinformation, viral content, and spam. This system is integrated into the content scraping pipeline to automatically enhance content with filtering metadata and prioritize important information.

## Features

### 🔍 Multi-Category Filtering
- **Crisis Detection**: Emergency situations, disasters, safety threats
- **Misinformation Detection**: Fake news patterns, conspiracy theories, unverified claims
- **Viral Content Detection**: Sensational headlines, trending indicators
- **Spam Detection**: Low-quality content, promotional material
- **Health Monitoring**: Medical misinformation, health crisis content
- **Location Awareness**: Geographic relevance filtering

### 🎯 Intelligent Scoring
- Confidence scores (0-1) for each category
- Weighted overall scoring combining multiple factors
- Keyword density analysis
- Coverage ratio calculations
- Customizable score thresholds

### ⚙️ Configurable System
- Case-sensitive or case-insensitive matching
- Partial match or exact word boundary matching
- Custom keyword categories
- Dynamic keyword management
- Adjustable filtering thresholds

## Architecture

### Core Components

```
KeywordFilterService
├── Keyword Categories (crisis, misinformation, viral, spam, health, location)
├── Configuration Management (thresholds, matching rules)
├── Content Analysis Engine (scoring, pattern matching)
├── Statistics Tracking (usage metrics, performance data)
└── API Integration (REST endpoints for management)
```

### Integration Points

```
Content Sources → ContentScrapingScheduler → KeywordFilterService → Filtered Content
(News, Reddit,     (Orchestration)           (Analysis & Scoring)   (Enhanced with
 GDELT)                                                              metadata)
```

## API Endpoints

### Keyword Management

#### Get Keyword Categories
```http
GET /api/content-scraping/keywords/categories
```

**Response:**
```json
{
  "success": true,
  "categories": ["crisis", "misinformation", "viral", "spam", "health", "location"],
  "categoryCount": 6
}
```

#### Get Keywords for Category
```http
GET /api/content-scraping/keywords/{category}
```

**Response:**
```json
{
  "success": true,
  "category": "crisis",
  "keywords": ["breaking", "emergency", "urgent", "disaster", "evacuation"],
  "keywordCount": 39
}
```

#### Add Keywords to Category
```http
POST /api/content-scraping/keywords/add
Content-Type: application/json

{
  "category": "crisis",
  "keywords": ["tsunami", "wildfire", "blackout"]
}
```

#### Remove Keywords from Category
```http
POST /api/content-scraping/keywords/remove
Content-Type: application/json

{
  "category": "spam",
  "keywords": ["unwanted-keyword"]
}
```

### Content Filtering

#### Get Crisis Content
```http
GET /api/content-scraping/crisis?minScore=0.3
```

**Response:**
```json
{
  "success": true,
  "crisisContent": {
    "items": [
      {
        "title": "Breaking: Major earthquake hits Mumbai",
        "keywordScores": {
          "crisis": 0.85,
          "health": 0.2
        },
        "keywordMatches": {
          "crisis": ["breaking", "earthquake", "emergency"]
        },
        "overallKeywordScore": 0.65,
        "filterReason": "crisis"
      }
    ],
    "totalProcessed": 100,
    "totalFiltered": 5
  }
}
```

#### Get Misinformation Content
```http
GET /api/content-scraping/misinformation?minScore=0.4
```

### Configuration Management

#### Update Filter Configuration
```http
PUT /api/content-scraping/keywords/config
Content-Type: application/json

{
  "caseSensitive": false,
  "partialMatch": true,
  "scoreThresholds": {
    "crisis": 0.3,
    "misinformation": 0.4,
    "viral": 0.2,
    "spam": 0.6
  }
}
```

#### Get Filter Statistics
```http
GET /api/content-scraping/keywords/stats
```

**Response:**
```json
{
  "success": true,
  "keywordFilterStats": {
    "totalFiltered": 1250,
    "categoryMatches": {
      "crisis": 45,
      "misinformation": 23,
      "viral": 156,
      "spam": 89
    },
    "keywordCounts": {
      "crisis": 39,
      "misinformation": 27,
      "viral": 23,
      "spam": 23
    },
    "uptime": 3600
  }
}
```

## Configuration

### Environment Variables

```bash
# Crisis Keywords (comma-separated)
CRISIS_KEYWORDS="tsunami,wildfire,blackout,cyberattack"

# Misinformation Keywords
MISINFORMATION_KEYWORDS="hoax,conspiracy,cover-up,fake news"

# Viral Content Keywords
VIRAL_KEYWORDS="shocking,unbelievable,gone viral,trending"

# Spam Keywords
SPAM_KEYWORDS="click here,buy now,limited time,get rich quick"

# Health Keywords
HEALTH_KEYWORDS="covid,vaccine,pandemic,outbreak,symptoms"

# Location Keywords
LOCATION_KEYWORDS="mumbai,delhi,bangalore,india"
```

### Default Configuration

```javascript
{
  caseSensitive: false,
  partialMatch: true,
  minKeywordLength: 3,
  maxKeywordsPerCategory: 100,
  scoreThresholds: {
    crisis: 0.3,
    misinformation: 0.4,
    viral: 0.2,
    spam: 0.6
  }
}
```

## Usage Examples

### Basic Content Filtering

```javascript
const KeywordFilterService = require('./services/keywordFilterService');
const filterService = new KeywordFilterService();

// Filter content with scores and matches
const result = filterService.filterContent(contentArray, {
  categories: ['crisis', 'misinformation'],
  includeScores: true,
  includeMatches: true,
  minScore: 0.3
});

console.log(`Filtered ${result.totalFiltered} items from ${result.totalProcessed}`);
```

### Crisis Content Detection

```javascript
// Get only crisis-related content
const crisisContent = filterService.getCrisisContent(contentArray, 0.3);

crisisContent.items.forEach(item => {
  console.log(`Crisis Score: ${item.keywordScores.crisis}`);
  console.log(`Matched Keywords: ${item.keywordMatches.crisis.join(', ')}`);
});
```

### Spam Removal

```javascript
// Remove spam content
const cleanContent = filterService.removeSpamContent(contentArray, 0.6);
console.log(`Removed ${cleanContent.spamRemoved} spam items`);
```

### Custom Keywords

```javascript
// Add custom keywords for specific use cases
filterService.addKeywords('crisis', ['cyberattack', 'data breach', 'system failure']);

// Remove outdated keywords
filterService.removeKeywords('viral', ['outdated-term']);
```

## Keyword Categories

### Crisis Keywords (39 default)
- Emergency situations: `breaking`, `urgent`, `emergency`, `alert`, `warning`
- Natural disasters: `earthquake`, `flood`, `fire`, `storm`, `tsunami`
- Human-made crises: `attack`, `explosion`, `shooting`, `terrorist`
- Response actions: `evacuation`, `lockdown`, `rescue`, `casualty`

### Misinformation Keywords (27 default)
- Fake news indicators: `fake news`, `hoax`, `conspiracy`, `cover-up`
- Manipulation tactics: `they don't want you to know`, `wake up`, `sheeple`
- Unverified claims: `unconfirmed`, `alleged`, `rumored`, `claimed`
- Medical misinformation: `miracle cure`, `secret remedy`, `big pharma`

### Viral Content Keywords (23 default)
- Sensational language: `shocking`, `unbelievable`, `incredible`, `amazing`
- Viral indicators: `viral`, `trending`, `gone viral`, `breaking the internet`
- Engagement hooks: `you won't believe`, `must see`, `watch this`

### Spam Keywords (23 default)
- Call-to-action: `click here`, `buy now`, `act fast`, `don't miss`
- Money schemes: `get rich quick`, `free money`, `easy money`
- Guarantees: `guaranteed`, `100% effective`, `no risk`
- Adult content: `singles in your area`, `hot singles`, `meet tonight`

### Health Keywords (20 default)
- Medical terms: `covid`, `coronavirus`, `vaccine`, `symptoms`, `diagnosis`
- Health actions: `treatment`, `cure`, `therapy`, `quarantine`, `isolation`
- Safety measures: `mask`, `sanitizer`, `social distancing`

### Location Keywords (17 default)
- Indian cities: `mumbai`, `delhi`, `bangalore`, `chennai`, `kolkata`
- Country terms: `india`, `indian`, `bharath`, `hindustan`, `desi`

## Performance Considerations

### Optimization Features
- Efficient regex compilation and caching
- Batch processing for large content arrays
- Configurable keyword limits per category
- Statistics tracking for performance monitoring

### Memory Usage
- Keyword storage: ~50KB for default categories
- Processing overhead: ~1-2ms per content item
- Statistics storage: ~10KB for tracking data

### Scalability
- Supports 1000+ content items per batch
- Sub-second processing for typical workloads
- Configurable thresholds for performance tuning

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=keywordFilterService.test.js
```

### Integration Testing
```bash
node scripts/test-keyword-filtering.js
```

### Test Coverage
- ✅ Keyword management (add/remove/get)
- ✅ Content filtering and scoring
- ✅ Configuration management
- ✅ Statistics tracking
- ✅ Edge cases and error handling
- ✅ Case sensitivity and matching modes
- ✅ Multi-category analysis

## Monitoring and Analytics

### Key Metrics
- **Total Filtered**: Number of content items processed
- **Category Matches**: Distribution of matches across categories
- **Processing Time**: Average time per content item
- **Keyword Effectiveness**: Most frequently matched keywords
- **False Positive Rate**: Manual review feedback integration

### Dashboard Integration
The keyword filtering statistics are exposed through REST APIs and can be integrated into monitoring dashboards to track:
- Real-time filtering performance
- Content category distribution
- Trending keyword matches
- System health and uptime

## Future Enhancements

### Planned Features
- **Machine Learning Integration**: Automatic keyword discovery from content patterns
- **Contextual Analysis**: Semantic understanding beyond keyword matching
- **Dynamic Thresholds**: Adaptive scoring based on content volume and quality
- **Multi-language Support**: Keyword sets for different languages
- **Feedback Loop**: User feedback integration for keyword effectiveness
- **Advanced Analytics**: Trend analysis and predictive filtering

### Integration Opportunities
- **AI Analysis Pipeline**: Enhanced scoring with AI confidence metrics
- **Real-time Alerts**: Immediate notifications for high-priority content
- **Content Moderation**: Integration with human review workflows
- **API Rate Limiting**: Smart filtering to optimize API usage across sources