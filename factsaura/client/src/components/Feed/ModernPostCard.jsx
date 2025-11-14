import { motion } from 'framer-motion';
import { useState } from 'react';
import ModernCard from '../UI/ModernCard';
import ConfidenceMeter from '../UI/ConfidenceMeter';

const ModernPostCard = ({ 
  post, 
  onVote, 
  onAskAI, 
  onShare, 
  onReport,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userVote, setUserVote] = useState(null);

  const handleVote = async (voteType) => {
    try {
      setUserVote(voteType === userVote ? null : voteType);
      await onVote(post.id, voteType);
    } catch (error) {
      setUserVote(null);
      console.error('Vote failed:', error);
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-amber-600 bg-amber-100';
      case 'medium': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyIcon = (level) => {
    switch (level) {
      case 'critical': return '🔴';
      case 'high': return '🟡';
      case 'medium': return '🔵';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const shouldTruncate = post.content && post.content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.substring(0, 300) + '...'
    : post.content;

  return (
    <ModernCard 
      className={`p-6 ${className}`}
      variant={post.is_misinformation ? 'danger' : 'default'}
      glow={post.confidence >= 0.8}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {/* AI Generated Badge */}
            {post.ai_generated && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                <span>🤖</span>
                <span>AI Alert</span>
              </motion.div>
            )}
            
            {/* Urgency Level */}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(post.urgency_level)}`}>
              <span>{getUrgencyIcon(post.urgency_level)}</span>
              <span className="capitalize">{post.urgency_level || 'Unknown'}</span>
            </div>
            
            {/* Timestamp */}
            <span className="text-xs text-gray-500">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
            {post.title}
          </h3>
        </div>
        
        {/* Confidence Meter */}
        <div className="ml-4">
          <ConfidenceMeter 
            confidence={post.confidence || 0}
            size="md"
            showLabel={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>
        
        {shouldTruncate && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </motion.button>
        )}
      </div>

      {/* AI Analysis Summary */}
      {post.reasoning_steps && post.reasoning_steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-700">🧠 AI Analysis</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <ul className="space-y-1">
            {post.reasoning_steps.slice(0, 3).map((step, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          {post.reasoning_steps.length > 3 && (
            <button 
              onClick={() => onAskAI(post)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View full analysis →
            </button>
          )}
        </motion.div>
      )}

      {/* Source Information */}
      {post.source_platform && (
        <div className="mb-4 flex items-center space-x-2 text-sm text-gray-500">
          <span>📍</span>
          <span>Source: {post.source_platform}</span>
          {post.source_url && (
            <a 
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              View original
            </a>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {/* Voting */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('upvote')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              userVote === 'upvote' 
                ? 'bg-green-100 text-green-700' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span className="text-lg">👍</span>
            <span className="text-sm font-medium">{post.upvotes || 0}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleVote('downvote')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
              userVote === 'downvote' 
                ? 'bg-red-100 text-red-700' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span className="text-lg">👎</span>
            <span className="text-sm font-medium">{post.downvotes || 0}</span>
          </motion.button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAskAI(post)}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <span>🤖</span>
            <span className="hidden sm:inline">Ask AI</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onShare(post)}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span>📤</span>
            <span className="hidden sm:inline">Share</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReport(post)}
            className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span>🚩</span>
            <span className="hidden sm:inline">Report</span>
          </motion.button>
        </div>
      </div>

      {/* Confidence Details */}
      {post.confidence >= 0.7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <span className="text-red-600">⚠️</span>
            <span className="text-sm font-medium text-red-800">
              High confidence misinformation detected
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            This content has been flagged by our AI system. Please verify information before sharing.
          </p>
        </motion.div>
      )}
    </ModernCard>
  );
};

export default ModernPostCard;