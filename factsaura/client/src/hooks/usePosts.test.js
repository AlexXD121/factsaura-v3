/**
 * Test file for usePosts hook error handling and retry functionality
 * Run with: npm test usePosts.test.js
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePosts } from './usePosts';
import { postsAPI, APIError } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  postsAPI: {
    getPosts: vi.fn(),
  },
  APIError: class APIError extends Error {
    constructor(message, status, code) {
      super(message);
      this.name = 'APIError';
      this.status = status;
      this.code = code;
    }
  }
}));

describe('usePosts Error Handling & Retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle network errors with retry', async () => {
    // Mock network error
    postsAPI.getPosts.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    const { result } = renderHook(() => usePosts());

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error.type).toBe('NETWORK_ERROR');
    expect(result.current.error.message).toContain('Network connection failed');
  });

  it('should retry on network errors', async () => {
    let callCount = 0;
    postsAPI.getPosts.mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.reject(new TypeError('Failed to fetch'));
      }
      return Promise.resolve({
        success: true,
        data: {
          posts: [{ id: 1, title: 'Test Post' }],
          pagination: { has_more: false, current_page: 1 },
          filters: {}
        }
      });
    });

    const { result } = renderHook(() => usePosts());

    // Wait for retries to complete
    act(() => {
      vi.advanceTimersByTime(10000); // Advance timers to trigger retries
    });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(1);
    });

    expect(callCount).toBe(3); // Initial + 2 retries
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors without retry for 4xx status codes', async () => {
    postsAPI.getPosts.mockRejectedValueOnce(new APIError('Not Found', 404, 'NOT_FOUND'));
    
    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error.canRetry).toBe(false);
    expect(result.current.error.type).toBe('NOT_FOUND');
  });

  it('should handle pagination errors separately', async () => {
    // First call succeeds
    postsAPI.getPosts.mockResolvedValueOnce({
      success: true,
      data: {
        posts: [{ id: 1, title: 'Post 1' }],
        pagination: { has_more: true, current_page: 1, next_page: 2 },
        filters: {}
      }
    });

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.posts.length).toBe(1);
    });

    // Second call (pagination) fails
    postsAPI.getPosts.mockRejectedValueOnce(new APIError('Server Error', 500, 'SERVER_ERROR'));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.paginationError).toBeTruthy();
    });

    // Original posts should still be there
    expect(result.current.posts.length).toBe(1);
    expect(result.current.paginationError.type).toBe('SERVER_ERROR');
  });

  it('should provide manual retry functionality', async () => {
    postsAPI.getPosts.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Mock successful retry
    postsAPI.getPosts.mockResolvedValueOnce({
      success: true,
      data: {
        posts: [{ id: 1, title: 'Test Post' }],
        pagination: { has_more: false, current_page: 1 },
        filters: {}
      }
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(1);
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset retry state on successful refresh', async () => {
    postsAPI.getPosts.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    
    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Mock successful refresh
    postsAPI.getPosts.mockResolvedValueOnce({
      success: true,
      data: {
        posts: [{ id: 1, title: 'Test Post' }],
        pagination: { has_more: false, current_page: 1 },
        filters: {}
      }
    });

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.posts.length).toBe(1);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it('should handle timeout errors', async () => {
    postsAPI.getPosts.mockRejectedValueOnce(new APIError('Request timeout', 408, 'TIMEOUT'));
    
    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error.type).toBe('TIMEOUT');
    expect(result.current.error.canRetry).toBe(true);
  });

  it('should provide correct retry state information', async () => {
    let callCount = 0;
    postsAPI.getPosts.mockImplementation(() => {
      callCount++;
      return Promise.reject(new TypeError('Failed to fetch'));
    });

    const { result } = renderHook(() => usePosts());

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Check retry state during retries
    act(() => {
      vi.advanceTimersByTime(1000); // First retry
    });

    await waitFor(() => {
      expect(result.current.isRetrying).toBe(true);
    });

    expect(result.current.error.retryCount).toBeGreaterThan(0);
    expect(result.current.error.maxRetries).toBe(3);
  });
});