import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';

const PerformanceMonitor = ({ showInProduction = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: null,
    renderTime: 0,
    networkRequests: 0
  });
  
  const { getCurrentFPS, getMemoryUsage, monitorFPS } = usePerformanceOptimization();

  // Only show in development unless explicitly enabled
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || showInProduction) {
      setIsVisible(true);
    }
  }, [showInProduction]);

  // Update metrics every second
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setMetrics({
        fps: getCurrentFPS(),
        memory: getMemoryUsage(),
        renderTime: performance.now(),
        networkRequests: performance.getEntriesByType('navigation').length
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, getCurrentFPS, getMemoryUsage]);

  // Monitor FPS
  useEffect(() => {
    if (!isVisible) return;

    let animationId;
    const animate = () => {
      monitorFPS();
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isVisible, monitorFPS]);

  if (!isVisible) return null;

  const getFPSColor = (fps) => {
    if (fps >= 55) return 'text-green-600 bg-green-100';
    if (fps >= 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMemoryColor = (usage) => {
    if (!usage) return 'text-gray-600 bg-gray-100';
    const percentage = (usage.used / usage.total) * 100;
    if (percentage < 70) return 'text-green-600 bg-green-100';
    if (percentage < 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl shadow-lg p-4 min-w-[200px]"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-xs"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">FPS:</span>
          <span className={`px-2 py-1 rounded-full font-medium ${getFPSColor(metrics.fps)}`}>
            {Math.round(metrics.fps)}
          </span>
        </div>
        
        {/* Memory Usage */}
        {metrics.memory && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Memory:</span>
            <span className={`px-2 py-1 rounded-full font-medium ${getMemoryColor(metrics.memory)}`}>
              {metrics.memory.used}MB
            </span>
          </div>
        )}
        
        {/* Network Requests */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Requests:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
            {metrics.networkRequests}
          </span>
        </div>
        
        {/* Performance Score */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Score:</span>
            <span className={`px-2 py-1 rounded-full font-medium ${
              metrics.fps >= 55 ? 'text-green-600 bg-green-100' :
              metrics.fps >= 30 ? 'text-yellow-600 bg-yellow-100' :
              'text-red-600 bg-red-100'
            }`}>
              {metrics.fps >= 55 ? 'Excellent' :
               metrics.fps >= 30 ? 'Good' : 'Poor'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Performance Tips */}
      {metrics.fps < 30 && (
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-red-600 font-medium">Performance Tips:</p>
          <ul className="text-xs text-gray-600 mt-1 space-y-1">
            <li>• Close unused browser tabs</li>
            <li>• Disable browser extensions</li>
            <li>• Update your browser</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default PerformanceMonitor;