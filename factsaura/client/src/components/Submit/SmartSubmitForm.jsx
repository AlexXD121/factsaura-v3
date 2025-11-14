import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ModernCard from '../UI/ModernCard';
import ConfidenceMeter from '../UI/ConfidenceMeter';
import { postsAPI, aiAPI } from '../../services/api';

const SmartSubmitForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: '',
    type: 'user_submitted'
  });
  
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Real-time analysis as user types
  useEffect(() => {
    const analyzeContent = async () => {
      if (!formData.content || formData.content.length < 50) {
        setAnalysis(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        const result = await aiAPI.analyzeContent({
          text: formData.content,
          url: formData.url || undefined
        });
        setAnalysis(result);
      } catch (error) {
        console.error('Analysis failed:', error);
        setAnalysis(null);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const debounceTimer = setTimeout(analyzeContent, 1000);
    return () => clearTimeout(debounceTimer);
  }, [formData.content, formData.url]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in both title and content');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await postsAPI.createPost(formData);
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({ title: '', content: '', url: '', type: 'user_submitted' });
        setAnalysis(null);
        setSuccess(false);
        onSubmitSuccess?.(result);
      }, 2000);
      
    } catch (error) {
      setError(error.message || 'Failed to submit post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAnalysisColor = (confidence) => {
    if (confidence >= 0.8) return 'border-red-300 bg-red-50';
    if (confidence >= 0.6) return 'border-amber-300 bg-amber-50';
    if (confidence >= 0.4) return 'border-yellow-300 bg-yellow-50';
    return 'border-green-300 bg-green-50';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <ModernCard className="p-8 text-center" variant="gradient">
        <motion.h1 
          className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Submit Content for Analysis
        </motion.h1>
        <motion.p 
          className="text-gray-600 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Our AI will analyze your content in real-time for potential misinformation
        </motion.p>
      </ModernCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <ModernCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={200}
                />
                <div className="mt-1 text-xs text-gray-500 text-right">
                  {formData.title.length}/200
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content *
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Paste or type the content you want to analyze..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  maxLength={5000}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>
                    {formData.content.length < 50 
                      ? `Need ${50 - formData.content.length} more characters for analysis`
                      : 'AI analysis active'
                    }
                  </span>
                  <span>{formData.content.length}/5000</span>
                </div>
              </div>

              {/* URL (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source URL (Optional)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-800 font-medium">
                      Content submitted successfully!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                className={`
                  w-full py-4 px-6 rounded-xl font-semibold text-white transition-all
                  ${isSubmitting || !formData.title.trim() || !formData.content.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit for Analysis'
                )}
              </motion.button>
            </form>
          </ModernCard>
        </div>

        {/* Real-time Analysis Panel */}
        <div className="space-y-6">
          {/* Analysis Status */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Real-time Analysis
            </h3>
            
            {formData.content.length < 50 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-gray-500 text-sm">
                  Type at least 50 characters to start AI analysis
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 font-medium">Analyzing content...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* Confidence Score */}
                <div className="text-center">
                  <ConfidenceMeter 
                    confidence={analysis.confidence || 0}
                    size="lg"
                    showLabel={true}
                  />
                </div>

                {/* Analysis Details */}
                <div className={`p-4 border rounded-xl ${getAnalysisColor(analysis.confidence || 0)}`}>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    AI Assessment
                  </h4>
                  
                  {analysis.reasoning_steps && (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {analysis.reasoning_steps.slice(0, 3).map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {analysis.harm_category && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <span className="text-xs font-medium text-gray-600">
                        Category: {analysis.harm_category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {analysis.confidence >= 0.6 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h4 className="font-semibold text-amber-800 mb-2">
                      ⚠️ Recommendations
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Verify information with multiple sources</li>
                      <li>• Check for official statements</li>
                      <li>• Consider the source credibility</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">❌</div>
                <p className="text-gray-500 text-sm">
                  Analysis failed. Please try again.
                </p>
              </div>
            )}
          </ModernCard>

          {/* Tips */}
          <ModernCard className="p-6" variant="info">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              💡 Tips for Better Analysis
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Include complete sentences and context</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Add source URLs when available</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Longer content provides better analysis</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Our AI learns from community feedback</span>
              </li>
            </ul>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default SmartSubmitForm;