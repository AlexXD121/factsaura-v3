/**
 * FactSaura API Service Layer
 * Handles all communication between frontend and backend
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Generic API request handler with error handling and timeout
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Debug logging
  console.log('🔗 API Request:', { url, endpoint, API_BASE_URL });
  
  // Default options
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_TIMEOUT,
  };

  // Merge options
  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);
    
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle HTTP errors
    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `HTTP ${response.status}`;
      const errorCode = data?.error?.code || 'HTTP_ERROR';
      throw new APIError(errorMessage, response.status, errorCode);
    }

    return data;
  } catch (error) {
    // Handle network errors, timeouts, and aborts
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT');
    }
    
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError(
      error.message || 'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}

/**
 * Posts API Functions
 */
export const postsAPI = {
  /**
   * Get paginated posts feed
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Posts per page (default: 20)
   * @param {string} params.sort - Sort order ('recent', 'confidence', 'urgency')
   * @returns {Promise<Object>} Posts data with pagination info
   */
  async getPosts(params = {}) {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      sort_by: params.sort_by || 'created_at',
      sort_order: params.sort_order || 'desc',
      ...params
    });

    return apiRequest(`/posts?${queryParams}`);
  },

  /**
   * Create a new post with AI analysis
   * @param {Object} postData - Post data
   * @param {string} postData.title - Post title
   * @param {string} postData.content - Post content
   * @param {string} postData.url - Optional URL to analyze
   * @param {string} postData.type - Post type ('user_submitted', 'ai_detected')
   * @returns {Promise<Object>} Created post with AI analysis
   */
  async createPost(postData) {
    return apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  /**
   * Get a specific post by ID
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Post data
   */
  async getPostById(postId) {
    return apiRequest(`/posts/${postId}`);
  },

  /**
   * Vote on a post (upvote/downvote)
   * @param {string} postId - Post ID
   * @param {string} voteType - 'upvote' or 'downvote'
   * @returns {Promise<Object>} Updated vote counts
   */
  async voteOnPost(postId, voteType) {
    return apiRequest(`/posts/${postId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({ voteType }),
    });
  },

  /**
   * Get comments for a post
   * @param {string} postId - Post ID
   * @returns {Promise<Array>} Comments array
   */
  async getPostComments(postId) {
    return apiRequest(`/posts/${postId}/comments`);
  },
};

/**
 * AI Analysis API Functions
 */
export const aiAPI = {
  /**
   * Analyze content for misinformation
   * @param {Object} content - Content to analyze
   * @param {string} content.text - Text content
   * @param {string} content.url - Optional URL
   * @returns {Promise<Object>} AI analysis results
   */
  async analyzeContent(content) {
    return apiRequest('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  /**
   * Chat with AI about specific content
   * @param {Object} chatData - Chat data
   * @param {string} chatData.message - User message
   * @param {string} chatData.postId - Optional post ID for context
   * @returns {Promise<Object>} AI chat response
   */
  async chatWithAI(chatData) {
    return apiRequest('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  },

  /**
   * Get detailed confidence breakdown for a post
   * @param {string} postId - Post ID
   * @returns {Promise<Object>} Confidence breakdown
   */
  async getConfidenceBreakdown(postId) {
    return apiRequest(`/ai/confidence/${postId}`);
  },
};

/**
 * Family Tree API Functions
 */
export const familyTreeAPI = {
  /**
   * Get family tree data
   * @param {string} familyId - Family tree ID
   * @returns {Promise<Object>} Family tree data
   */
  async getFamilyTree(familyId) {
    return apiRequest(`/family-tree/${familyId}`);
  },

  /**
   * Get family tree visualization data
   * @param {string} familyId - Family tree ID
   * @returns {Promise<Object>} Visualization data
   */
  async getFamilyTreeVisualization(familyId) {
    return apiRequest(`/family-tree/${familyId}/visualization`);
  },

  /**
   * Get global genealogy statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getGenealogyStatistics() {
    return apiRequest('/family-tree/statistics');
  },

  /**
   * Create new family tree
   * @param {Object} treeData - Family tree data
   * @returns {Promise<Object>} Created family tree
   */
  async createFamilyTree(treeData) {
    return apiRequest('/family-tree', {
      method: 'POST',
      body: JSON.stringify(treeData),
    });
  },

  /**
   * Add mutation to existing family tree
   * @param {string} familyId - Family tree ID
   * @param {Object} mutationData - Mutation data
   * @returns {Promise<Object>} Updated family tree
   */
  async addMutation(familyId, mutationData) {
    return apiRequest(`/family-tree/${familyId}/mutations`, {
      method: 'POST',
      body: JSON.stringify(mutationData),
    });
  },

  /**
   * Search family trees by content similarity
   * @param {Object} searchData - Search parameters
   * @returns {Promise<Array>} Search results
   */
  async searchFamilyTrees(searchData) {
    return apiRequest('/family-tree/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  },
};

/**
 * Demo API Functions
 */
export const demoAPI = {
  /**
   * Create demo family tree
   * @returns {Promise<Object>} Demo family tree data
   */
  async createDemoFamilyTree() {
    return apiRequest('/demo/family-tree', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};

/**
 * Health Check API
 */
export const healthAPI = {
  /**
   * Check backend server health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    // Use base URL without /api for health check
    const url = API_BASE_URL.replace('/api', '/health');
    return fetch(url).then(res => res.json());
  },
};

/**
 * API Connection Test
 * Tests connectivity with the backend server
 */
export async function testAPIConnectivity() {
  try {
    console.log('🔍 Testing API connectivity...');
    
    // Test health endpoint
    const healthResponse = await healthAPI.checkHealth();
    console.log('✅ Health check passed:', healthResponse);
    
    // Test posts endpoint (should work even if empty)
    const postsResponse = await postsAPI.getPosts({ limit: 1 });
    console.log('✅ Posts API accessible:', postsResponse);
    
    // Test family tree statistics
    try {
      const statsResponse = await familyTreeAPI.getGenealogyStatistics();
      console.log('✅ Family tree API accessible:', statsResponse);
    } catch (error) {
      console.log('⚠️ Family tree API not ready (expected):', error.message);
    }
    
    console.log('🎉 API connectivity test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ API connectivity test failed:', error);
    throw error;
  }
}

/**
 * Utility function to handle loading states
 */
export function createLoadingState() {
  return {
    loading: false,
    error: null,
    data: null,
  };
}

/**
 * Utility function to handle API calls with loading states
 */
export async function withLoadingState(apiCall, loadingState) {
  loadingState.loading = true;
  loadingState.error = null;
  
  try {
    const data = await apiCall();
    loadingState.data = data;
    return data;
  } catch (error) {
    loadingState.error = error;
    throw error;
  } finally {
    loadingState.loading = false;
  }
}

// Export the APIError class for use in components
export { APIError };

// Default export with all APIs
export default {
  posts: postsAPI,
  ai: aiAPI,
  familyTree: familyTreeAPI,
  demo: demoAPI,
  health: healthAPI,
  testConnectivity: testAPIConnectivity,
  createLoadingState,
  withLoadingState,
  APIError,
};