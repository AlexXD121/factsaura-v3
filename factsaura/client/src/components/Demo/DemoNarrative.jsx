// Demo Narrative Component - Task 4.2
// Provides smooth storytelling flow for presentations

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../UI/GlassCard';

const DemoNarrative = ({ currentStep, demoData, onStepComplete }) => {
  const [narrativeText, setNarrativeText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // Narrative scripts for each demo step
  const narrativeScripts = {
    welcome: {
      title: "Welcome to FactSaura",
      script: "FactSaura is an AI-powered misinformation detection platform that protects communities by identifying and alerting users about false information in real-time.",
      highlights: [
        "AI-powered detection",
        "Real-time monitoring", 
        "Community protection"
      ],
      visualCues: ["🤖", "⚡", "🛡️"]
    },
    'crisis-detection': {
      title: "Crisis Misinformation Detection",
      script: "During emergencies, false information spreads rapidly and can cause panic. FactSaura monitors crisis-related content and immediately flags dangerous misinformation like fake evacuation orders or false casualty reports.",
      highlights: [
        "Emergency monitoring",
        "Panic prevention",
        "Life-saving alerts"
      ],
      visualCues: ["🚨", "⚠️", "🆘"]
    },
    'medical-misinformation': {
      title: "Medical Misinformation Analysis",
      script: "Health misinformation can be deadly. Our AI analyzes medical claims, cross-references with verified sources, and warns users about dangerous treatments like bleach cures or unproven cancer treatments.",
      highlights: [
        "Health claim verification",
        "Medical source checking",
        "Dangerous treatment alerts"
      ],
      visualCues: ["🧪", "⚕️", "💊"]
    },
    'ai-analysis': {
      title: "Advanced AI Analysis",
      script: "Each post receives comprehensive AI analysis with confidence scoring, reasoning explanation, and uncertainty flags. Our system shows exactly why content is flagged, building trust through transparency.",
      highlights: [
        "Confidence scoring",
        "Reasoning explanation",
        "Transparency focus"
      ],
      visualCues: ["🎯", "🧠", "📊"]
    },
    'family-tree': {
      title: "Mutation Tracking",
      script: "Misinformation evolves as it spreads. FactSaura tracks how false claims mutate across platforms, showing the complete family tree of a lie from its origin to current variations.",
      highlights: [
        "Mutation tracking",
        "Evolution visualization",
        "Origin tracing"
      ],
      visualCues: ["🌳", "🔄", "📈"]
    },
    'real-time': {
      title: "Real-time Detection",
      script: "FactSaura monitors multiple data sources continuously, detecting misinformation within minutes of it appearing online and alerting users before it can spread widely.",
      highlights: [
        "Continuous monitoring",
        "Rapid detection",
        "Early warning system"
      ],
      visualCues: ["⏱️", "🔍", "📡"]
    },
    summary: {
      title: "Protecting Communities",
      script: "FactSaura combines cutting-edge AI with real-time monitoring to create a comprehensive defense against misinformation, protecting communities and saving lives through early detection and transparent analysis.",
      highlights: [
        "Comprehensive defense",
        "Community protection",
        "Life-saving technology"
      ],
      visualCues: ["🛡️", "🌍", "❤️"]
    }
  };

  // Typewriter effect for narrative text
  const typewriterEffect = (text, callback) => {
    setIsTyping(true);
    setNarrativeText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setNarrativeText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        setShowHighlights(true);
        if (callback) callback();
      }
    }, 30); // Adjust typing speed
    
    return () => clearInterval(timer);
  };

  // Update narrative when step changes
  useEffect(() => {
    if (currentStep && narrativeScripts[currentStep.id]) {
      setShowHighlights(false);
      const script = narrativeScripts[currentStep.id];
      
      // Start typewriter effect after a brief delay
      const timer = setTimeout(() => {
        typewriterEffect(script.script, () => {
          // Notify parent that narrative is complete
          if (onStepComplete) {
            setTimeout(() => onStepComplete(currentStep.id), 1000);
          }
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, onStepComplete]);

  if (!currentStep || !narrativeScripts[currentStep.id]) {
    return null;
  }

  const script = narrativeScripts[currentStep.id];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-6 left-6 right-6 z-40"
    >
      <GlassCard className="p-6 max-w-4xl mx-auto">
        <div className="flex items-start space-x-4">
          {/* Visual Cues */}
          <div className="flex space-x-2">
            {script.visualCues.map((emoji, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="text-3xl"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
          
          {/* Narrative Content */}
          <div className="flex-1">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-white mb-3"
            >
              {script.title}
            </motion.h3>
            
            {/* Typewriter Text */}
            <div className="text-gray-300 leading-relaxed mb-4 min-h-[3rem]">
              {narrativeText}
              {isTyping && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-blue-400"
                >
                  |
                </motion.span>
              )}
            </div>
            
            {/* Key Highlights */}
            <AnimatePresence>
              {showHighlights && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {script.highlights.map((highlight, index) => (
                    <motion.span
                      key={highlight}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm font-medium"
                    >
                      {highlight}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Progress Indicator */}
          <div className="text-right">
            <div className="text-xs text-gray-400 mb-2">
              Step {Object.keys(narrativeScripts).indexOf(currentStep.id) + 1} of {Object.keys(narrativeScripts).length}
            </div>
            <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((Object.keys(narrativeScripts).indexOf(currentStep.id) + 1) / Object.keys(narrativeScripts).length) * 100}%` 
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
        
        {/* Skip/Next Controls */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={() => onStepComplete && onStepComplete(currentStep.id, true)}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip Narration
          </button>
          {!isTyping && showHighlights && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => onStepComplete && onStepComplete(currentStep.id)}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Continue →
            </motion.button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default DemoNarrative;