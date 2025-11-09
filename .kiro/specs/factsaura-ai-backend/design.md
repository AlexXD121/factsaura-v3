# Design Document

## Overview

FactSaura will be transformed into a Reddit-like social platform with integrated AI agents for real-time misinformation detection. The platform combines a modern, glassmorphism UI with functional AI-powered content analysis, designed to be implemented within 24 hours while delivering maximum visual impact for hackathon judges.

## Architecture

### Frontend Architecture
- **Framework**: React 19 with Vite (existing setup)
- **Styling**: Tailwind CSS with custom glassmorphism components
- **Animations**: Framer Motion for micro-interactions and page transitions
- **State Management**: React Context + useReducer for global state
- **Real-time Updates**: WebSocket connection for live feed updates
- **UI Components**: Custom component library with consistent design system

### 4-Agent Ecosystem Backend Architecture
- **Runtime**: Node.js with Express.js
- **Agent Orchestration**: Redis-based job queues for 4 specialized agents
- **Database**: Supabase (PostgreSQL) + Redis for agent coordination and learning patterns
- **AI Integration**: Jan AI local server + OpenAI for advanced analysis and learning
- **Monitor Agent**: Puppeteer/Cheerio + Twitter API for 24/7 content scanning
- **Verification Agent**: Trusted database APIs + fact-checking source integration
- **Learning Agent**: Machine learning pipeline for pattern recognition and adaptation
- **Response Agent**: Natural language generation for comprehensive fact-check reports
- **File Storage**: Supabase Storage for evidence and source materials
- **Authentication**: Supabase Auth for user management
- **WebSockets**: Socket.io for real-time agent ecosystem activity
- **Agent Communication**: Inter-agent messaging system with task handoffs

### 4-Agent Ecosystem Data Flow
```
Web Sources → Monitor Agent → Content Detection → Verification Agent → Database Cross-Check → Learning Agent → Pattern Analysis → Response Agent → Fact-Check Report → Community Feed
```

### Specialized Agent Architecture
```
🔍 Monitor Agent (24/7 scanning: Twitter, News, Blogs, Social Media) → 
✅ Verification Agent (Cross-reference trusted databases, credible sources) → 
🧠 Learning Agent (Adapt to new patterns, linguistic styles, ML improvement) → 
📝 Response Agent (Generate 30-second fact-check reports with evidence) → 
🔄 Ecosystem Feedback (Agents learn from community votes and expert verification)
```

### Agent Coordination System
```
Content Detection → Multi-Agent Analysis → Confidence Scoring → Report Generation → Community Posting → Continuous Learning Loop
```

### Crisis-Aware Architecture
```
Content Submission → Crisis Keyword Detection → Urgency Level Assignment → Expert Routing → Community Verification → Badge/Reputation Updates
```

## 4-Agent Ecosystem Specifications

### Agent 1: Monitor Agent 🔍
**Role**: 24/7 Content Surveillance
**Responsibilities**:
- Continuously scan news sites, social media platforms, blogs, forums
- Detect emerging content and trending claims
- Identify potential misinformation based on viral patterns
- Queue suspicious content for verification

**Technical Implementation**:
```javascript
class MonitorAgent {
  sources: ['twitter', 'reddit', 'news_apis', 'telegram', 'whatsapp_forwards']
  scanInterval: 30 // seconds
  detectionThreshold: 0.7 // suspicion level
  
  async scanSources() {
    // Continuous monitoring logic
    // Viral pattern detection
    // Content queuing for verification
  }
}
```

### Agent 2: Verification Agent ✅
**Role**: Cross-Reference & Authentication
**Responsibilities**:
- Cross-verify claims against trusted databases
- Check source credibility and authority
- Validate evidence and citations
- Generate confidence scores for claims

**Technical Implementation**:
```javascript
class VerificationAgent {
  trustedSources: ['who.int', 'cdc.gov', 'reuters.com', 'ap.org']
  databases: ['factcheck_db', 'medical_db', 'government_apis']
  
  async verifyClaim(content) {
    // Database cross-reference
    // Source credibility scoring
    // Evidence validation
    // Confidence calculation
  }
}
```

