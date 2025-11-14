import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ConfidenceMeter } from '../UI';

function AIAnalysisDisplay({ analysis, className = '' }) {
  const [showReasoningSteps, setShowReasoningSteps] = useState(false);
  const [showUncertaintyFlags, setShowUncertaintyFlags] = useState(false);

  if (!analysis) return null;

  // Get confidence level styling
  const getConfidenceLevel = (score) => {
    if (score >= 0.8) return { level: 'high', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (score >= 0.6) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (score >= 0.4) return { level: 'low', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    return { level: 'very-low', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  // Get crisis urgency styling
  const getUrgencyLevelStyling = (level) => {
    switch (level) {
      case 'critical': return { icon: '🚨', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-300' };
      case 'high': return { icon: '⚠️', color: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-300' };
      case 'medium': return { icon: '🔵', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' };
      case 'low': return { icon: '🟢', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-300' };
      default: return { icon: '🔵', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' };
    }
  };

  const confidenceLevel = getConfidenceLevel(analysis.confidence_score || 0);
  const urgencyLevel = getUrgencyLevelStyling(analysis.crisis_context?.urgency_level);

  // Get crisis-aware styling for the entire component
  const getCrisisAwareStyle = () => {
    const urgency = analysis.crisis_context?.urgency_level;
    switch (urgency) {
      case 'critical':
        return 'border-red-300 bg-red-50/50 shadow-red-100';
      case 'high':
        return 'border-amber-300 bg-amber-50/50 shadow-amber-100';
      case 'medium':
        return 'border-blue-300 bg-blue-50/50 shadow-blue-100';
      case 'low':
        return 'border-green-300 bg-green-50/50 shadow-green-100';
      default:
        return 'border-gray-200 bg-white shadow-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`p-6 rounded-xl border-2 shadow-lg ${getCrisisAwareStyle()} ${className}`}
    >
      {/* AI Analysis Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="text-3xl"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🤖
          </motion.div>
          <div>
            <motion.h4 
              className="text-primary font-bold text-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              AI Analysis
            </motion.h4>
            
            {/* Processing Status */}
            <motion.div 
              className="flex items-center space-x-2 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {analysis.is_misinformation && (
                <motion.span 
                  className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-300 shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  🚨 MISINFORMATION DETECTED
                </motion.span>
              )}
              
              <motion.span 
                className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${confidenceLevel.bg} ${confidenceLevel.color} ${confidenceLevel.border}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                {Math.round((analysis.confidence_score || 0) * 100)}% Confidence
              </motion.span>
              
              {analysis.analysis_quality && (
                <motion.span 
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium border border-gray-300 shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                >
                  Quality: {Math.round(analysis.analysis_quality * 100)}%
                </motion.span>
              )}
              
              {analysis.processing_time_ms && (
                <motion.span 
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-300 shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                >
                  ⏱️ {analysis.processing_time_ms}ms
                </motion.span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Confidence Meter */}
        <motion.div 
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
        >
          <ConfidenceMeter 
            confidence={analysis.confidence_score || 0} 
            size="lg" 
            showLabel={true}
            animated={true}
            showVisualIndicators={true}
            variant="circular"
          />
        </motion.div>
      </div>

      {/* Main Analysis Explanation */}
      <motion.div 
        className="mb-6 p-4 bg-white/70 rounded-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.p 
          className="text-primary text-base leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {analysis.explanation || 'AI analysis completed successfully.'}
        </motion.p>
        
        {/* Analysis Source Indicator */}
        <motion.div 
          className="mt-3 flex items-center justify-between text-xs text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="flex items-center space-x-2">
            {analysis.model_version ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                🟢 Jan AI Active
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                🟡 Fallback Analysis
              </span>
            )}
            {analysis.analysis_timestamp && (
              <span>📅 {new Date(analysis.analysis_timestamp).toLocaleString()}</span>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Crisis Context Display */}
      {analysis.crisis_context && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className={`mb-6 p-5 rounded-xl border-2 shadow-lg ${urgencyLevel.bg} ${urgencyLevel.border}`}
        >
          <motion.div 
            className="flex items-center space-x-3 mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ 
                scale: analysis.crisis_context.urgency_level === 'critical' ? [1, 1.2, 1] : 1,
                rotate: analysis.crisis_context.urgency_level === 'critical' ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: 1, 
                repeat: analysis.crisis_context.urgency_level === 'critical' ? Infinity : 0,
                repeatDelay: 2 
              }}
            >
              {urgencyLevel.icon}
            </motion.span>
            <h5 className={`font-bold text-lg ${urgencyLevel.color}`}>Crisis Context</h5>
            <motion.span 
              className={`px-3 py-1 rounded-full text-xs font-bold ${urgencyLevel.bg} ${urgencyLevel.color} border-2 ${urgencyLevel.border} shadow-sm`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
            >
              {analysis.crisis_context.urgency_level?.toUpperCase() || 'MEDIUM'}
            </motion.span>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.crisis_context.harm_category && analysis.crisis_context.harm_category !== 'general' && (
              <div>
                <span className="text-xs font-medium text-secondary">Harm Category:</span>
                <div className="mt-1">
                  <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium border border-amber-200">
                    {analysis.crisis_context.harm_category}
                  </span>
                </div>
              </div>
            )}
            
            {analysis.crisis_context.potential_harm && (
              <div>
                <span className="text-xs font-medium text-secondary">Potential Harm:</span>
                <p className="text-sm text-primary mt-1">{analysis.crisis_context.potential_harm}</p>
              </div>
            )}
          </div>

          {analysis.crisis_context.crisis_keywords_found && analysis.crisis_context.crisis_keywords_found.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium text-secondary">Crisis Keywords Detected:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.crisis_context.crisis_keywords_found.map((keyword, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium border border-red-200">
                    🔍 {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Red Flags Display */}
      {analysis.red_flags && analysis.red_flags.length > 0 && (
        <motion.div 
          className="mb-6 p-5 bg-red-50 rounded-xl border-2 border-red-300 shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.h5 
            className="font-bold text-red-700 mb-3 flex items-center text-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <motion.span 
              className="mr-2 text-xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🚩
            </motion.span>
            Red Flags Detected ({analysis.red_flags.length})
          </motion.h5>
          <div className="space-y-3">
            {analysis.red_flags.map((flag, index) => (
              <motion.div 
                key={index} 
                className="flex items-start space-x-3 p-2 bg-red-100 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + (index * 0.1) }}
              >
                <span className="text-red-600 text-sm font-bold">⚠️</span>
                <span className="text-red-800 text-sm font-medium">{flag}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Reasoning Steps */}
      {analysis.reasoning_steps && analysis.reasoning_steps.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowReasoningSteps(!showReasoningSteps)}
            className="flex items-center space-x-2 text-info hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <motion.span
              animate={{ rotate: showReasoningSteps ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▶
            </motion.span>
            <span>View AI Reasoning Steps ({analysis.reasoning_steps.length})</span>
          </button>
          
          <AnimatePresence>
            {showReasoningSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-3"
              >
                {analysis.reasoning_steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-200"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="text-primary text-sm leading-relaxed">{step}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Uncertainty Flags */}
      {analysis.uncertainty_flags && analysis.uncertainty_flags.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowUncertaintyFlags(!showUncertaintyFlags)}
            className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
          >
            <motion.span
              animate={{ rotate: showUncertaintyFlags ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▶
            </motion.span>
            <span>⚠️ Uncertainty Indicators ({analysis.uncertainty_flags.length})</span>
          </button>
          
          <AnimatePresence>
            {showUncertaintyFlags && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <div className="space-y-2">
                  {analysis.uncertainty_flags.map((flag, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-amber-600 text-sm">⚠️</span>
                      <span className="text-amber-700 text-sm">{flag.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-amber-100 rounded text-xs text-amber-800">
                  <strong>Note:</strong> These areas may require expert human review for final verification.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Sources Needed */}
      {analysis.sources_needed && analysis.sources_needed.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h5 className="font-semibold text-gray-700 mb-2 text-sm">📚 Verification Sources Needed:</h5>
          <div className="flex flex-wrap gap-2">
            {analysis.sources_needed.map((source, index) => (
              <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {source.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <motion.div 
        className="flex items-center justify-between text-xs pt-4 border-t border-gray-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-center space-x-4">
          {analysis.processing_time_ms && (
            <motion.span 
              className="flex items-center space-x-1 text-secondary"
              whileHover={{ scale: 1.05 }}
            >
              <span>⏱️</span>
              <span>{analysis.processing_time_ms}ms</span>
            </motion.span>
          )}
          
          {analysis.model_version ? (
            <motion.span 
              className="flex items-center space-x-1 text-green-600 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              <span>🤖</span>
              <span>{analysis.model_version}</span>
            </motion.span>
          ) : (
            <motion.span 
              className="flex items-center space-x-1 text-amber-600 font-medium"
              whileHover={{ scale: 1.05 }}
            >
              <span>🔄</span>
              <span>Fallback Analysis</span>
            </motion.span>
          )}
          
          {analysis.analysis_timestamp && (
            <motion.span 
              className="flex items-center space-x-1 text-secondary"
              whileHover={{ scale: 1.05 }}
            >
              <span>📅</span>
              <span>{new Date(analysis.analysis_timestamp).toLocaleTimeString()}</span>
            </motion.span>
          )}
        </div>
        
        <motion.div 
          className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
            analysis.model_version 
              ? 'bg-blue-100 text-blue-800 border-blue-200' 
              : 'bg-amber-100 text-amber-800 border-amber-200'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
        >
          {analysis.model_version ? '🤖 AI Generated' : '🔄 Fallback Mode'}
        </motion.div>
      </motion.div>
      
      {/* Fallback Message */}
      {!analysis.model_version && (
        <motion.div 
          className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex items-center space-x-2 text-amber-800 text-sm">
            <span>ℹ️</span>
            <span className="font-medium">Jan AI Unavailable</span>
          </div>
          <p className="text-amber-700 text-xs mt-1">
            Using fallback analysis system. Results may be less detailed than full AI analysis.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AIAnalysisDisplay;