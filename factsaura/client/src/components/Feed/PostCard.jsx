import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassCard, AnimatedButton, ConfidenceMeter } from '../UI';

function PostCard({ post, onVote, onAskAI, onShare, onReport, className = '' }) {
  const [showReasoningSteps, setShowReasoningSteps] = useState(false);
  
  if (!post) return null;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Extract data from nested structures to match API response
  const aiAnalysis = post.ai_analysis || {};
  const crisisContext = post.crisis_context || {};
  const engagement = post.engagement || {};
  
  // Get alert level styling for Trust Pattern
  const getAlertLevelIcon = (level, isMisinformation) => {
    if (isMisinformation) {
      switch (level) {
        case 'critical': return { icon: '🚨', color: 'text-red-600', bg: 'alert-critical' };
        case 'high': return { icon: '⚠️', color: 'text-amber-600', bg: 'alert-warning' };
        default: return { icon: '⚠️', color: 'text-amber-600', bg: 'alert-warning' };
      }
    } else {
      switch (level) {
        case 'critical': return { icon: '🔴', color: 'text-red-600', bg: 'alert-critical' };
        case 'high': return { icon: '🟡', color: 'text-amber-600', bg: 'alert-warning' };
        case 'medium': return { icon: '🔵', color: 'text-blue-600', bg: 'alert-info' };
        case 'low': return { icon: '🟢', color: 'text-green-600', bg: 'alert-safe' };
        default: return { icon: '🔵', color: 'text-blue-600', bg: 'alert-info' };
      }
    }
  };

  const getAlertLevelBadge = (level, isMisinformation) => {
    if (isMisinformation) {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Handle vote action
  const handleVote = (voteType) => {
    if (onVote) {
      onVote(post.id, voteType);
    }
  };

  // Handle AI chat
  const handleAskAI = () => {
    if (onAskAI) {
      onAskAI(post);
    }
  };

  // Handle share
  const handleShare = () => {
    if (onShare) {
      onShare(post);
    }
  };

  // Handle report
  const handleReport = () => {
    if (onReport) {
      onReport(post);
    }
  };

  const alertLevel = getAlertLevelIcon(crisisContext.urgency_level, aiAnalysis.is_misinformation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <div className={`glass-card ${alertLevel.bg} p-6`}>
        {/* Post Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${alertLevel.color}`}>
              {alertLevel.icon}
            </div>
            <div>
              <span className="text-secondary text-sm font-medium">
                {post.type === 'ai_detected' ? '🤖 AI Detected' : '👤 User Submitted'}
              </span>
              <span className="text-secondary text-sm ml-2">
                • {formatTimestamp(post.created_at)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {post.is_verified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                ✓ Verified
              </span>
            )}
            {aiAnalysis.is_misinformation && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium border border-red-200">
                ⚠️ MISINFORMATION
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAlertLevelBadge(crisisContext.urgency_level, aiAnalysis.is_misinformation)}`}>
              {crisisContext.urgency_level?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-primary mb-4 leading-tight">
            {post.title}
          </h3>
          <p className="text-primary text-lg leading-relaxed">
            {post.content}
          </p>
          
          {/* Source URL if available */}
          {post.source_url && (
            <div className="mt-3">
              <a 
                href={post.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-info hover:underline text-sm"
              >
                Source: {new URL(post.source_url).hostname}
              </a>
            </div>
          )}
        </div>

        {/* Crisis Context */}
        {(crisisContext.location_relevance || crisisContext.harm_category || (crisisContext.crisis_keywords && crisisContext.crisis_keywords.length > 0)) && (
          <div className="mb-6 p-4 content-box rounded-xl">
            <h4 className="text-primary font-bold mb-3 text-sm flex items-center">
              <span className="mr-2">🚨</span>
              Crisis Context
            </h4>
            <div className="flex flex-wrap gap-2">
              {crisisContext.location_relevance && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                  📍 {crisisContext.location_relevance}
                </span>
              )}
              {crisisContext.harm_category && crisisContext.harm_category !== 'general' && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
                  ⚠️ {crisisContext.harm_category}
                </span>
              )}
              {crisisContext.crisis_keywords && crisisContext.crisis_keywords.map((keyword, index) => (
                <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium border border-red-200">
                  🔍 {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis - Enhanced Display */}
        {(aiAnalysis || aiAnalysis.confidence_score !== undefined) && (
          <div className="mb-6 p-4 content-box rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <ConfidenceMeter confidence={aiAnalysis.confidence_score || 0} size="md" />
              </div>
              <div className="flex-1">
                <h4 className="text-primary font-bold mb-3 flex items-center text-sm">
                  <span className="mr-2">🤖</span>
                  AI Analysis
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                    {Math.round((aiAnalysis.confidence_score || 0) * 100)}% Confidence
                  </span>
                </h4>
                
                <p className="text-primary text-sm leading-relaxed mb-3">
                  {aiAnalysis.explanation || 'AI analysis completed successfully.'}
                </p>
                
                {/* Reasoning Steps */}
                {aiAnalysis.reasoning_steps && aiAnalysis.reasoning_steps.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowReasoningSteps(!showReasoningSteps)}
                      className="text-info hover:text-blue-700 text-xs font-medium flex items-center"
                    >
                      <span className="mr-1">{showReasoningSteps ? '▼' : '▶'}</span>
                      View AI Reasoning Steps ({aiAnalysis.reasoning_steps.length})
                    </button>
                    
                    {showReasoningSteps && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-2"
                      >
                        {aiAnalysis.reasoning_steps.map((step, index) => (
                          <div key={index} className="flex items-start bg-blue-50 p-2 rounded border border-blue-200">
                            <span className="mr-2 text-info font-bold text-xs min-w-[20px]">
                              {index + 1}.
                            </span>
                            <span className="text-primary text-xs leading-relaxed">{step}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
                
                {/* Uncertainty Flags */}
                {aiAnalysis.uncertainty_flags && aiAnalysis.uncertainty_flags.length > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                    <h5 className="text-warning font-semibold text-xs mb-1">⚠️ Uncertainty Indicators:</h5>
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysis.uncertainty_flags.map((flag, index) => (
                        <span key={index} className="text-amber-700 text-xs">
                          • {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <AnimatedButton 
              variant="success" 
              size="sm"
              onClick={() => handleVote('upvote')}
              className="glass-button-outlined hover:bg-green-600 hover:text-white"
            >
              <span className="mr-1">👍</span>
              {engagement.upvotes || 0}
            </AnimatedButton>
            <AnimatedButton 
              variant="danger" 
              size="sm"
              onClick={() => handleVote('downvote')}
              className="glass-button-outlined hover:bg-red-600 hover:text-white"
            >
              <span className="mr-1">👎</span>
              {engagement.downvotes || 0}
            </AnimatedButton>
            <AnimatedButton 
              variant="ghost" 
              size="sm"
              onClick={handleAskAI}
              className="glass-button-outlined hover:bg-blue-600 hover:text-white"
            >
              🤖 Ask AI
            </AnimatedButton>
          </div>
          
          <div className="flex space-x-2">
            <AnimatedButton 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              className="glass-button-outlined"
            >
              📤 Share
            </AnimatedButton>
            <AnimatedButton 
              variant="warning" 
              size="sm"
              onClick={handleReport}
              className="glass-button-outlined hover:bg-amber-600 hover:text-white"
            >
              🚩 Report
            </AnimatedButton>
          </div>
        </div>

        {/* Community Trust Score */}
        {engagement.community_trust_score !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary font-medium">Community Trust</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 via-amber-400 to-green-400 transition-all duration-300"
                    style={{ width: `${(engagement.community_trust_score || 0) * 100}%` }}
                  />
                </div>
                <span className="text-primary font-bold">
                  {Math.round((engagement.community_trust_score || 0) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default PostCard;