### Agent 3: Learning Agent 🧠
**Role**: Pattern Recognition & Adaptation
**Responsibilities**:
- Analyze misinformation patterns and trends
- Adapt to new linguistic styles and tactics
- Improve detection algorithms through ML
- Update agent behaviors based on feedback

**Technical Implementation**:
```javascript
class LearningAgent {
  mlModels: ['pattern_recognition', 'linguistic_analysis', 'trend_detection']
  feedbackLoop: true
  adaptationRate: 'continuous'
  
  async analyzePatterns(historicalData) {
    // Pattern recognition ML
    // Linguistic style analysis
    // Trend prediction
    // Agent behavior updates
  }
}
```

### Agent 4: Response Agent 📝
**Role**: Report Generation & Communication
**Responsibilities**:
- Generate comprehensive fact-check reports
- Create user-friendly explanations with evidence
- Produce 30-second response summaries
- Format content for community posting

**Technical Implementation**:
```javascript
class ResponseAgent {
  reportTemplate: 'comprehensive_factcheck'
  responseTime: 30 // seconds max
  evidenceFormat: 'user_friendly'
  
  async generateReport(verificationResults) {
    // Comprehensive report creation
    // Evidence formatting
    // User-friendly explanations
    // Community post generation
  }
}
```

## Components and Interfaces

### Core Components

#### 1. Crisis-Aware Feed Component (`/src/components/Feed/`)
```jsx
// Main social feed with crisis-priority sorting
<Feed>
  <CrisisAlert /> // Emergency notifications banner
  <PostCard /> // Individual post with AI analysis + crisis indicators
  <ExpertBadges /> // Verified expert highlights
  <LoadingSkeletons /> // Beautiful loading states
  <InfiniteScroll /> // Smooth pagination with crisis priority
</Feed>
```

**Features:**
- Glassmorphism cards with crisis-appropriate color coding (red/yellow/green)
- Animated confidence meters with source transparency panels
- Location relevance indicators and distance tags
- User reputation badges and expertise verification
- Crisis urgency visual hierarchy (critical posts larger/highlighted)
- Real-time post updates with emergency alert system

#### 2. AI Chat Interface (`/src/components/AIChat/`)
```jsx
// Floating chat widget for AI interaction
<AIChatWidget>
  <ChatBubble /> // Animated message bubbles
  <TypingIndicator /> // AI thinking animation
  <ConfidenceBar /> // Visual confidence display
</AIChatWidget>
```

**Features:**
- Floating chat bubble with smooth expand/collapse
- Typewriter effect for AI responses
- Animated confidence indicators
- Context-aware responses based on current post

#### 3. Content Submission (`/src/components/Submit/`)
```jsx
// Enhanced submission form with AI preview
<SubmissionForm>
  <DragDropZone /> // File upload with animations
  <AIPreview /> // Real-time analysis preview
  <ProgressIndicator /> // Analysis progress
</SubmissionForm>
```

**Features:**
- Drag-and-drop file upload with visual feedback
- Real-time AI analysis preview as user types
- Animated progress indicators during processing
- Success/error states with smooth transitions

#### 4. Premium Crisis-Aware UI Elements (`/src/components/UI/`)
```jsx
// Reusable premium components with crisis context
<GlassCard /> // Glassmorphism container with urgency color coding
<AnimatedButton /> // Interactive buttons with crisis-appropriate feedback
<ConfidenceMeter /> // Circular progress with source breakdown panel
<ReputationBadge /> // Animated user credibility indicators
<ExpertiseTag /> // Verified professional badges
<CrisisIndicator /> // Urgency level visual markers
<SourcePanel /> // Transparent AI reasoning breakdown
<LoadingSkeleton /> // Shimmer loading with crisis context messaging
<NotificationToast /> // Elegant notification system with urgency levels
```

### Backend API Endpoints

#### Posts API (`/api/posts/`)
- `GET /api/posts` - Fetch paginated feed with AI analysis
- `POST /api/posts` - Create new post with AI processing
- `PUT /api/posts/:id/vote` - Handle upvote/downvote
- `GET /api/posts/:id/comments` - Fetch threaded comments

