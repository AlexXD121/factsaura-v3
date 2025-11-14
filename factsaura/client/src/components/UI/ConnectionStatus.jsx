import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { healthAPI } from '../../services/api';

function ConnectionStatus({ className = '', showWhenOnline = false }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Check server connectivity
  const checkServerStatus = async () => {
    setIsChecking(true);
    try {
      await healthAPI.checkHealth();
      setServerStatus('connected');
      setLastChecked(new Date());
    } catch (error) {
      setServerStatus('disconnected');
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkServerStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setServerStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (isOnline) {
      checkServerStatus();
    }

    // Periodic health checks
    const interval = setInterval(() => {
      if (isOnline) {
        checkServerStatus();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        status: 'offline',
        icon: '📡',
        text: 'Offline',
        color: 'text-gray-500',
        bg: 'bg-gray-100',
        description: 'No internet connection'
      };
    }

    if (isChecking) {
      return {
        status: 'checking',
        icon: '🔄',
        text: 'Checking...',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        description: 'Checking server connection'
      };
    }

    switch (serverStatus) {
      case 'connected':
        return {
          status: 'connected',
          icon: '🟢',
          text: 'Connected',
          color: 'text-green-600',
          bg: 'bg-green-100',
          description: 'Server connection active'
        };
      case 'disconnected':
        return {
          status: 'disconnected',
          icon: '🔴',
          text: 'Server Error',
          color: 'text-red-600',
          bg: 'bg-red-100',
          description: 'Cannot reach server'
        };
      default:
        return {
          status: 'unknown',
          icon: '🟡',
          text: 'Unknown',
          color: 'text-amber-600',
          bg: 'bg-amber-100',
          description: 'Connection status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const shouldShow = !isOnline || serverStatus !== 'connected' || showWhenOnline;

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`connection-status ${className}`}
      >
        <div className={`glass-card p-3 ${config.bg} border-l-4 border-l-current ${config.color}`}>
          <div className="flex items-center space-x-3">
            {/* Status Icon */}
            <motion.div
              animate={isChecking ? { rotate: 360 } : {}}
              transition={isChecking ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              className="text-lg flex-shrink-0"
            >
              {config.icon}
            </motion.div>

            {/* Status Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`font-medium text-sm ${config.color}`}>
                  {config.text}
                </span>
                {lastChecked && (
                  <span className="text-xs text-gray-500">
                    {lastChecked.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {config.description}
              </p>
            </div>

            {/* Retry Button */}
            {(serverStatus === 'disconnected' || serverStatus === 'unknown') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkServerStatus}
                disabled={isChecking}
                className="glass-button-outlined px-3 py-1 text-xs hover-lift"
              >
                {isChecking ? '...' : '↻'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ConnectionStatus;