import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Simple API function for this component
async function fetchPosts() {
  try {
    const response = await fetch('http://localhost:3001/api/posts?page=1&limit=10');
    const data = await response.json();
    console.log('📦 Fetched Data:', data);
    
    if (data.success && data.data && data.data.posts) {
      return data.data.posts;
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    throw error;
  }
}

function FeedFixed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts on component mount
  useEffect(() => {
    async function loadPosts() {
      try {
        console.log('🔄 Loading posts...');
        setLoading(true);
        setError(null);
        
        const fetchedPosts = await fetchPosts();
        console.log('✅ Posts loaded:', fetchedPosts);
        
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('❌ Failed to load posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // Debug logging
  console.log('🔍 FeedFixed Component State:', {
    posts,
    postsLength: posts?.length,
    loading,
    error
  });

  // Handle voting
  const handleVote = (postId, voteType) => {
    console.log(`🗳️ Vote ${voteType} on post ${postId}`);
    // TODO: Implement voting
  };

  // Handle AI chat
  const handleAskAI = (post) => {
    console.log('🤖 Ask AI about post:', post.id);
    // TODO: Implement AI chat
  };

  // Handle share
  const handleShare = (post) => {
    console.log('📤 Share post:', post.id);
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${post.title}\n\n${post.content}`);
      alert('Post copied to clipboard!');
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      console.log('🔄 Refreshing posts...');
      setLoading(true);
      setError(null);
      
      const fetchedPosts = await fetchPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Inline styles for guaranteed visibility
  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    minHeight: '100vh'
  };

  const debugStyle = {
    backgroundColor: '#f8f9fa',
    border: '2px solid #007bff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px',
    fontFamily: 'monospace',
    fontSize: '12px'
  };

  const headerStyle = {
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196f3',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    marginBottom: '20px'
  };

  const postStyle = {
    backgroundColor: '#ffffff',
    border: '2px solid #28a745',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const buttonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '4px',
    fontSize: '14px'
  };

  const errorStyle = {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '20px',
    color: '#721c24',
    textAlign: 'center',
    marginBottom: '20px'
  };

  const loadingStyle = {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '8px',
    padding: '20px',
    color: '#856404',
    textAlign: 'center',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      {/* Debug Section */}
      <div style={debugStyle}>
        <h3 style={{ color: '#007bff', margin: '0 0 8px 0' }}>🔍 FEED DEBUG INFO</h3>
        <div style={{ color: '#333' }}>
          <div>Posts: {posts ? `Array(${posts.length})` : 'null/undefined'}</div>
          <div>Loading: {loading ? 'YES' : 'NO'}</div>
          <div>Error: {error ? 'YES' : 'NO'}</div>
          <div>Posts Type: {typeof posts}</div>
          <div>Is Array: {Array.isArray(posts) ? 'YES' : 'NO'}</div>
          {posts && posts.length > 0 && (
            <div>First Post ID: {posts[0]?.id}</div>
          )}
        </div>
      </div>

      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ color: '#1976d2', margin: '0 0 16px 0', fontSize: '32px' }}>
          FactSaura Community Feed
        </h1>
        <p style={{ color: '#666', margin: '0', fontSize: '16px' }}>
          AI-powered misinformation detection with transparent analysis
        </p>
        <button 
          onClick={handleRefresh} 
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? '#ccc' : '#28a745',
            marginTop: '16px'
          }}
        >
          {loading ? '🔄 Loading...' : '↻ Refresh Posts'}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div style={errorStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Error Loading Posts</h3>
          <p style={{ margin: '0 0 16px 0' }}>{error}</p>
          <button onClick={handleRefresh} style={buttonStyle}>
            🔄 Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={loadingStyle}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Loading Posts...</h3>
          <p style={{ margin: '0' }}>Please wait while we fetch the latest posts.</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div style={{
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          color: '#0c5460'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ margin: '0 0 8px 0' }}>No Posts Found</h3>
          <p style={{ margin: '0 0 16px 0' }}>There are no posts available at the moment.</p>
          <button onClick={handleRefresh} style={buttonStyle}>
            🔄 Refresh
          </button>
        </div>
      )}

      {/* Posts List */}
      {!loading && !error && posts && posts.length > 0 && (
        <div>
          {/* Posts Count Indicator */}
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '20px',
            color: '#155724',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            📊 Displaying {posts.length} posts
          </div>

          {/* Render Posts */}
          {posts.map((post, index) => {
            console.log(`🎨 Rendering post ${index + 1}:`, post);
            
            return (
              <div key={post.id} style={postStyle}>
                {/* Post Header */}
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '8px 12px',
                  marginBottom: '12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#6c757d',
                  fontFamily: 'monospace'
                }}>
                  Post #{index + 1} | ID: {post.id} | Type: {post.type}
                </div>

                {/* Post Content */}
                <div>
                  <h3 style={{
                    color: '#333',
                    margin: '0 0 12px 0',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {post.title || 'No Title'}
                  </h3>
                  
                  <p style={{
                    color: '#666',
                    margin: '0 0 16px 0',
                    lineHeight: '1.6',
                    fontSize: '16px'
                  }}>
                    {post.content || 'No Content'}
                  </p>

                  {/* Post Metadata */}
                  <div style={{
                    fontSize: '14px',
                    color: '#999',
                    marginBottom: '16px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    <div>📅 Created: {new Date(post.created_at).toLocaleString()}</div>
                    <div>🤖 AI Confidence: {Math.round((post.ai_analysis?.confidence_score || 0) * 100)}%</div>
                    <div>🚨 Urgency: {post.crisis_context?.urgency_level || 'unknown'}</div>
                    <div>✅ Verified: {post.is_verified ? 'Yes' : 'No'}</div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => handleVote(post.id, 'upvote')}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#28a745'
                      }}
                    >
                      👍 {post.engagement?.upvotes || 0}
                    </button>
                    
                    <button 
                      onClick={() => handleVote(post.id, 'downvote')}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#dc3545'
                      }}
                    >
                      👎 {post.engagement?.downvotes || 0}
                    </button>
                    
                    <button 
                      onClick={() => handleAskAI(post)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#6f42c1'
                      }}
                    >
                      🤖 Ask AI
                    </button>
                    
                    <button 
                      onClick={() => handleShare(post)}
                      style={{
                        ...buttonStyle,
                        backgroundColor: '#17a2b8'
                      }}
                    >
                      📤 Share
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer Stats */}
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            color: '#6c757d',
            marginTop: '20px'
          }}>
            <div>📊 Total Posts: {posts.length}</div>
            <div>🕒 Last Updated: {new Date().toLocaleTimeString()}</div>
            <div>🔄 Auto-refresh: Every 30 seconds</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedFixed;