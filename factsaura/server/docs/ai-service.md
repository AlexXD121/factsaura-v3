# AI Service Documentation

## Overview
The AI Service module provides integration with Jan AI (local AI server) for content analysis and chat functionality. It includes robust error handling and fallback mechanisms.

## Configuration
The service is configured via environment variables:
- `JAN_AI_HOST`: Jan AI server host (default: 127.0.0.1)
- `JAN_AI_PORT`: Jan AI server port (default: 1337)
- `JAN_AI_API_KEY`: API key for authentication (default: factsaura-key)
- `JAN_AI_MODEL`: Model to use (default: Meta-Llama-3_1-8B-Instruct-IQ4_XS)
- `AI_ANALYSIS_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `AI_CONFIDENCE_THRESHOLD`: Confidence threshold for analysis (default: 0.7)
- `CRISIS_KEYWORDS`: Comma-separated list of crisis keywords

## Methods

### `testConnection()`
Tests connectivity to Jan AI server.
- **Returns**: `Promise<boolean>` - Connection status

### `checkModelAvailability()`
Checks if the configured model is loaded and available.
- **Returns**: `Promise<Object>` - Model availability status with details

### `analyzeContentBasic(content, options)`
Enhanced content analysis with step-by-step reasoning for misinformation detection.
- **Parameters**:
  - `content` (string): Content to analyze (required, non-empty)
  - `options` (object): Analysis options (optional)
- **Returns**: `Promise<Object>` - Enhanced analysis result with reasoning steps, quality score, and detailed crisis context
- **Features**: Input validation, enhanced prompts, step-by-step reasoning, quality scoring

### `analyzeContent(content, options)` (Legacy)
Basic content analysis for misinformation using Jan AI.
- **Parameters**:
  - `content` (string): Content to analyze
  - `options` (object): Analysis options
- **Returns**: `Promise<Object>` - Analysis result with confidence score, explanation, and crisis context

### `chatResponse(message, context)`
Generates chat response using Jan AI.
- **Parameters**:
  - `message` (string): User message
  - `context` (object): Optional context (post content, etc.)
- **Returns**: `Promise<Object>` - Chat response with confidence

### `getConfidenceBreakdown(analysis)`
Generates detailed confidence breakdown from analysis result.
- **Parameters**:
  - `analysis` (object): Analysis result
- **Returns**: `Object` - Detailed confidence breakdown

## Response Format

### Enhanced Analysis Response (analyzeContentBasic)
```json
{
  "is_misinformation": boolean,
  "confidence_score": 0.0-1.0,
  "explanation": "detailed explanation of analysis conclusion",
  "reasoning_steps": [
    "Step 1: specific findings about claims and evidence",
    "Step 2: specific red flags or patterns identified",
    "Step 3: crisis context and urgency evaluation",
    "Step 4: harm assessment and confidence reasoning"
  ],
  "red_flags": ["specific concerning elements with explanations"],
  "sources_needed": ["specific types of sources for verification"],
  "crisis_context": {
    "urgency_level": "critical|high|medium|low",
    "harm_category": "health|safety|financial|general",
    "crisis_keywords_found": ["actual keywords detected"],
    "potential_harm": "specific description of potential consequences"
  },
  "uncertainty_flags": ["specific areas requiring expert review"],
  "analysis_quality": 0.0-1.0,
  "processing_time_ms": number,
  "model_version": "string",
  "analysis_timestamp": "ISO string",
  "analysis_type": "basic_content_analysis"
}
```

### Basic Analysis Response (analyzeContent - Legacy)
```json
{
  "is_misinformation": boolean,
  "confidence_score": 0.0-1.0,
  "explanation": "string",
  "red_flags": ["array of concerning elements"],
  "sources_needed": ["array of verification sources"],
  "crisis_context": {
    "urgency_level": "critical|high|medium|low",
    "harm_category": "health|safety|financial|general",
    "crisis_keywords_found": ["array of detected keywords"]
  },
  "uncertainty_flags": ["array of uncertainty indicators"],
  "processing_time_ms": number,
  "model_version": "string",
  "analysis_timestamp": "ISO string"
}
```

### Chat Response
```json
{
  "response": "string",
  "confidence": 0.0-1.0,
  "model_version": "string",
  "timestamp": "ISO string"
}
```

## Error Handling
- Automatic fallback when Jan AI is unavailable
- Timeout handling for long-running requests
- Graceful degradation with meaningful error messages
- Structured error responses for consistent handling

## Testing
- **Model Configuration**: `node test-model-config.js` (recommended first test)
- **Service Tests**: `npm test aiService.test.js`
- **Connection Test**: `node test-jan-ai-connection.js`
- **Basic Analysis**: `node test-basic-analysis.js`

## Jan AI Setup
1. Install and start Jan AI application
2. **REQUIRED**: Download and load the Meta-Llama-3_1-8B-Instruct-IQ4_XS model
   - Go to Hub in Jan AI
   - Search for "Meta-Llama-3_1-8B-Instruct-IQ4_XS"
   - Download and wait for completion (~4.6GB)
3. Configure API server settings:
   - Host: 127.0.0.1
   - Port: 1337
   - API Key: factsaura-key
4. Start the Local API Server in Jan AI settings
5. Test configuration using: `node test-model-config.js`

## Model Requirements
- **Required**: Meta-Llama-3_1-8B-Instruct-IQ4_XS
- **Size**: ~4.6GB (IQ4_XS quantization for efficiency)
- **Performance**: Optimized for fact-checking and analysis tasks
- **Note**: This is the only supported model for FactSaura. Other models may not provide consistent results.