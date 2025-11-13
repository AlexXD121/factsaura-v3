// AI Controller - handles AI-related operations
const aiService = require('../services/aiService');

const analyzeContent = async (req, res) => {
  try {
    const { content, options = {} } = req.body;
    
    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Content is required and must be a non-empty string'
        }
      });
    }

    // Limit content length for safety
    if (content.length > 10000) {
      return res.status(400).json({
        error: {
          code: 'CONTENT_TOO_LONG',
          message: 'Content must be less than 10,000 characters'
        }
      });
    }

    // Get AI analysis with enhanced error handling
    const analysisResult = await aiService.analyzeContentBasic(content, options);
    
    // Return response with appropriate status code
    const statusCode = analysisResult.error ? 206 : 200; // 206 Partial Content for fallback responses
    
    res.status(statusCode).json({
      success: !analysisResult.error,
      data: analysisResult,
      fallback: analysisResult.fallback || false
    });
    
  } catch (error) {
    console.error('Content analysis failed:', error);
    
    // Determine appropriate error code and status
    let statusCode = 500;
    let errorCode = 'AI_ANALYSIS_FAILED';
    
    if (error.message.includes('Content is required')) {
      statusCode = 400;
      errorCode = 'INVALID_INPUT';
    } else if (error.message.includes('too long')) {
      statusCode = 400;
      errorCode = 'CONTENT_TOO_LONG';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      statusCode = 503;
      errorCode = 'AI_SERVICE_UNAVAILABLE';
    }
    
    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: 'Unable to analyze content at this time',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        retry_after: statusCode === 503 ? 30 : undefined
      }
    });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Get AI chat response (validation is handled in the service)
    const chatResponse = await aiService.chatResponse(message, context);
    
    // Determine status code based on response
    const statusCode = chatResponse.error ? 
      (chatResponse.error_code === 'INVALID_INPUT' || chatResponse.error_code === 'MESSAGE_TOO_LONG' ? 400 : 206) : 
      200;
    
    // Return response with appropriate status
    res.status(statusCode).json({
      success: !chatResponse.error,
      data: {
        response: chatResponse.response,
        confidence: chatResponse.confidence,
        model_version: chatResponse.model_version,
        timestamp: chatResponse.timestamp,
        processing_time_ms: chatResponse.processing_time_ms,
        context_provided: !!context,
        fallback: chatResponse.fallback || false
      },
      error: chatResponse.error ? {
        code: chatResponse.error_code,
        message: chatResponse.error_message
      } : undefined
    });
    
  } catch (error) {
    console.error('Chat with AI failed:', error);
    
    // Determine appropriate error response
    let statusCode = 500;
    let errorCode = 'AI_CHAT_FAILED';
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      statusCode = 503;
      errorCode = 'AI_SERVICE_UNAVAILABLE';
    }
    
    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: 'Unable to process chat request at this time',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        retry_after: statusCode === 503 ? 30 : undefined
      }
    });
  }
};

const getConfidenceBreakdown = async (req, res) => {
  try {
    const { analysis } = req.body;
    
    // Validate input
    if (!analysis) {
      return res.status(400).json({
        error: {
          code: 'INVALID_INPUT',
          message: 'Analysis data is required'
        }
      });
    }

    // Get confidence breakdown with error handling
    const breakdown = aiService.getConfidenceBreakdown(analysis);
    
    res.json({
      success: true,
      data: breakdown
    });
    
  } catch (error) {
    console.error('Confidence breakdown failed:', error);
    
    res.status(500).json({
      error: {
        code: 'CONFIDENCE_BREAKDOWN_FAILED',
        message: 'Unable to generate confidence breakdown at this time',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

module.exports = {
  analyzeContent,
  chatWithAI,
  getConfidenceBreakdown
};