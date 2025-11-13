import { motion } from 'framer-motion';
import { usePosts } from '../hooks/usePosts';
import { GlassCard, AnimatedButton, LoadingSkeleton } from '../UI';
import PostCard from './PostCard';

function FeedFixed() {
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

  // DEBUG: Add console logs to track data flow
  console.log("🔍 Feed Debug - Current State:", {
    posts: posts,
    postsLength: posts?.length,
    loading,
    error,
    isEmpty,
    refreshing
  });

  // DEBUG: Log posts data structure
  if (posts && posts.length > 0) {
    console.log("📦 Posts Data Sample:", posts[0]);
  }

  // Handle voting on posts
  const handleVote = async (postId, voteType) => {
    try {
      console.log(`🗳️ Voting ${voteType} on post ${postId}`);
      // TODO: Implement voting API call in Task 3.1
    } catch (error) {
      console.error('❌ Error voting on post:', error);
    }
  };

  // Handle AI chat
  const handleAskAI = (post) => {
    console.log('🤖 Opening AI chat for post:', post.id);
    // TODO: Implement AI chat in Task 4.1
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
      console.log('📋 Post copied to clipboard');
    }
  };

  // Handle reporting
  const handleReport = (post) => {
    console.log('🚩 Reporting post:', post.id);
    // TODO: Implement reporting functionality
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { [filterType]: value };
    console.log('🔍 Filter changed:', newFilters);
    updateFilters(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (sortBy, sortOrder = 'desc') => {
    console.log('📊 Sort changed:', { sortBy, sortOrder });
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

  // DEBUG: Force visible background for testing
  const debugStyle = {
    backgroundColor: '#f0f0f0', // Light gray background for visibility
    minHeight: '200px',
    border: '2px solid #ff0000', // Red border for debugging
    padding: '20px'
  };

  return (
    <div style={debugStyle}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
        style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px' }}
      >
        {/* DEBUG HEADER */}
        <div style={{ 
          backgroundColor: '#e0e0e0', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #ccc',
          fontFamily: 'monospace'
        }}>
          <h3 style={{ color: '#333', margin: '0 0 10px 0' }}>🔍 DEBUG INFO</h3>
          <div style={{ color: '#666', fontSize: '12px' }}>
            <div>Posts Count: {posts?.length || 0}</div>
            <div>Loading: {loading ? 'YES' : 'NO'}</div>
            <div>Error: {error ? error.message || 'YES' : 'NO'}</div>
            <div>Empty: {isEmpty ? 'YES' : 'NO'}</div>
            <div>Refreshing: {refreshing ? 'YES' : 'NO'}</div>
          </div>
        </div>

        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="glass-card content-box p-8" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4" style={{ color: '#333' }}>
                Community Feed
              </h1>
              <p className="text-secondary text-lg" style={{ color: '#666' }}>
                AI-powered misinformation detection with transparent analysis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div variants={itemVariants}>
          <div className="glass-card p-6" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-primary text-sm font-medium" style={{ color: '#333' }}>Filter by:</span>
                
                {/* Crisis Level Filter */}
                <select 
                  onChange={(e) => handleFilterChange('urgency_level', e.target.value || undefined)}
                  className="glass-input text-sm py-2 px-3"
                  style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
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
                  style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">All Posts</option>
                  <option value="true">⚠️ Misinformation</option>
                  <option value="false">✅ Verified</option>
                </select>
              </div>

              {/* Sort Controls */}
              <div className="flex items-center gap-3">
                <span className="text-primary text-sm font-medium" style={{ color: '#333' }}>Sort by:</span>
                <select 
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(':');
                    handleSortChange(sortBy, sortOrder);
                  }}
                  className="glass-input text-sm py-2 px-3"
                  style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="created_at:desc">Latest First</option>
                  <option value="created_at:asc">Oldest First</option>
                  <option value="upvotes:desc">Most Upvoted</option>
                  <option value="confidence_score:desc">Highest Confidence</option>
                  <option value="urgency_level:desc">Most Critical</option>
                </select>

                {/* Refresh Button */}
                <button 
                  onClick={refresh}
                  disabled={refreshing}
                  style={{
                    backgroundColor: refreshing ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: refreshing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {refreshing ? '🔄' : '↻'} Refresh
                </button>
                
                {/* Real-time indicator */}
                <div className="flex items-center text-xs text-secondary" style={{ color: '#666' }}>
                  {refreshing ? (
                    <>
                      <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2" style={{ backgroundColor: '#28a745' }}></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse" style={{ backgroundColor: '#007bff' }}></div>
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
            <div 
              className="glass-card p-8 alert-critical"
              style={{ 
                backgroundColor: '#f8d7da', 
                border: '1px solid #f5c6cb', 
                borderRadius: '8px',
                color: '#721c24'
              }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  {isRetrying ? 'Retrying Connection...' : 'Error Loading Posts'}
                </h3>
                <p className="text-secondary mb-4">
                  {typeof error === 'string' ? error : error.message}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {canRetry && !isRetrying && (
                    <button 
                      onClick={retry}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Retry Now
                    </button>
                  )}
                  <button 
                    onClick={refresh} 
                    disabled={isRetrying}
                    style={{
                      backgroundColor: isRetrying ? '#ccc' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '4px',
                      cursor: isRetrying ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isRetrying ? 'Retrying...' : '↻ Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && !refreshing && (
          <motion.div variants={itemVariants}>
            <div 
              className="space-y-6"
              style={{ 
                backgroundColor: '#fff3cd', 
                padding: '20px', 
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
              }}
            >
              <div style={{ textAlign: 'center', color: '#856404' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <h3>Loading Posts...</h3>
                <p>Please wait while we fetch the latest posts.</p>
              </div>
              <LoadingSkeleton variant="post" count={3} />
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {isEmpty && !loading && !error && (
          <motion.div variants={itemVariants}>
            <div 
              className="glass-card p-8"
              style={{ 
                backgroundColor: '#d1ecf1', 
                border: '1px solid #bee5eb', 
                borderRadius: '8px',
                textAlign: 'center'
              }}
            >
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-primary mb-2" style={{ color: '#0c5460' }}>No Posts Found</h3>
              <p className="text-secondary mb-4" style={{ color: '#0c5460' }}>
                No posts match your current filters. Try adjusting your search criteria.
              </p>
              <button 
                onClick={() => updateFilters({})}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Posts List - FIXED RENDERING */}
        {posts && posts.length > 0 && (
          <div className="space-y-6">
            {/* Show loading overlay when refreshing */}
            {refreshing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-4 mb-6"
                style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '8px' }}
              >
                <div className="flex items-center justify-center space-x-3 text-primary" style={{ color: '#155724' }}>
                  <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium">Updating posts...</span>
                </div>
              </motion.div>
            )}
            
            {/* DEBUG: Show posts count */}
            <div style={{ 
              backgroundColor: '#e2e3e5', 
              padding: '10px', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#383d41'
            }}>
              📊 Rendering {posts.length} posts
            </div>
            
            {posts.map((post, index) => {
              console.log(`🎨 Rendering post ${index + 1}:`, post);
              
              return (
                <motion.div 
                  key={post.id} 
                  variants={itemVariants}
                  custom={index}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    border: '2px solid #28a745', 
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}
                >
                  {/* Simple post display for debugging */}
                  <div>
                    <h3 style={{ color: '#333', marginBottom: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                      {post.title || 'No Title'}
                    </h3>
                    <p style={{ color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                      {post.content || 'No Content'}
                    </p>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      <span>Type: {post.type || 'unknown'}</span> • 
                      <span>Created: {new Date(post.created_at).toLocaleString()}</span> • 
                      <span>AI Confidence: {Math.round((post.ai_analysis?.confidence_score || 0) * 100)}%</span>
                    </div>
                    
                    {/* Action buttons */}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleVote(post.id, 'upvote')}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        👍 {post.engagement?.upvotes || 0}
                      </button>
                      <button 
                        onClick={() => handleVote(post.id, 'downvote')}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        👎 {post.engagement?.downvotes || 0}
                      </button>
                      <button 
                        onClick={() => handleAskAI(post)}
                        style={{
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🤖 Ask AI
                      </button>
                      <button 
                        onClick={() => handleShare(post)}
                        style={{
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        📤 Share
                      </button>
                    </div>
                  </div>
                  
                  {/* Original PostCard component (commented out for debugging) */}
                  {/* 
                  <PostCard
                    post={post}
                    onVote={handleVote}
                    onAskAI={handleAskAI}
                    onShare={handleShare}
                    onReport={handleReport}
                  />
                  */}
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
                  <div 
                    className="glass-card alert-warning p-4"
                    style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px' }}
                  >
                    <div className="text-center">
                      <div className="text-yellow-600 text-2xl mb-2">⚠️</div>
                      <p className="text-secondary text-sm mb-3" style={{ color: '#856404' }}>
                        Failed to load more posts: {paginationError.message}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={loadMore}
                          style={{
                            backgroundColor: '#ffc107',
                            color: '#212529',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          🔄 Try Again
                        </button>
                        <button 
                          onClick={refresh}
                          style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          ↻ Refresh All
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Load More Button */}
                <button 
                  onClick={loadMore}
                  disabled={refreshing}
                  style={{
                    backgroundColor: refreshing ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Load More Posts
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Footer */}
        {posts.length > 0 && (
          <motion.div variants={itemVariants}>
            <div 
              className="glass-card p-4"
              style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}
            >
              <div className="text-center text-secondary text-sm" style={{ color: '#6c757d' }}>
                Showing {posts.length} posts
                {hasMore && ' • More available'}
                {lastUpdated && (
                  <div className="mt-2 text-xs space-y-1">
                    <div>Last updated: {lastUpdated.toLocaleTimeString()}</div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" style={{ backgroundColor: '#007bff' }}></div>
                      <span>Auto-refresh every 30 seconds</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default FeedFixed;