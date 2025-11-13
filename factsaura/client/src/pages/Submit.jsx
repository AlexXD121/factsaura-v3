import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard, AnimatedButton, ConfidenceMeter } from '../components/UI';
import { postsAPI } from '../services/api';

function Submit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source_url: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear previous results when user starts typing
    if (analysisResult) {
      setAnalysisResult(null);
    }
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Title is required');
    } else if (formData.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
    
    if (!formData.content.trim()) {
      errors.push('Content is required');
    } else if (formData.content.length > 10000) {
      errors.push('Content must be 10,000 characters or less');
    }
    
    if (formData.source_url && formData.source_url.trim()) {
      try {
        new URL(formData.source_url.trim());
      } catch {
        errors.push('Please enter a valid URL');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(false);
    setAnalysisProgress('Submitting content...');

    try {
      // Show progress updates
      setAnalysisProgress('Analyzing content with AI...');
      
      console.log('🚀 Submitting content:', {
        title: formData.title.trim(),
        content: formData.content.trim().substring(0, 100) + '...',
        source_url: formData.source_url.trim() || null
      });
      
      // Submit content for AI analysis and posting
      const response = await postsAPI.createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        source_url: formData.source_url.trim() || null
      });
      
      console.log('✅ Received response:', response);
      setAnalysisProgress('Processing results...');

      if (response.success) {
        // Combine post data with AI analysis for display
        const analysisData = {
          ...response.data.ai_analysis,
          post_id: response.data.post.id,
          title: response.data.post.title,
          content: response.data.post.content,
          created_at: response.data.post.created_at,
          // Include mutation analysis if available
          mutation_analysis: response.data.mutation_analysis
        };
        
        setAnalysisResult(analysisData);
        setSuccess(true);
        
        // Show success message and redirect to feed after 3 seconds
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: 'Content submitted and analyzed successfully!',
              newPostId: response.data.post.id 
            }
          });
        }, 3000);
      } else {
        setError(response.error?.message || 'Failed to analyze content');
      }
    } catch (err) {
      console.error('Submission error:', err);
      
      // Handle different types of errors
      if (err.status === 400) {
        setError(err.message || 'Invalid input. Please check your data and try again.');
      } else if (err.status === 503) {
        setError('AI analysis service is temporarily unavailable. Please try again in a few moments.');
      } else if (err.status === 409) {
        setError('A similar post already exists. Please try submitting different content.');
      } else if (err.code === 'TIMEOUT') {
        setError('Request timed out. Please try again.');
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to submit content. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const getAlertLevelIcon = (level, isMisinformation) => {
    if (isMisinformation) {
      return { icon: '🚨', color: 'text-red-600', bg: 'alert-critical' };
    }
    switch (level) {
      case 'critical': return { icon: '🔴', color: 'text-red-600', bg: 'alert-critical' };
      case 'high': return { icon: '🟡', color: 'text-amber-600', bg: 'alert-warning' };
      case 'medium': return { icon: '🔵', color: 'text-blue-600', bg: 'alert-info' };
      case 'low': return { icon: '🟢', color: 'text-green-600', bg: 'alert-safe' };
      default: return { icon: '🔵', color: 'text-blue-600', bg: 'alert-info' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-primary mb-4">
          Submit Content for Analysis
        </h1>
        <p className="text-secondary text-lg">
          Our AI will analyze your content for misinformation patterns and provide detailed insights
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <span className="mr-2">📝</span>
              Content Submission
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-primary mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title..."
                  className="glass-input w-full"
                  maxLength={200}
                  required
                />
                <div className="text-xs text-secondary mt-1">
                  {formData.title.length}/200 characters
                </div>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-primary mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Paste the content you want to analyze..."
                  className="glass-input w-full h-32 resize-none"
                  maxLength={10000}
                  required
                />
                <div className="text-xs text-secondary mt-1">
                  {formData.content.length}/10,000 characters
                </div>
              </div>

              <div>
                <label htmlFor="source_url" className="block text-sm font-medium text-primary mb-2">
                  Source URL (Optional)
                </label>
                <input
                  type="url"
                  id="source_url"
                  name="source_url"
                  value={formData.source_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/article"
                  className="glass-input w-full"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert-critical p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-red-600 mr-2">⚠️</span>
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert-safe p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✅</span>
                      <span className="text-green-800 font-medium">
                        Content submitted and analyzed successfully!
                      </span>
                    </div>
                    <span className="text-green-600 text-sm">
                      Redirecting to feed...
                    </span>
                  </div>
                </motion.div>
              )}

              <AnimatedButton
                type="submit"
                disabled={isAnalyzing || !formData.title.trim() || !formData.content.trim()}
                className="glass-button w-full"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {analysisProgress || 'Analyzing with AI...'}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🤖</span>
                    Analyze Content
                  </div>
                )}
              </AnimatedButton>
            </form>
          </div>
        </motion.div>

        {/* Analysis Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
              <span className="mr-2">🤖</span>
              AI Analysis Results
            </h2>

            {!analysisResult && !isAnalyzing && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-secondary">
                  Submit content above to see AI analysis results
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-primary font-medium">Analyzing content...</p>
                <p className="text-secondary text-sm mt-2">
                  This may take a few seconds
                </p>
              </div>
            )}

            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Confidence Score */}
                <div className="text-center">
                  <ConfidenceMeter 
                    confidence={analysisResult.confidence_score || 0} 
                    size="lg" 
                  />
                  <p className="text-sm text-secondary mt-2">
                    AI Confidence: {Math.round((analysisResult.confidence_score || 0) * 100)}%
                  </p>
                </div>

                {/* Alert Level */}
                {(() => {
                  const alertLevel = getAlertLevelIcon(
                    analysisResult.crisis_context?.urgency_level, 
                    analysisResult.is_misinformation
                  );
                  return (
                    <div className={`${alertLevel.bg} p-4 rounded-lg`}>
                      <div className="flex items-center mb-2">
                        <span className={`text-2xl mr-2 ${alertLevel.color}`}>
                          {alertLevel.icon}
                        </span>
                        <span className="font-bold text-primary">
                          {analysisResult.is_misinformation ? 'MISINFORMATION DETECTED' : 'CONTENT ANALYZED'}
                        </span>
                      </div>
                      <p className="text-primary text-sm">
                        {analysisResult.explanation || 'Analysis completed successfully.'}
                      </p>
                    </div>
                  );
                })()}

                {/* Crisis Context */}
                {analysisResult.crisis_context && (
                  <div className="content-box p-4 rounded-lg">
                    <h4 className="font-bold text-primary mb-3 flex items-center">
                      <span className="mr-2">🚨</span>
                      Crisis Context
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Urgency Level:</span>
                        <span className="font-medium text-primary">
                          {analysisResult.crisis_context.urgency_level?.toUpperCase() || 'MEDIUM'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Harm Category:</span>
                        <span className="font-medium text-primary">
                          {analysisResult.crisis_context.harm_category?.toUpperCase() || 'GENERAL'}
                        </span>
                      </div>
                      {analysisResult.crisis_context.crisis_keywords_found?.length > 0 && (
                        <div>
                          <span className="text-secondary">Keywords Found:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {analysisResult.crisis_context.crisis_keywords_found.map((keyword, index) => (
                              <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs border border-red-200">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {analysisResult.red_flags?.length > 0 && (
                  <div className="alert-warning p-4 rounded-lg">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center">
                      <span className="mr-2">🚩</span>
                      Red Flags Detected
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.red_flags.map((flag, index) => (
                        <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs border border-amber-200">
                          {flag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning Steps */}
                {analysisResult.reasoning_steps?.length > 0 && (
                  <div className="content-box p-4 rounded-lg">
                    <h4 className="font-bold text-primary mb-3 flex items-center">
                      <span className="mr-2">🧠</span>
                      AI Reasoning Steps
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.reasoning_steps.map((step, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-info font-bold text-sm mr-2 min-w-[20px]">
                            {index + 1}.
                          </span>
                          <span className="text-primary text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mutation Analysis */}
                {analysisResult.mutation_analysis && (
                  <div className="content-box p-4 rounded-lg">
                    <h4 className="font-bold text-primary mb-3 flex items-center">
                      <span className="mr-2">🧬</span>
                      Mutation Analysis
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary">Is Mutation:</span>
                        <span className={`font-medium ${analysisResult.mutation_analysis.is_mutation ? 'text-red-600' : 'text-green-600'}`}>
                          {analysisResult.mutation_analysis.is_mutation ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {analysisResult.mutation_analysis.is_mutation && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-secondary">Mutation Type:</span>
                            <span className="font-medium text-primary">
                              {analysisResult.mutation_analysis.mutation_type?.replace(/_/g, ' ').toUpperCase() || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-secondary">Generation:</span>
                            <span className="font-medium text-primary">
                              {analysisResult.mutation_analysis.generation || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-secondary">Confidence:</span>
                            <span className="font-medium text-primary">
                              {Math.round((analysisResult.mutation_analysis.confidence || 0) * 100)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Submit;