#### AI Analysis API (`/api/ai/`)
- `POST /api/ai/analyze` - Analyze content for misinformation via Jan AI local server
- `POST /api/ai/chat` - Chat with AI agent about specific content via Jan AI
- `GET /api/ai/confidence/:postId` - Get detailed confidence breakdown

#### User API (`/api/users/`)
- `POST /api/auth/login` - User authentication
- `GET /api/users/profile` - User profile and reputation
- `PUT /api/users/preferences` - Update user settings

## Data Models

### Enhanced Post Model
```javascript
{
  id: "uuid",
  title: "string",
  content: "text",
  type: "user_submitted" | "ai_detected",
  author_id: "uuid",
  crisis_context: {
    urgency_level: "critical" | "high" | "medium",
    location_relevance: "mumbai" | "india" | "global",
    harm_category: "health" | "safety" | "financial" | "general",
    crisis_keywords: ["flood", "emergency", "scam"]
  },
  ai_analysis: {
    confidence_score: 0.85,
    is_misinformation: true,
    explanation: "string",
    reasoning_steps: ["step1", "step2", "step3"],
    sources_checked: [
      {url: "source1", credibility: 0.9, status: "verified"},
      {url: "source2", credibility: 0.7, status: "conflicting"}
    ],
    uncertainty_flags: ["needs_expert_review", "limited_sources"],
    analysis_timestamp: "datetime"
  },
  engagement: {
    upvotes: 42,
    downvotes: 3,
    comments_count: 15,
    expert_verifications: 3,
    community_trust_score: 0.78
  },
  created_at: "datetime",
  updated_at: "datetime"
}
```

### AI Analysis Model
```javascript
{
  id: "uuid",
  content_hash: "string",
  analysis_type: "text" | "image" | "url",
  confidence_score: 0.85,
  is_misinformation: boolean,
  explanation: "string",
  sources: ["array of urls"],
  processing_time_ms: 2500,
  model_version: "gpt-4-turbo",
  created_at: "datetime"
}
```

### Enhanced User Model
```javascript
{
  id: "uuid",
  username: "string",
  email: "string",
  reputation_score: 150,
  badges: [
    {type: "truth_detective", level: 3, earned_date: "datetime"},
    {type: "crisis_helper", level: 1, earned_date: "datetime"},
    {type: "expert_medical", verified: true, earned_date: "datetime"}
  ],
  expertise_areas: ["medical", "safety", "local_mumbai"],
  submissions_count: 25,
  accurate_submissions: 22,
  expert_verifications_given: 8,
  community_trust_rating: 0.85,
  location: "mumbai",
  profile_image: "url",
  created_at: "datetime"
}
```

## Error Handling

### Frontend Error Boundaries
- Graceful fallbacks for component failures
- Beautiful error pages with illustrations
- Retry mechanisms with animated buttons
- Toast notifications for API errors

### Backend Error Responses
```javascript
{
  error: {
    code: "AI_ANALYSIS_FAILED",
    message: "Unable to analyze content at this time",
    details: "OpenAI API rate limit exceeded",
    retry_after: 30
  }
}
```

### AI Analysis Fallbacks
- Timeout handling (30-second max)
- Fallback to simpler analysis methods if Jan AI is unavailable
- Clear "Unable to verify" messaging
- Graceful degradation of features
- Local AI server health monitoring

## Testing Strategy

### Frontend Testing (4 hours allocated)
- **Component Testing**: Jest + React Testing Library for UI components
- **Visual Testing**: Storybook for component showcase
- **User Flow Testing**: Cypress for critical paths (submit → analyze → display)
- **Mobile Testing**: Manual testing on multiple device sizes

### Backend Testing (2 hours allocated)
- **API Testing**: Supertest for endpoint validation
- **AI Integration Testing**: Mock Jan AI responses for consistent testing
- **Database Testing**: Test data models and relationships
- **Performance Testing**: Basic load testing for concurrent users

### Integration Testing (2 hours allocated)
- **End-to-End**: Full user journey from submission to AI response
- **Real-time Features**: WebSocket connection and live updates
- **Error Scenarios**: Network failures and API timeouts
- **Cross-browser**: Chrome, Firefox, Safari compatibility

## UI/UX Design System

