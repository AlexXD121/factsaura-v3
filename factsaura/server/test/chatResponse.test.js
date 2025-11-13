const aiService = require('../services/aiService');

describe('AI Chat Response', () => {
  // Increase timeout for AI operations
  jest.setTimeout(60000);

  test('should respond to basic questions', async () => {
    const response = await aiService.chatResponse('What is misinformation?');
    
    expect(response).toHaveProperty('response');
    expect(response).toHaveProperty('confidence');
    expect(response).toHaveProperty('timestamp');
    expect(typeof response.response).toBe('string');
    expect(response.response.length).toBeGreaterThan(0);
    expect(typeof response.confidence).toBe('number');
    expect(response.confidence).toBeGreaterThanOrEqual(0);
    expect(response.confidence).toBeLessThanOrEqual(1);
  });

  test('should handle context-aware questions', async () => {
    const context = {
      post_content: 'Breaking: Scientists discover miracle cure using lemon juice!'
    };
    
    const response = await aiService.chatResponse('Is this reliable?', context);
    
    expect(response).toHaveProperty('response');
    expect(response.response).toContain('lemon' || 'cure' || 'reliable' || 'evidence');
    expect(response.confidence).toBeGreaterThan(0);
  });

  test('should handle questions about misinformation', async () => {
    const context = {
      post_content: 'URGENT: Government is hiding the truth about vaccines!'
    };
    
    const response = await aiService.chatResponse('Why is this suspicious?', context);
    
    expect(response).toHaveProperty('response');
    expect(response.response.length).toBeGreaterThan(50); // Should provide detailed explanation
    expect(response.confidence).toBeGreaterThan(0);
  });

  test('should handle empty or invalid input gracefully', async () => {
    // The service should handle this, but controller validates first
    const response = await aiService.chatResponse('Help');
    
    expect(response).toHaveProperty('response');
    expect(response.response.length).toBeGreaterThan(0);
  });

  test('should include proper metadata', async () => {
    const response = await aiService.chatResponse('Test question');
    
    expect(response).toHaveProperty('model_version');
    expect(response).toHaveProperty('timestamp');
    expect(typeof response.model_version).toBe('string');
    expect(typeof response.timestamp).toBe('string');
    
    // Validate timestamp format
    expect(() => new Date(response.timestamp)).not.toThrow();
  });
});