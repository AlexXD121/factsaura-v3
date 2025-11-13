/**
 * Test for real-time polling functionality in usePosts hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { usePosts } from './usePosts';
import { postsAPI } from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
  postsAPI: {
    getPosts: jest.fn()
  }
}));

// Mock console.log to capture polling logs
const originalConsoleLog = console.log;
let consoleLogs = [];

beforeEach(() => {
  consoleLogs = [];
  console.log = (...args) => {
    consoleLogs.push(args.join(' '));
    originalConsoleLog(...args);
  };
  
  // Reset API mock
  postsAPI.getPosts.mockClear();
});

afterEach(() => {
  console.log = originalConsoleLog;
  jest.clearAllTimers();
});

describe('usePosts Real-time Polling', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should start polling when on first page', async () => {
    // Mock successful API response
    const mockResponse = {
      success: true,
      data: {
        posts: [
          { id: '1', title: 'Test Post 1', content: 'Content 1' },
          { id: '2', title: 'Test Post 2', content: 'Content 2' }
        ],
        pagination: {
          current_page: 1,
          has_more: false,
          total: 2
        }
      }
    };

    postsAPI.getPosts.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePosts());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify initial fetch happened
    expect(postsAPI.getPosts).toHaveBeenCalledTimes(1);
    expect(result.current.posts).toHaveLength(2);

    // Fast-forward 30 seconds to trigger polling
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Wait for polling request
    await waitFor(() => {
      expect(postsAPI.getPosts).toHaveBeenCalledTimes(2);
    });

    // Check that polling log was created
    expect(consoleLogs.some(log => log.includes('🔄 Polling for new posts...'))).toBe(true);
  });

  test('should not poll when not on first page', async () => {
    const mockResponse = {
      success: true,
      data: {
        posts: [{ id: '1', title: 'Test Post', content: 'Content' }],
        pagination: {
          current_page: 2, // Not first page
          has_more: false,
          total: 1
        }
      }
    };

    postsAPI.getPosts.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePosts());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Should not have made additional requests (only initial fetch)
    expect(postsAPI.getPosts).toHaveBeenCalledTimes(1);
  });

  test('should not poll when there is an error', async () => {
    // Mock API error
    postsAPI.getPosts.mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => usePosts());

    // Wait for initial fetch to fail
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Should not poll when there's an error
    // Note: Initial fetch + retry attempts, but no polling
    expect(postsAPI.getPosts).toHaveBeenCalledTimes(4); // Initial + 3 retries
  });

  test('should stop polling when component unmounts', async () => {
    const mockResponse = {
      success: true,
      data: {
        posts: [{ id: '1', title: 'Test Post', content: 'Content' }],
        pagination: {
          current_page: 1,
          has_more: false,
          total: 1
        }
      }
    };

    postsAPI.getPosts.mockResolvedValue(mockResponse);

    const { result, unmount } = renderHook(() => usePosts());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Unmount the component
    unmount();

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Should not have made additional requests after unmount
    expect(postsAPI.getPosts).toHaveBeenCalledTimes(1);
  });

  test('should handle polling errors gracefully', async () => {
    // Mock successful initial fetch
    const mockSuccessResponse = {
      success: true,
      data: {
        posts: [{ id: '1', title: 'Test Post', content: 'Content' }],
        pagination: {
          current_page: 1,
          has_more: false,
          total: 1
        }
      }
    };

    postsAPI.getPosts.mockResolvedValueOnce(mockSuccessResponse);

    const { result } = renderHook(() => usePosts());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock polling request to fail
    postsAPI.getPosts.mockRejectedValueOnce(new Error('Polling failed'));

    // Fast-forward 30 seconds to trigger polling
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Wait for polling request
    await waitFor(() => {
      expect(postsAPI.getPosts).toHaveBeenCalledTimes(2);
    });

    // Should handle error gracefully and not crash
    expect(result.current.posts).toHaveLength(1); // Original posts should remain
  });

  test('should log polling start and stop messages', async () => {
    const mockResponse = {
      success: true,
      data: {
        posts: [],
        pagination: {
          current_page: 1,
          has_more: false,
          total: 0
        }
      }
    };

    postsAPI.getPosts.mockResolvedValue(mockResponse);

    const { unmount } = renderHook(() => usePosts());

    // Wait for initial setup
    await waitFor(() => {
      expect(consoleLogs.some(log => log.includes('✅ Real-time polling started'))).toBe(true);
    });

    // Unmount to trigger cleanup
    unmount();

    // Check for stop message
    expect(consoleLogs.some(log => log.includes('🛑 Real-time polling stopped'))).toBe(true);
  });
});