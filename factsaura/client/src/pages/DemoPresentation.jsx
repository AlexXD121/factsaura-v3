// Demo Presentation Page - Task 4.2
// Optimized demo flow for live presentations

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Demo Components
import DemoModeController from '../components/Demo/DemoModeController';
import DemoPerformanceOptimizer from '../components/Demo/DemoPerformanceOptimizer';
import DemoNarrative from '../components/Demo/DemoNarrative';
import DemoBackupData, { backupDemoData } from '../components/Demo/DemoBackupData';

// Existing Components
import Feed from '../components/Feed/Feed';
import FamilyTreeVisualization from '../components/FamilyTree/FamilyTreeVisualization';
import GlassCard from '../components/UI/GlassCard';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { ErrorBoundary } from '../components/ErrorBoundary';

const DemoPresentation = () => {
  const navigate = useNavigate();
  const [demoState, setDemoState] = useState({
    demoMode: false,
    demoData: null,
    currentStep: null,
    stepIndex: 0
  });
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showComponent, setShowComponent] = useState('feed');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useBackupData, setUseBackupData] = useState(false);

  // Handle demo state changes from controller
  const handleDemoStateChange = useCallback((newState) => {
    setDemoState(newState);
    
    if (newState.currentStep) {
      // Update display based on current step
      updateDisplayForStep(newState.currentStep, newState.demoData);
    }
  }, []);

  // Update display based on demo step
  const updateDisplayForStep = (step, demoData) => {
    if (!demoData) return;
    
    try {
      switch (step.action) {
      case 'introduction':
        setShowComponent('welcome');
        setFilteredPosts(demoData.posts?.slice(0, 3) || []);
        break;
        
      case 'show-crisis-posts':
        setShowComponent('feed');
        const crisisPosts = demoData.posts?.filter(p => 
          p.urgency_level === 'critical' || p.harm_category === 'crisis'
        ) || [];
        setFilteredPosts(crisisPosts);
        break;
        
      case 'show-medical-posts':
        setShowComponent('feed');
        const medicalPosts = demoData.posts?.filter(p => 
          p.harm_category === 'medical' && p.is_misinformation
        ) || [];
        setFilteredPosts(medicalPosts);
        break;
        
      case 'highlight-ai-features':
        setShowComponent('ai-analysis');
        const highConfidencePosts = demoData.posts?.filter(p => 
          p.confidence >= 0.9
        ) || [];
        setFilteredPosts(highConfidencePosts);
        break;
        
      case 'show-family-tree':
        setShowComponent('family-tree');
        break;
        
      case 'simulate-real-time':
        setShowComponent('real-time');
        simulateRealTimeDetection(demoData);
        break;
        
      case 'show-summary':
        setShowComponent('summary');
        setFilteredPosts(demoData.posts || []);
        break;
        
      default:
        setShowComponent('feed');
        setFilteredPosts(demoData.posts || []);
    }
    } catch (error) {
      setError('Error updating display for demo step: ' + error.message);
    }
  };

  // Simulate real-time detection for demo
  const simulateRealTimeDetection = (demoData) => {
    try {
      if (!demoData.posts) return;
      
      setFilteredPosts([]);
      
      // Add posts one by one to simulate real-time detection
      demoData.posts.forEach((post, index) => {
        setTimeout(() => {
          setFilteredPosts(prev => [...prev, post]);
        }, index * 1500);
      });
    } catch (error) {
      setError('Error simulating real-time detection: ' + error.message);
    }
  };

  // Handle step completion
  const handleStepComplete = (stepId, skip = false) => {
    // Optional: Add any step completion logic here
    console.log(`Step ${stepId} completed${skip ? ' (skipped)' : ''}`);
  };

  // Load backup data if API fails
  const handleBackupDataLoad = (data) => {
    try {
      setDemoState(prev => ({
        ...prev,
        demoData: data
      }));
      setUseBackupData(true);
    } catch (error) {
      setError('Failed to load backup demo data: ' + error.message);
    }
  };

  // Render different components based on demo step
  const renderDemoContent = () => {
    const { demoMode, currentStep, demoData } = demoState;
    
    if (!demoMode) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl"
          >
            <div className="text-8xl mb-6">🎭</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              FactSaura Demo Presentation
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Experience our AI-powered misinformation detection platform with an optimized presentation flow.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/demo')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mr-4"
              >
                Interactive Demo
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Back to Feed
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    switch (showComponent) {
      case 'welcome':
        return <WelcomeScreen demoData={demoData} />;
      case 'feed':
        return <DemoFeed posts={filteredPosts} currentStep={currentStep} />;
      case 'ai-analysis':
        return <AIAnalysisDemo posts={filteredPosts} />;
      case 'family-tree':
        return <FamilyTreeDemo demoData={demoData} />;
      case 'real-time':
        return <RealTimeDemo posts={filteredPosts} />;
      case 'summary':
        return <DemoSummary demoData={demoData} />;
      default:
        return <DemoFeed posts={filteredPosts} currentStep={currentStep} />;
    }
  };

  return (
    <ErrorBoundary level="page">
      <DemoPerformanceOptimizer demoMode={demoState.demoMode}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Demo Controller */}
        <div className="p-6">
          <DemoModeController onDemoStateChange={handleDemoStateChange} />
        </div>

        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showComponent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderDemoContent()}
          </motion.div>
        </AnimatePresence>

        {/* Demo Narrative */}
        <AnimatePresence>
          {demoState.demoMode && demoState.currentStep && (
            <DemoNarrative
              currentStep={demoState.currentStep}
              demoData={demoState.demoData}
              onStepComplete={handleStepComplete}
            />
          )}
        </AnimatePresence>

        {/* Backup Data Provider */}
        {useBackupData && (
          <DemoBackupData onDataLoaded={handleBackupDataLoad} />
        )}

        {/* Error Fallback */}
        {error && (
          <div className="fixed top-4 left-4 right-4 z-50">
            <GlassCard className="p-4 border-l-4 border-red-500">
              <div className="flex items-center">
                <span className="text-2xl text-red-400 mr-3">⚠️</span>
                <div>
                  <h3 className="text-red-400 font-medium">Demo Error</h3>
                  <p className="text-gray-300 text-sm">{error}</p>
                  <button
                    onClick={() => setUseBackupData(true)}
                    className="text-blue-400 text-sm mt-1 hover:text-blue-300"
                  >
                    Use Backup Demo Data
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
        </div>
      </DemoPerformanceOptimizer>
    </ErrorBoundary>
  );
};

