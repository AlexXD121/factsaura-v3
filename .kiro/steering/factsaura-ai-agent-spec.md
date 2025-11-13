# FactSaura AI Agent Specification

## Core Concept
FactSaura is a proactive AI-powered misinformation detection platform where AI agents continuously monitor multiple free data sources, detect suspicious/fake information, and automatically create warning posts to alert users in real-time.

## AI Agent Functionality

### 1. Multi-Source Monitoring Agent
- **Purpose**: Continuously monitor multiple free data sources for trending topics and viral content
- **Frequency**: Every 2-3 minutes during active monitoring
- **Data Sources**:
  - **GDELT**: Global news events, trending topics, crisis signals (free & comprehensive)
  - **NewsAPI.org**: Mainstream news articles for credibility comparison (free tier)
  - **Mastodon**: Decentralized social media posts (open API, developer-friendly)
  - **Reddit**: Community discussions and viral content (within API limits)
  - **Google Fact Check Tools**: Verified fact-checks and ClaimReview data (free)
  - **Media Cloud**: News coverage tracking and narrative analysis (open research platform)
- **Targets**: 
  - Trending hashtags and viral content
  - Crisis-related keywords (earthquake, flood, medical, political)
  - Suspicious patterns (unverified claims, emotional language)
  - Cross-platform content verification

### 2. Misinformation Detection Agent
- **Analysis Pipeline**:
  - Text pattern recognition for common misinformation signals
  - Source credibility verification
  - Cross-reference with fact-checking databases
  - Confidence scoring (0-100%)
- **Detection Criteria**:
  - Unverified medical claims
  - False emergency alerts
  - Manipulated statistics
  - Conspiracy theories
  - Deepfake content indicators

### 3. Auto-Posting Agent
- **Trigger**: When misinformation confidence > 70%
- **Post Format**:
  ```
  🚨 MISINFORMATION ALERT
  
  Detected on [Source Platform]: [Original claim]
  
  Analysis: [AI explanation]
  Confidence: [X]% fake news
  Sources: [Verification links]
  
  #FakeNewsAlert #FactCheck
  ```
- **Real-time Broadcast**: Notify all connected users instantly

### 4. Interactive Chat Agent
- **Context-Aware**: Understands specific posts and user questions
- **Capabilities**:
  - Explain detection reasoning
  - Provide additional sources
  - Answer follow-up questions
  - Clarify complex topics

## Technical Implementation

### Backend Architecture
```
Multi-Source APIs → Monitoring Agent → Analysis Pipeline → Auto-Post → Real-time Alerts
(GDELT, NewsAPI,      ↓                    ↓
Mastodon, Reddit) → Jan AI (Local) → Confidence Scoring → Database Storage
                      ↓
              Google Fact Check → Cross-Verification
```

### Key Components
1. **Multi-Source Monitor**: Collect from GDELT, NewsAPI, Mastodon, Reddit, Media Cloud
2. **Cross-Verification Engine**: Compare claims against Google Fact Check database
3. **Jan AI Integration**: Local AI analysis for privacy and speed
4. **Real-time Engine**: WebSocket for instant user notifications
5. **Database**: Store posts, analysis results, user interactions
6. **Chat Interface**: Interactive AI assistant for user queries

### Data Flow
1. **Monitor**: AI scans multiple free sources (GDELT, NewsAPI, Mastodon, Reddit)
2. **Cross-Check**: Verify claims against Google Fact Check and Media Cloud
3. **Detect**: Pattern matching identifies suspicious content across sources
4. **Analyze**: Jan AI evaluates and scores content with source reliability
5. **Post**: Auto-create warning post if confidence > threshold
6. **Alert**: Real-time notification to all users
7. **Interact**: Users can chat with AI about specific posts

## User Experience
- **Passive Protection**: Users get alerts without manual submission
- **Community Verification**: Vote and discuss AI findings
- **Educational**: Learn about misinformation patterns
- **Real-time**: Instant warnings about trending fake news

## Success Metrics
- **Speed**: Detect and alert within 5 minutes of content appearing on any monitored source
- **Accuracy**: >80% precision in misinformation detection with cross-source verification
- **Coverage**: Monitor 1000+ posts per hour across all free data sources
- **Cost**: $0 API costs using only free tiers and open data sources
- **Engagement**: Real-time notifications to all connected users

## Implementation Priority
1. Multi-source monitoring (GDELT, NewsAPI, Mastodon, Reddit)
2. Google Fact Check integration for verification
3. Jan AI integration for analysis
4. Auto-posting mechanism with source attribution
5. Real-time user notifications
6. Interactive chat interface
7. Community voting and discussion features

## Free Data Source Benefits
- **No API Costs**: All sources offer free tiers or open access
- **Better Coverage**: Multiple platforms vs single expensive social media API
- **Cross-Verification**: Compare claims across different source types
- **Reliability**: Mix of news, social, and fact-checking sources
- **Scalability**: No rate limit concerns with diverse free sources

( always stsart the backend or cleint in a pwershell window not in kiro terminal oke )