### Color Palette
```css
:root {
  --primary: #6366f1; /* Indigo */
  --secondary: #8b5cf6; /* Purple */
  --accent: #06b6d4; /* Cyan */
  --success: #10b981; /* Emerald */
  --warning: #f59e0b; /* Amber */
  --danger: #ef4444; /* Red */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### Typography Scale
- **Headings**: Inter font family with custom font weights
- **Body**: System font stack for optimal performance
- **Code**: JetBrains Mono for technical content
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px, 48px

### Animation Principles
- **Duration**: 150ms for micro-interactions, 300ms for transitions
- **Easing**: Custom cubic-bezier curves for natural motion
- **Stagger**: 50ms delays for list animations
- **Performance**: GPU-accelerated transforms only

### Glassmorphism Components
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## Implementation Timeline (24 Hours)

### Phase 1: Backend Setup (6 hours)
1. **Supabase Configuration** (1 hour)
   - Database schema creation
   - Authentication setup
   - Real-time subscriptions

2. **Express API Development** (3 hours)
   - Core CRUD endpoints
   - AI integration middleware
   - WebSocket setup

3. **OpenAI Integration** (2 hours)
   - Content analysis functions
   - Chat response generation
   - Error handling and fallbacks

### Phase 2: Frontend Core (8 hours)
1. **Component Architecture** (2 hours)
   - Design system setup
   - Base components creation
   - Context providers

2. **Feed Implementation** (3 hours)
   - Post cards with AI analysis
   - Infinite scroll
   - Real-time updates

3. **Submission Flow** (3 hours)
   - Form with validation
   - AI analysis integration
   - Success/error states

### Phase 3: Premium UI (6 hours)
1. **Glassmorphism Design** (2 hours)
   - Custom CSS components
   - Consistent styling
   - Responsive design

2. **Animations & Interactions** (2 hours)
   - Framer Motion setup
   - Micro-interactions
   - Loading states

3. **AI Chat Interface** (2 hours)
   - Floating chat widget
   - Conversation UI
   - Context integration

### Phase 4: Polish & Testing (4 hours)
1. **Bug Fixes & Optimization** (2 hours)
   - Performance optimization
   - Cross-browser testing
   - Mobile responsiveness

2. **Demo Preparation** (2 hours)
   - Sample data creation
   - Demo script preparation
   - Final UI polish

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Memoization for expensive calculations
- Virtual scrolling for large lists

### Backend Optimization
- Database indexing for common queries
- API response caching
- Connection pooling
- Rate limiting for AI API calls

### Real-time Features
- WebSocket connection management
- Efficient data synchronization
- Optimistic UI updates
- Graceful offline handling

## Security Considerations

### Input Validation
- Content sanitization for XSS prevention
- File upload restrictions
- Rate limiting for submissions
- SQL injection prevention

### Authentication & Authorization
- JWT token management
- Role-based access control
- Secure API endpoints
- CORS configuration

### Jan AI Integration Details

#### Local AI Server Setup
- **Endpoint**: `http://localhost:1337/v1/chat/completions`
- **Model**: Use fastest available model (e.g., Llama 3.2 or Phi-3)
- **Connection**: HTTP client with timeout handling
- **Fallback**: Graceful degradation if Jan AI server is down

#### AI Prompts for Misinformation Detection
```javascript
const ANALYSIS_PROMPT = `
Analyze the following content for potential misinformation:
Content: "{content}"

Respond with JSON:
{
  "is_misinformation": boolean,
  "confidence": 0.0-1.0,
  "explanation": "brief explanation",
  "red_flags": ["list of concerning elements"],
  "sources_needed": ["what sources would verify this"]
}
`;
```

#### Chat Agent Prompts
```javascript
const CHAT_PROMPT = `
You are FactSaura AI, a helpful fact-checking assistant. 
Context: User is asking about this post: "{post_content}"
User question: "{user_question}"

Provide a helpful, accurate response about the information's authenticity.
Be concise but informative. If uncertain, say so clearly.
`;
```

### AI Safety
- Content filtering for harmful submissions
- Confidence threshold enforcement
- Human oversight for critical decisions
- Audit logging for AI decisions
- Local AI model performance monitoring