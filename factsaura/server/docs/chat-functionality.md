# AI Chat Response Functionality

## Overview
The AI chat response functionality allows users to ask questions about posts and receive intelligent, context-aware responses from the FactSaura AI system.

## Implementation Details

### Service Layer (`services/aiService.js`)
- **Method**: `chatResponse(message, context)`
- **Purpose**: Generate intelligent responses to user questions using Jan AI
- **Features**:
  - Context-aware responses based on post content
  - Crisis and misinformation detection capabilities
  - Confidence scoring for responses
  - Error handling and fallback responses

### API Layer (`controllers/aiController.js`)
- **Endpoint**: `POST /api/ai/chat`
- **Input Validation**:
  - Message required and must be non-empty string
  - Message length limited to 1000 characters
  - Optional context object with post content
- **Error Handling**:
  - Invalid input validation
  - AI service failures
  - Timeout handling

### Request Format
```json
{
  "message": "Is this information reliable?",
  "context": {
    "post_content": "Optional post content for context"
  }
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "response": "AI generated response text",
    "confidence": 0.8,
    "model_version": "Meta-Llama-3_1-8B-Instruct-IQ4_XS",
    "timestamp": "2025-11-10T00:20:57.123Z",
    "context_provided": true
  }
}
```

## Key Features

### 1. Context-Aware Responses
- When provided with post content, the AI considers the specific information being questioned
- Responses are tailored to the content and can identify misinformation patterns
- Crisis-related content receives appropriate safety-focused responses

### 2. Misinformation Detection
- AI can explain why certain claims are suspicious
- Provides reasoning about red flags and verification methods
- Offers guidance on how to verify information

### 3. Crisis Context Awareness
- Recognizes emergency and safety-related questions
- Provides appropriate guidance for crisis situations
- Prioritizes safety information in responses

### 4. Error Handling
- Graceful fallback when AI service is unavailable
- Clear error messages for invalid inputs
- Timeout protection for long-running requests

## Testing

### Service Level Tests
- Basic chat without context
- Context-aware responses
- Misinformation analysis
- Follow-up questions
- Edge cases and error handling

### API Level Tests
- HTTP endpoint functionality
- Input validation
- Error response handling
- Context processing
- Response format validation

## Usage Examples

### Basic Question
```javascript
POST /api/ai/chat
{
  "message": "What is misinformation?"
}
```

### Context-Aware Question
```javascript
POST /api/ai/chat
{
  "message": "Is this claim reliable?",
  "context": {
    "post_content": "Breaking: Scientists discover miracle cure using lemon juice!"
  }
}
```

### Crisis-Related Question
```javascript
POST /api/ai/chat
{
  "message": "How can I stay safe during a flood?",
  "context": {
    "post_content": "Mumbai flood warning: Authorities advise immediate evacuation"
  }
}
```

## Integration with Frontend

The chat functionality is designed to be integrated with:
- Floating chat widgets on posts
- Context-aware help systems
- Real-time Q&A interfaces
- Educational misinformation detection tools

## Performance Considerations

- Responses typically complete within 5-15 seconds
- First request may take longer due to model loading
- Timeout set to 30 seconds for safety
- Fallback responses provided for failures

## Security Features

- Input sanitization and validation
- Message length limits
- Rate limiting ready (to be implemented)
- No sensitive information exposure in responses