// Demo component variations
const WelcomeScreen = ({ demoData }) => (
  <div className="p-6 text-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-6xl mb-6">🛡️</div>
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
        FactSaura
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        AI-Powered Misinformation Detection Platform
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 text-center">
          <div className="text-3xl mb-3">🤖</div>
          <h3 className="text-white font-semibold mb-2">AI Detection</h3>
          <p className="text-gray-300 text-sm">Advanced AI analyzes content for misinformation patterns</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="text-white font-semibold mb-2">Real-time Alerts</h3>
          <p className="text-gray-300 text-sm">Instant notifications when dangerous content is detected</p>
        </GlassCard>
        <GlassCard className="p-6 text-center">
          <div className="text-3xl mb-3">🌍</div>
          <h3 className="text-white font-semibold mb-2">Community Protection</h3>
          <p className="text-gray-300 text-sm">Protecting communities from harmful misinformation</p>
        </GlassCard>
      </div>
    </motion.div>
  </div>
);

const DemoFeed = ({ posts, currentStep }) => (
  <div className="p-6">
    <Feed demoMode={true} demoPosts={posts} />
  </div>
);

const AIAnalysisDemo = ({ posts }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-white mb-6 text-center">AI Analysis Showcase</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {posts.slice(0, 2).map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.3 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-white font-semibold mb-3">{post.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{post.content.substring(0, 150)}...</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Confidence:</span>
                <span className={`font-bold ${post.confidence >= 0.8 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {Math.round(post.confidence * 100)}%
                </span>
              </div>
              <div className="text-xs text-gray-400">
                <strong>AI Reasoning:</strong>
                <ul className="mt-1 space-y-1">
                  {post.reasoning_steps?.slice(0, 2).map((step, i) => (
                    <li key={i}>• {step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  </div>
);

const FamilyTreeDemo = ({ demoData }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-white mb-6 text-center">Misinformation Family Tree</h2>
    <div className="max-w-6xl mx-auto">
      <FamilyTreeVisualization demoMode={true} />
    </div>
  </div>
);

const RealTimeDemo = ({ posts }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-white mb-6 text-center">Real-time Detection</h2>
    <div className="max-w-4xl mx-auto">
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white">Monitoring 1,247 sources in real-time</span>
        </div>
      </GlassCard>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.5 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{post.title}</h3>
                  <p className="text-gray-400 text-sm">Detected {index + 1} seconds ago</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.is_misinformation ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {post.is_misinformation ? 'MISINFORMATION' : 'VERIFIED'}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const DemoSummary = ({ demoData }) => (
  <div className="p-6 text-center">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-6xl mb-6">🎯</div>
      <h1 className="text-4xl font-bold text-white mb-6">Demo Complete</h1>
      <p className="text-xl text-gray-300 mb-8">
        FactSaura: Protecting communities through AI-powered misinformation detection
      </p>
      
      {demoData?.statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{demoData.statistics.total_posts}</div>
            <div className="text-gray-400">Posts Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{demoData.statistics.misinformation_detected}</div>
            <div className="text-gray-400">Misinformation Detected</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{demoData.statistics.ai_generated_warnings}</div>
            <div className="text-gray-400">AI Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Math.round((demoData.statistics.average_confidence || 0) * 100)}%
            </div>
            <div className="text-gray-400">Avg Confidence</div>
          </div>
        </div>
      )}
      
      <div className="text-lg text-gray-300">
        Thank you for experiencing FactSaura's AI-powered misinformation detection platform.
      </div>
    </motion.div>
  </div>
);

export default DemoPresentation;