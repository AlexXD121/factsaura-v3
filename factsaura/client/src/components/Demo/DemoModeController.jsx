// Demo Mode Controller - Task 4.2
// Smooth demo narrative flow with pre-loaded impressive data

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../UI/GlassCard';

const DemoModeController = ({ onDemoStateChange }) => {
  const [demoMode, setDemoMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [demoData, setDemoData] = useState(null);
  const [presentationMode, setPresentationMode] = useState(false);

  // Demo narrative steps for smooth presentation flow
  const demoSteps = [
    {
      id: 'welcome',
      title: 'Welcome to FactSaura',
      description: 'AI-powered misinformation detection platform',
      duration: 3000,
      action: 'introduction'
    },
    {
      id: 'crisis-detection',
      title: 'Crisis Misinformation Detection',
      description: 'Real-time monitoring of crisis-related false information',
      duration: 5000,
      action: 'show-crisis-posts',
      filter: { urgency_level: 'critical' }
    },
    {
      id: 'medical-misinformation',
      title: 'Medical Misinformation Analysis',
      description: 'Detecting dangerous health-related false claims',
      duration: 5000,
      action: 'show-medical-posts',
      filter: { harm_category: 'medical', is_misinformation: true }
    },
    {
      id: 'ai-analysis',
      title: 'Advanced AI Analysis',
      description: 'Confidence scoring and reasoning explanation',
      duration: 4000,
      action: 'highlight-ai-features'
    },
    {
      id: 'family-tree',
      title: 'Mutation Tracking',
      description: 'Visualizing how misinformation spreads and mutates',
      duration: 6000,
      action: 'show-family-tree'
    },
    {
      id: 'real-time',
      title: 'Real-time Detection',
      description: 'Live monitoring and instant alerts',
      duration: 4000,
      action: 'simulate-real-time'
    },
    {
      id: 'summary',
      title: 'Demo Complete',
      description: 'FactSaura: Protecting communities from misinformation',
      duration: 3000,
      action: 'show-summary'
    }
  ];

  // Preload demo data for smooth presentation
  const preloadDemoData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load demo posts
      const postsResponse = await fetch('/api/demo/posts');
      const postsResult = await postsResponse.json();
      
      // Load demo scenarios
      const scenariosResponse = await fetch('/api/demo/posts/scenarios');
      const scenariosResult = await scenariosResponse.json();
      
      // Load family tree data
      const familyTreeResponse = await fetch('/api/family-tree/demo');
      const familyTreeResult = await familyTreeResponse.json();
      
      const preloadedData = {
        posts: postsResult.success ? postsResult.data.posts : [],
        scenarios: scenariosResult.success ? scenariosResult.data : {},
        familyTree: familyTreeResult.success ? familyTreeResult.data : null,
        statistics: postsResult.success ? postsResult.data.statistics : null
      };
      
      setDemoData(preloadedData);
      
      // Notify parent component about demo data
      if (onDemoStateChange) {
        onDemoStateChange({
          demoMode: true,
          demoData: preloadedData,
          currentStep: demoSteps[0]
        });
      }
      
    } catch (error) {
      console.error('Error preloading demo data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onDemoStateChange]);

  // Start demo mode
  const startDemo = async () => {
    setDemoMode(true);
    setCurrentStep(0);
    setPresentationMode(true);
    
    if (!demoData) {
      await preloadDemoData();
    }
    
    // Start auto-progression through demo steps
    startAutoProgression();
  };

  // Auto-progress through demo steps
  const startAutoProgression = () => {
    const progressStep = (stepIndex) => {
      if (stepIndex >= demoSteps.length) {
        // Demo complete
        setDemoMode(false);
        setPresentationMode(false);
        setCurrentStep(0);
        return;
      }
      
      const step = demoSteps[stepIndex];
      setCurrentStep(stepIndex);
      
      // Notify parent about current step
      if (onDemoStateChange) {
        onDemoStateChange({
          demoMode: true,
          demoData,
          currentStep: step,
          stepIndex
        });
      }
      
      // Auto-progress to next step
      setTimeout(() => {
        progressStep(stepIndex + 1);
      }, step.duration);
    };
    
    progressStep(0);
  };

  // Manual step control
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < demoSteps.length) {
      setCurrentStep(stepIndex);
      
      if (onDemoStateChange) {
        onDemoStateChange({
          demoMode: true,
          demoData,
          currentStep: demoSteps[stepIndex],
          stepIndex
        });
      }
    }
  };

  // Stop demo
  const stopDemo = () => {
    setDemoMode(false);
    setPresentationMode(false);
    setCurrentStep(0);
    
    if (onDemoStateChange) {
      onDemoStateChange({
        demoMode: false,
        demoData: null,
        currentStep: null
      });
    }
  };

  // Preload data on component mount
  useEffect(() => {
    preloadDemoData();
  }, [preloadDemoData]);

  const currentStepData = demoSteps[currentStep];

  return (
    <div className="space-y-4">
      {/* Demo Control Panel */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">🎭</span>
            Demo Mode Controller
          </h2>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${demoMode ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-300">
              {demoMode ? 'Demo Active' : 'Demo Ready'}
            </span>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          {!demoMode ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startDemo}
              disabled={isLoading}
              className={`
                px-6 py-3 rounded-lg font-medium flex items-center space-x-2
                ${isLoading 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
                transition-colors
              `}
            >
              {isLoading ? (
                <>
                  <span className="text-lg animate-spin">🔄</span>
                  <span>Loading Demo...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">▶️</span>
                  <span>Start Demo Presentation</span>
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={stopDemo}
              className="px-6 py-3 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center space-x-2"
            >
              <span className="text-lg">⏹️</span>
              <span>Stop Demo</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPresentationMode(!presentationMode)}
            className={`
              px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2
              ${presentationMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
              }
            `}
          >
            <span className="text-lg">📺</span>
            <span>{presentationMode ? 'Exit Presentation' : 'Presentation Mode'}</span>
          </motion.button>
        </div>

        {/* Demo Progress */}
        {demoMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Demo Progress</h3>
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {demoSteps.length}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Current Step Info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/20 rounded-lg p-4"
              >
                <h4 className="text-white font-medium mb-2">{currentStepData?.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{currentStepData?.description}</p>
                
                {/* Step Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {demoSteps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToStep(index)}
                        className={`
                          w-8 h-8 rounded-full text-xs font-medium transition-colors
                          ${index === currentStep 
                            ? 'bg-blue-600 text-white' 
                            : index < currentStep 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }
                        `}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Auto-advancing in {Math.ceil(currentStepData?.duration / 1000)}s
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </GlassCard>

      {/* Demo Data Status */}
      {demoData && (
        <GlassCard className="p-4">
          <h3 className="text-white font-medium mb-3">Demo Data Loaded</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{demoData.posts?.length || 0}</div>
              <div className="text-gray-400">Demo Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{Object.keys(demoData.scenarios || {}).length}</div>
              <div className="text-gray-400">Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{demoData.familyTree ? '1' : '0'}</div>
              <div className="text-gray-400">Family Tree</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">
                {demoData.statistics?.misinformation_detected || 0}
              </div>
              <div className="text-gray-400">Misinformation</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {presentationMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-8 max-w-2xl mx-4"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎭</div>
                <h2 className="text-3xl font-bold text-white mb-4">Presentation Mode Active</h2>
                <p className="text-gray-300 mb-6">
                  Demo is optimized for live presentation with enhanced visuals and smooth transitions.
                </p>
                <button
                  onClick={() => setPresentationMode(false)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Continue to Demo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoModeController;