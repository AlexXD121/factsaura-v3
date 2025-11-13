import { motion } from 'framer-motion';
import { usePosts } from '../../hooks/usePosts';
import { GlassCard, AnimatedButton, LoadingSkeleton } from '../UI';
import PostCard from './PostCard';

function Feed() {
  const {
    posts,
    loading,
    error,
    paginationError,
    refreshing,
    hasMore,
    isEmpty,
    lastUpdated,
    retryCount,
    isRetrying,
    canRetry,
    loadMore,
    refresh,
    retry,
    updateFilters,
    sortPosts
  } = usePosts();

  // 🔍 DEBUG: Add comprehensive logging
  console.log("🔍 Feed Component Debug:", {
    posts: posts,
    postsLength: posts?.length,
    postsType: typeof posts,
    postsIsArray: Array.isArray(posts),
    loading,
    error,
    isEmpty,
    refreshing,
    hasMore
  });

  // 🔍 DEBUG: Log first post structure if available
  if (posts && posts.length > 0) {
    console.log("📦 First Post Data:", posts[0]);
    console.log("📊 Posts Array:", posts);
  }

  // Handle voting on posts
  const handleVote = async (postId, voteType) => {
    try {
      // TODO: Implement voting API call in Task 3.1
      console.log(`Voting ${voteType} on post ${postId}`);
      // For now, just log the action
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  // Handle AI chat
  const handleAskAI = (post) => {
    // TODO: Implement AI chat in Task 4.1
    console.log('Opening AI chat for post:', post.id);
  };

  // Handle sharing
  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${post.title}\n\n${post.content}\n\n${window.location.href}`);
      // TODO: Show toast notification
      console.log('Post copied to clipboard');
    }
  };

  // Handle reporting
  const handleReport = (post) => {
    // TODO: Implement reporting functionality
    console.log('Reporting post:', post.id);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { [filterType]: value };
    updateFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (sortBy, sortOrder = 'desc') => {
    sortPosts(sortBy, sortOrder);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 🔍 DEBUG SECTION - Remove this after fixing */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        border: '2px solid #007bff', 
        borderRadius: '8px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        <h3 style={{ color: '#007bff', margin: '0 0 8px 0' }}>🔍 FEED DEBUG INFO</h3>
        <div style={{ color: '#333' }}>
          <div>Posts: {posts ? `Array(${posts.length})` : 'null/undefined'}</div>
          <div>Loading: {loading ? 'YES' : 'NO'}</div>
          <div>Error: {error ? (error.message || 'YES') : 'NO'}</div>
          <div>Empty: {isEmpty ? 'YES' : 'NO'}</div>
          <div>Refreshing: {refreshing ? 'YES' : 'NO'}</div>
          <div>Has More: {hasMore ? 'YES' : 'NO'}</div>
          {posts && posts.length > 0 && (
            <div>Sample Post ID: {posts[0]?.id}</div>
          )}
        </div>
      </div>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="glass-card content-box p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">Community Feed</h1>
            <p className="text-secondary text-lg">
              AI-powered misinformation detection with transparent analysis
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-primary text-sm font-medium">Filter by:</span>
              
              {/* Crisis Level Filter */}
              <select 
                onChange={(e) => handleFilterChange('urgency_level', e.target.value || undefined)}
                className="glass-input text-sm py-2 px-3"
              >
                <option value="">All Levels</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟡 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">🟢 Low</option>
              </select>

              {/* Misinformation Filter */}
              <select 
                onChange={(e) => handleFilterChange('is_misinformation', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="glass-input text-sm py-2 px-3"
              >
                <option value="">All Posts</option>
                <option value="true">⚠️ Misinformation</option>
                <option value="false">✅ Verified</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-3">
              <span className="text-primary text-sm font-medium">Sort by:</span>
              <select 
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(':');
                  handleSortChange(sortBy, sortOrder);
                }}
                className="glass-input text-sm py-2 px-3"
              >
                <option value="created_at:desc">Latest First</option>
                <option value="created_at:asc">Oldest First</option>
                <option value="upvotes:desc">Most Upvoted</option>
                <option value="confidence_score:desc">Highest Confidence</option>
                <option value="urgency_level:desc">Most Critical</option>
              </select>

              {/* Refresh Button */}
              <AnimatedButton 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={refreshing}
                className="glass-button-outlined"
              >
                {refreshing ? '🔄' : '↻'} Refresh
              </AnimatedButton>
              
              {/* Real-time indicator */}
              <div className="flex items-center text-xs text-secondary">
                {refreshing ? (
                  <>
                    <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    Live (30s)
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div variants={itemVariants}>
          <div className={`glass-card p-8 ${error.type === 'NETWORK_ERROR' ? 'alert-warning' : 'alert-critical'}`}>
            <div className="text-center">
              {/* Error Icon */}
              <div className="text-6xl mb-4">
                {error.type === 'NETWORK_ERROR' ? '📡' : 
                 error.type === 'TIMEOUT' ? '⏱️' : 
                 isRetrying ? '🔄' : '⚠️'}
              </div>
              
              {/* Error Title */}
              <h3 className="text-xl font-bold text-primary mb-2">
                {isRetrying ? 'Retrying Connection...' :
                 error.type === 'NETWORK_ERROR' ? 'Connection Problem' :
                 error.type === 'TIMEOUT' ? 'Request Timeout' :
                 'Error Loading Posts'}
              </h3>
              
              {/* Error Message */}
              <p className="text-secondary mb-4">
                {typeof error === 'string' ? error : error.message}
              </p>
              
              {/* Retry Progress */}
              {isRetrying && (
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-secondary">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Attempt {error.retryCount} of {error.maxRetries}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(error.retryCount / error.maxRetries) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {canRetry && !isRetrying && (
                  <AnimatedButton 
                    variant="primary" 
                    onClick={retry} 
                    className="glass-button"
                  >
                    🔄 Retry Now
                  </AnimatedButton>
                )}
                
                <AnimatedButton 
                  variant={canRetry ? "outline" : "primary"} 
                  onClick={refresh} 
                  disabled={isRetrying}
                  className={canRetry ? "glass-button-outlined" : "glass-button"}
                >
                  {isRetrying ? 'Retrying...' : '↻ Refresh'}
                </AnimatedButton>
              </div>
              
              {/* Error Details (for debugging) */}
              {error.type && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-secondary cursor-pointer hover:text-primary">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-600">
                    <div>Error Type: {error.type}</div>
                    <div>Retry Count: {retryCount}/{error.maxRetries || 3}</div>
                    <div>Timestamp: {new Date().toLocaleTimeString()}</div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && !refreshing && (
        <motion.div variants={itemVariants}>
          <div className="space-y-6">
            <LoadingSkeleton variant="post" count={3} />
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {isEmpty && !loading && !error && (
        <motion.div variants={itemVariants}>
          <div className="glass-card p-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-primary mb-2">No Posts Found</h3>
              <p className="text-secondary mb-4">
                No posts match your current filters. Try adjusting your search criteria.
              </p>
              <AnimatedButton variant="primary" onClick={() => updateFilters({})} className="glass-button">
                Clear Filters
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      )}

      {/* Posts List */}
      {posts && posts.length > 0 && (
        <div className="space-y-6" style={{ backgroundColor: '#e8f5e8', padding: '16px', borderRadius: '8px', border: '2px solid #28a745' }}>
          {/* 🔍 DEBUG: Posts rendering indicator */}
          <div style={{ 
            backgroundColor: '#d4edda', 
            border: '1px solid #c3e6cb', 
            borderRadius: '4px',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#155724'
          }}>
            📊 Rendering {posts.length} posts in the list
          </div>

          {/* Show loading overlay when refreshing */}
          {refreshing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-4 mb-6"
              style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}
            >
              <div className="flex items-center justify-center space-x-3 text-primary" style={{ color: '#856404' }}>
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                <span className="text-sm font-medium">Updating posts...</span>
              </div>
            </motion.div>
          )}
          
          {posts.map((post, index) => {
            console.log(`🎨 Rendering post ${index + 1}/${posts.length}:`, post);
            
            return (
              <motion.div 
                key={post.id} 
                variants={itemVariants}
                custom={index}
                style={{ 
                  backgroundColor: '#ffffff', 
                  border: '2px solid #007bff', 
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                {/* 🔍 DEBUG: Simple post preview */}
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '8px', 
                  marginBottom: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#6c757d'
                }}>
                  Post #{index + 1}: {post.id} | {post.title?.substring(0, 30)}...
                </div>

                <PostCard
                  post={post}
                  onVote={handleVote}
                  onAskAI={handleAskAI}
                  onShare={handleShare}
                  onReport={handleReport}
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
        <motion.div variants={itemVariants} className="text-center">
          {refreshing ? (
            <div className="space-y-6">
              <LoadingSkeleton variant="post" count={2} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pagination Error */}
              {paginationError && (
                <div className="glass-card alert-warning p-4">
                  <div className="text-center">
                    <div className="text-yellow-600 text-2xl mb-2">⚠️</div>
                    <p className="text-secondary text-sm mb-3">
                      Failed to load more posts: {paginationError.message}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <AnimatedButton 
                        variant="outline" 
                        size="sm"
                        onClick={loadMore}
                        className="glass-button-outlined"
                      >
                        🔄 Try Again
                      </AnimatedButton>
                      <AnimatedButton 
                        variant="outline" 
                        size="sm"
                        onClick={refresh}
                        className="glass-button-outlined"
                      >
                        ↻ Refresh All
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Load More Button */}
              <AnimatedButton 
                variant="primary" 
                size="lg"
                onClick={loadMore}
                disabled={refreshing}
                className="glass-button"
              >
                Load More Posts
              </AnimatedButton>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Footer */}
      {posts.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="glass-card p-4">
            <div className="text-center text-secondary text-sm">
              Showing {posts.length} posts
              {hasMore && ' • More available'}
              {lastUpdated && (
                <div className="mt-2 text-xs space-y-1">
                  <div>Last updated: {lastUpdated.toLocaleTimeString()}</div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Auto-refresh every 30 seconds</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Feed;