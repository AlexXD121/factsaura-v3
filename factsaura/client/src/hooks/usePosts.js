import { useState, useEffect, useCallback } from 'react';
import { postsAPI, APIError } from '../services/api';

// Custom hook for managing posts data and state
export function usePosts(initialParams = {}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [paginationError, setPaginationError] = useState(null);

  // Default parameters
  const defaultParams = {
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialParams
  };

  const [params, setParams] = useState(defaultParams);

  // Retry configuration
  const [retryCount, setRetryCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(1000);
  const maxRetries = 3;

  // Fetch posts function with retry logic
  const fetchPosts = useCallback(async (newParams = {}, append = false, isRetry = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // Only clear error if this is not a retry attempt
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }

      const requestParams = { ...params, ...newParams };
      console.log('🔄 Fetching posts with params:', requestParams);

      const response = await postsAPI.getPosts(requestParams);
      console.log('📦 Raw API Response:', response);
      
      if (response.success && response.data) {
        const { posts: newPosts, pagination: newPagination, filters: newFilters } = response.data;
        console.log('📊 Extracted Posts:', newPosts);
        console.log('📄 Pagination:', newPagination);
        console.log('🔍 Filters:', newFilters);
        
        if (append) {
          // Append new posts for pagination
          setPosts(prevPosts => {
            const updatedPosts = [...prevPosts, ...newPosts];
            console.log('📝 Appended posts, new total:', updatedPosts.length);
            return updatedPosts;
          });
        } else {
          // Replace posts for new fetch
          setPosts(newPosts);
          console.log('📝 Set posts array:', newPosts);
        }
        
        setPagination(newPagination);
        setFilters(newFilters);
        setParams(requestParams);
        setLastUpdated(new Date());
        
        // Reset retry state on success
        setRetryCount(0);
        setRetryDelay(1000);
        setError(null);
        setPaginationError(null);
        
        console.log(`✅ Successfully loaded ${newPosts.length} posts`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      
      let errorMessage = 'Failed to load posts';
      let errorType = 'UNKNOWN';
      let canRetry = true;
      
      if (err instanceof APIError) {
        errorMessage = err.message;
        errorType = err.code;
        
        // Don't retry for certain error types
        if (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404) {
          canRetry = false;
        }
      } else if (err.message) {
        errorMessage = err.message;
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorType = 'NETWORK_ERROR';
          errorMessage = 'Network connection failed. Please check your internet connection.';
        }
      }
      
      // Attempt retry if possible
      if (canRetry && retryCount < maxRetries && !append) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        
        console.log(`🔄 Retrying... Attempt ${newRetryCount}/${maxRetries}`);
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = retryDelay * Math.pow(2, newRetryCount - 1);
        setRetryDelay(delay);
        
        setTimeout(() => {
          fetchPosts(newParams, append, true);
        }, delay);
        
        // Set error with retry info
        setError({
          message: `${errorMessage} (Retrying... ${newRetryCount}/${maxRetries})`,
          type: errorType,
          retrying: true,
          retryCount: newRetryCount,
          maxRetries
        });
        
        return; // Don't proceed to final error handling
      }
      
      // Handle pagination vs main feed errors differently
      if (append) {
        // For pagination errors, set separate pagination error
        setPaginationError({
          message: errorMessage,
          type: errorType,
          timestamp: new Date()
        });
      } else {
        // For main feed errors, set main error state
        setError({
          message: errorMessage,
          type: errorType,
          retrying: false,
          retryCount,
          maxRetries,
          canRetry: canRetry && retryCount < maxRetries
        });
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params, retryCount, retryDelay]);

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!pagination?.has_more || refreshing) return;
    
    const nextPage = pagination.next_page;
    if (nextPage) {
      try {
        await fetchPosts({ page: nextPage }, true);
      } catch (err) {
        // For pagination errors, we don't want to clear existing posts
        // The error will be handled by fetchPosts but we can add specific handling here
        console.error('❌ Error loading more posts:', err);
      }
    }
  }, [pagination, refreshing, fetchPosts]);

  // Refresh posts (reload from beginning)
  const refresh = useCallback(async () => {
    setRetryCount(0);
    setRetryDelay(1000);
    await fetchPosts({ page: 1 }, false);
  }, [fetchPosts]);

  // Manual retry function
  const retry = useCallback(async () => {
    setRetryCount(0);
    setRetryDelay(1000);
    setError(null);
    await fetchPosts(params, false);
  }, [fetchPosts, params]);

  // Update filters and refetch
  const updateFilters = useCallback(async (newFilters) => {
    await fetchPosts({ ...newFilters, page: 1 }, false);
  }, [fetchPosts]);

  // Sort posts
  const sortPosts = useCallback(async (sortBy, sortOrder = 'desc') => {
    await fetchPosts({ sort_by: sortBy, sort_order: sortOrder, page: 1 }, false);
  }, [fetchPosts]);

  // Initial fetch on mount
  useEffect(() => {
    fetchPosts();
  }, []); // Empty dependency array for initial fetch only

  // Real-time updates with polling every 30 seconds
  useEffect(() => {
    // Don't start polling if we're not on the first page or if there's an error
    if (pagination?.current_page !== 1 || error) {
      return;
    }

    const pollInterval = setInterval(() => {
      // Only poll if we're on the first page and not currently loading
      if (pagination?.current_page === 1 && !loading && !refreshing && !error) {
        console.log('🔄 Polling for new posts...');
        // Use a more stable approach to avoid dependency issues
        fetchPosts({ page: 1 }, false);
      }
    }, 30000); // 30 seconds

    console.log('✅ Real-time polling started (30s interval)');

    // Cleanup interval on unmount or when conditions change
    return () => {
      clearInterval(pollInterval);
      console.log('🛑 Real-time polling stopped');
    };
  }, [pagination?.current_page, error]); // Removed loading, refreshing, and fetchPosts to avoid frequent recreations

  // Add a post to the current list (for real-time updates)
  const addPost = useCallback((newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  // Update a post in the current list
  const updatePost = useCallback((postId, updates) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  // Remove a post from the current list
  const removePost = useCallback((postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  return {
    // Data
    posts,
    pagination,
    filters,
    params,
    
    // State
    loading,
    error,
    paginationError,
    refreshing,
    lastUpdated,
    retryCount,
    
    // Actions
    fetchPosts,
    loadMore,
    refresh,
    retry,
    updateFilters,
    sortPosts,
    
    // Real-time updates
    addPost,
    updatePost,
    removePost,
    
    // Computed properties
    hasMore: pagination?.has_more || false,
    isEmpty: !loading && posts.length === 0,
    isFirstPage: pagination?.current_page === 1,
    isRetrying: error?.retrying || false,
    canRetry: error?.canRetry || false,
  };
}

// Hook for a single post
export function usePost(postId) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = useCallback(async () => {
    if (!postId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await postsAPI.getPostById(postId);
      
      if (response.success && response.data) {
        setPost(response.data.post);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Error fetching post:', err);
      
      let errorMessage = 'Failed to load post';
      if (err instanceof APIError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const updatePost = useCallback((updates) => {
    setPost(prevPost => prevPost ? { ...prevPost, ...updates } : null);
  }, []);

  return {
    post,
    loading,
    error,
    fetchPost,
    updatePost
  };
}