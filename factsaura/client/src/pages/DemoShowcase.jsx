// Demo Showcase Page - Task 4.1
// Displays impressive demo content with varied AI analysis results

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Using simple emoji icons for better compatibility
import GlassCard from '../components/UI/GlassCard';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { ConfidenceMeter } from '../components/UI';
import CrisisUrgencyIndicator from '../components/AI/CrisisUrgencyIndicator';
import AIBadge from '../components/AI/AIBadge';
import DemoControlPanel from '../components/Demo/DemoControlPanel';

const DemoShowcase = () => {
  const [demoData, setDemoData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDemoData();
  }, []);

  const fetchDemoData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/demo/posts');
      const result = await response.json();
      
      if (result.success) {
        setDemoData(result.data.posts);
        setStatistics(result.data.statistics);
      } else {
        setError('Failed to load demo data');
      }
    } catch (err) {
      setError('Error fetching demo data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const scenarios = {
    all: 'All Demo Content',
    high_confidence: 'High Confidence (90%+)',
    crisis: 'Crisis Alerts',
    medical: 'Medical Misinformation',
    ai_warnings: 'AI-Generated Warnings',
    mutations: 'Mutation Detection',
    low_confidence: 'Uncertain Content'
  };

  const getFilteredPosts = () => {
    if (!demoData || selectedScenario === 'all') return demoData || [];
    
    switch (selectedScenario) {
      case 'high_confidence':
        return demoData.filter(post => post.confidence >= 0.9 && post.is_misinformation);
      case 'crisis':
        return demoData.filter(post => post.urgency_level === 'critical');
      case 'medical':
        return demoData.filter(post => post.harm_category === 'medical' && post.is_misinformation);
      case 'ai_warnings':
        return demoData.filter(post => post.ai_generated);
      case 'mutations':
        return demoData.filter(post => post.mutation_analysis?.is_mutation);
      case 'low_confidence':
        return demoData.filter(post => post.confidence < 0.3);
      default:
        return demoData;
    }
  };

  const filteredPosts = getFilteredPosts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Demo Data Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchDemoData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            FactSaura Demo Showcase
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Explore our AI-powered misinformation detection with 15 impressive demo scenarios 
            featuring crisis alerts, medical misinformation, and advanced mutation tracking.
          </p>
        </motion.div>

        {/* Statistics Dashboard */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2" />
                Demo Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{statistics.total_posts}</div>
                  <div className="text-sm text-gray-400">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{statistics.misinformation_detected}</div>
                  <div className="text-sm text-gray-400">Misinformation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{statistics.ai_generated_warnings}</div>
                  <div className="text-sm text-gray-400">AI Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{statistics.critical_urgency}</div>
                  <div className="text-sm text-gray-400">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{statistics.mutation_detected}</div>
                  <div className="text-sm text-gray-400">Mutations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{Math.round(statistics.average_confidence * 100)}%</div>
                  <div className="text-sm text-gray-400">Avg Confidence</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Demo Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <DemoControlPanel />
        </motion.div>

        {/* Scenario Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(scenarios).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedScenario === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Demo Posts Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedScenario}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredPosts.map((post, index) => (
              <DemoPostCard key={post.id || index} post={post} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-8xl mb-4">👁️</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts found</h3>
            <p className="text-gray-500">Try selecting a different scenario filter.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const DemoPostCard = ({ post, index }) => {
  const [expanded, setExpanded] = useState(false);

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'medical': return <span className="text-sm">🧪</span>;
      case 'crisis': return <span className="text-sm">⚠️</span>;
      case 'financial': return <span className="text-sm">💰</span>;
      case 'environmental': return <span className="text-sm">🌍</span>;
      default: return <span className="text-sm">🤖</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm leading-tight mb-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor(post.urgency_level)}`}>
                {getCategoryIcon(post.harm_category)}
                {post.urgency_level}
              </span>
              {post.ai_generated && <AIBadge type="generated" size="sm" />}
              {post.mutation_analysis?.is_mutation && <AIBadge type="mutation" size="sm" />}
            </div>
          </div>
          <CrisisUrgencyIndicator 
            urgencyLevel={post.urgency_level}
            harmCategory={post.harm_category}
            size="sm"
          />
        </div>

        {/* Content Preview */}
        <div className="flex-1 mb-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {expanded ? post.content : `${post.content.substring(0, 120)}...`}
          </p>
          {post.content.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 text-xs mt-2 hover:text-blue-300 transition-colors"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* AI Analysis */}
        <div className="space-y-3">
          <ConfidenceMeter 
            confidence={post.confidence} 
            isMisinformation={post.is_misinformation}
            size="sm"
          />
          
          {post.reasoning_steps && post.reasoning_steps.length > 0 && (
            <div className="bg-black/20 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-400 mb-2">AI Reasoning:</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                {post.reasoning_steps.slice(0, 2).map((step, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    {step}
                  </li>
                ))}
                {post.reasoning_steps.length > 2 && (
                  <li className="text-gray-500 italic">
                    +{post.reasoning_steps.length - 2} more reasons...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>🕒</span>
              {new Date(post.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              {post.upvotes && (
                <span className="text-green-400">↑{post.upvotes}</span>
              )}
              {post.downvotes && (
                <span className="text-red-400">↓{post.downvotes}</span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default DemoShowcase;