// Demo Performance Optimizer - Task 4.2
// Optimizes performance for live presentation

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const DemoPerformanceOptimizer = ({ children, demoMode = false }) => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0
  });
  const [optimizationLevel, setOptimizationLevel] = useState('standard');

  // Performance monitoring
  const monitorPerformance = useCallback(() => {
    if (!demoMode) return;

    const startTime = performance.now();
    
    // Monitor FPS
    let fps = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        setPerformanceMetrics(prev => ({
          ...prev,
          fps,
          renderTime: currentTime - startTime
        }));
      }
      
      if (demoMode) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    requestAnimationFrame(measureFPS);
    
    // Monitor memory usage (if available)
    if (performance.memory) {
      const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      setPerformanceMetrics(prev => ({
        ...prev,
        memoryUsage
      }));
    }
  }, [demoMode]);

  // Apply performance optimizations for demo mode
  useEffect(() => {
    if (demoMode) {
      // Enable performance optimizations
      document.body.classList.add('demo-mode');
      
      // Reduce motion for better performance if needed
      if (performanceMetrics.fps < 30) {
        setOptimizationLevel('high');
        document.body.classList.add('reduce-motion');
      } else if (performanceMetrics.fps < 45) {
        setOptimizationLevel('medium');
      } else {
        setOptimizationLevel('standard');
      }
      
      // Preload critical resources
      preloadCriticalResources();
      
      // Start performance monitoring
      monitorPerformance();
      
      // Optimize for presentation
      optimizeForPresentation();
      
    } else {
      // Cleanup optimizations
      document.body.classList.remove('demo-mode', 'reduce-motion', 'presentation-mode');
    }
    
    return () => {
      document.body.classList.remove('demo-mode', 'reduce-motion', 'presentation-mode');
    };
  }, [demoMode, performanceMetrics.fps, monitorPerformance]);

  // Preload critical resources for smooth demo
  const preloadCriticalResources = () => {
    // Preload demo images and assets
    const criticalAssets = [
      '/api/demo/posts',
      '/api/demo/statistics',
      '/api/family-tree/demo'
    ];
    
    criticalAssets.forEach(url => {
      fetch(url).catch(() => {}); // Preload silently
    });
  };

  // Optimize for presentation mode
  const optimizeForPresentation = () => {
    // Add presentation-specific styles
    document.body.classList.add('presentation-mode');
    
    // Disable unnecessary animations if performance is poor
    if (performanceMetrics.fps < 30) {
      document.body.style.setProperty('--animation-duration', '0.1s');
    } else {
      document.body.style.setProperty('--animation-duration', '0.3s');
    }
    
    // Optimize scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Enable GPU acceleration for better performance
    const style = document.createElement('style');
    style.textContent = `
      .demo-mode * {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      .presentation-mode {
        font-size: 110% !important;
        line-height: 1.6 !important;
      }
      
      .presentation-mode .glass-card {
        backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
      }
      
      .reduce-motion * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .demo-mode * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  };

  // Performance status indicator
  const getPerformanceStatus = () => {
    if (performanceMetrics.fps >= 50) return { color: 'text-green-400', status: 'Excellent' };
    if (performanceMetrics.fps >= 30) return { color: 'text-yellow-400', status: 'Good' };
    return { color: 'text-red-400', status: 'Poor' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="relative">
      {/* Performance Monitor (only visible in demo mode) */}
      {demoMode && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-xs text-white"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Performance:</span>
              <span className={performanceStatus.color}>{performanceStatus.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>FPS:</span>
              <span className={performanceStatus.color}>{performanceMetrics.fps}</span>
            </div>
            {performanceMetrics.memoryUsage > 0 && (
              <div className="flex items-center justify-between">
                <span>Memory:</span>
                <span className="text-gray-300">{performanceMetrics.memoryUsage}MB</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Mode:</span>
              <span className="text-blue-400">{optimizationLevel}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Optimized content wrapper */}
      <div className={`demo-content ${demoMode ? 'demo-optimized' : ''}`}>
        {children}
      </div>

      {/* Performance optimization styles */}
      <style jsx>{`
        .demo-optimized {
          will-change: transform;
          transform: translateZ(0);
        }
        
        .demo-optimized * {
          will-change: auto;
        }
        
        .demo-optimized img {
          image-rendering: optimizeSpeed;
          image-rendering: -webkit-optimize-contrast;
        }
        
        .demo-optimized .glass-card {
          contain: layout style paint;
        }
        
        .demo-optimized .animation-heavy {
          animation-fill-mode: both;
          animation-play-state: ${optimizationLevel === 'high' ? 'paused' : 'running'};
        }
      `}</style>
    </div>
  );
};

export default DemoPerformanceOptimizer;