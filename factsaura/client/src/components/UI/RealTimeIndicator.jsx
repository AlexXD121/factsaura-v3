import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const RealTimeIndicator = ({ 
  isActive = true, 
  updateInterval = 30000, 
  lastUpdate,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(updateInterval / 1000);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsUpdating(true);
          setTimeout(() => setIsUpdating(false), 2000);
          return updateInterval / 1000;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, updateInterval]);

  const getStatusColor = () => {
    if (isUpdating) return 'text-green-600 bg-green-100';
    if (!isActive) return 'text-red-600 bg-red-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getStatusIcon = () => {
    if (isUpdating) return '🔄';
    if (!isActive) return '⚠️';
    return '📡';
  };

  const getStatusText = () => {
    if (isUpdating) return 'Updating...';
    if (!isActive) return 'Offline';
    return `Next update in ${timeLeft}s`;
  };

  return (
    <motion.div
      className={`flex items-center space-x-3 px-4 py-2 rounded-xl ${getStatusColor()} ${className}`}
      animate={isUpdating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isUpdating ? Infinity : 0 }}
    >
      {/* Status Icon */}
      <motion.span
        className="text-lg"
        animate={isUpdating ? { rotate: 360 } : {}}
        transition={{ 
          duration: 1, 
          repeat: isUpdating ? Infinity : 0,
          ease: "linear"
        }}
      >
        {getStatusIcon()}
      </motion.span>

      {/* Status Text */}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
        {lastUpdate && (
          <span className="text-xs opacity-75">
            Last: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {isActive && !isUpdating && (
        <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-current rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / (updateInterval / 1000)) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      )}

      {/* Pulse Animation for Active State */}
      {isActive && (
        <motion.div
          className="w-2 h-2 bg-current rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export default RealTimeIndicator;