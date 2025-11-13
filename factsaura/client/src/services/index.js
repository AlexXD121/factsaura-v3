/**
 * Services Index
 * Central export point for all service modules
 */

export { default as api } from './api.js';
export * from './api.js';

// Re-export commonly used functions for convenience
export { 
  postsAPI, 
  aiAPI, 
  familyTreeAPI, 
  healthAPI,
  testAPIConnectivity,
  createLoadingState,
  withLoadingState,
  APIError 
} from './api.js';