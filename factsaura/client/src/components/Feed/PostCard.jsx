import { motion } from 'framer-motion';
import { useState } from 'react';
import { GlassCard, AnimatedButton, ConfidenceMeter } from '../UI';
import { AIAnalysisDisplay, AIBadge, CrisisUrgencyIndicator } from '../AI';

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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ 
        duration: 0.4,
        ease: "easeOut",
        hover: { duration: 0.2 }
      }}
      className={`${className} click-ripple`}
    >
      <div className={`glass-card ${alertLevel.bg} p-6 hover-lift`}>
        {/* Post Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`text-2xl sm:text-3xl ${alertLevel.color} flex-shrink-0`}>
              {alertLevel.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-secondary text-sm font-medium truncate">
                  {post.type === 'ai_detected' ? '🤖 AI Detected' : '👤 User Submitted'}
                </span>
                <AIBadge 
                  type={post.type === 'ai_detected' ? 'generated' : 'analyzed'} 
                  size="xs" 
                  animated={true}
                />
              </div>
              <span className="text-secondary text-sm">
                {formatTimestamp(post.created_at)}
              </span>
            </div>
          </div>
          
          {/* Status Badges - Stack on mobile */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
            {post.is_verified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-green-200 whitespace-nowrap">
                ✓ Verified
              </span>
            )}
            {aiAnalysis.is_misinformation && (
              <AIBadge type="flagged" size="sm" animated={true} />
            )}
            <CrisisUrgencyIndicator 
              urgencyLevel={crisisContext.urgency_level || 'medium'}
              harmCategory={crisisContext.harm_category || 'general'}
              size="sm"
              animated={true}
            />
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
          <AIAnalysisDisplay analysis={aiAnalysis} className="mb-6" />
        )}

        {/* Actions - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Primary Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <AnimatedButton 
              variant="success" 
              size="sm"
              onClick={() => handleVote('upvote')}
              className="glass-button-outlined hover:bg-green-600 hover:text-white min-h-[44px] px-4 touch-manipulation"
            >
              <span className="mr-1 text-lg">👍</span>
              <span className="hidden xs:inline">{engagement.upvotes || 0}</span>
              <span className="xs:hidden">{engagement.upvotes || 0}</span>
            </AnimatedButton>
            <AnimatedButton 
              variant="danger" 
              size="sm"
              onClick={() => handleVote('downvote')}
              className="glass-button-outlined hover:bg-red-600 hover:text-white min-h-[44px] px-4 touch-manipulation"
            >
              <span className="mr-1 text-lg">👎</span>
              <span className="hidden xs:inline">{engagement.downvotes || 0}</span>
              <span className="xs:hidden">{engagement.downvotes || 0}</span>
            </AnimatedButton>
            <AnimatedButton 
              variant="ghost" 
              size="sm"
              onClick={handleAskAI}
              className="glass-button-outlined hover:bg-blue-600 hover:text-white min-h-[44px] px-4 touch-manipulation"
            >
              <span className="text-lg mr-1">🤖</span>
              <span className="hidden sm:inline">Ask AI</span>
              <span className="sm:hidden">AI</span>
            </AnimatedButton>
          </div>
          
          {/* Secondary Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-2">
            <AnimatedButton 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              className="glass-button-outlined min-h-[44px] px-4 touch-manipulation flex-1 sm:flex-none"
            >
              <span className="text-lg mr-1">📤</span>
              <span className="hidden sm:inline">Share</span>
            </AnimatedButton>
            <AnimatedButton 
              variant="warning" 
              size="sm"
              onClick={handleReport}
              className="glass-button-outlined hover:bg-amber-600 hover:text-white min-h-[44px] px-4 touch-manipulation flex-1 sm:flex-none"
            >
              <span className="text-lg mr-1">🚩</span>
              <span className="hidden sm:inline">Report</span>
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