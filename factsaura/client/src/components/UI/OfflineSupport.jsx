import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from './';

function OfflineSupport({ className = '' }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      
      // Process offline queue when back online
      if (offlineQueue.length > 0) {
        processOfflineQueue();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show offline message if already offline
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  const processOfflineQueue = async () => {
    // Process queued actions when back online
    for (const action of offlineQueue) {
      try {
        await action.execute();
        console.log('Processed offline action:', action.type);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
    setOfflineQueue([]);
  };

  const addToOfflineQueue = (action) => {
    setOfflineQueue(prev => [...prev, action]);
  };

  const dismissOfflineMessage = () => {
    setShowOfflineMessage(false);
  };

  const retryConnection = () => {
    // Trigger a connection check
    if (navigator.onLine) {
      setIsOnline(true);
      setShowOfflineMessage(false);
    }
  };

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-0 left-0 right-0 z-50 ${className}`}
          >
            <div className="glass-card bg-amber-100 border-amber-300 p-4 m-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    📡
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-amber-800">
                      You're offline
                    </h3>
                    <p className="text-sm text-amber-700">
                      Some features may not work. We'll sync your changes when you're back online.
                      {offlineQueue.length > 0 && (
                        <span className="ml-2 font-medium">
                          ({offlineQueue.length} actions queued)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={retryConnection}
                    className="glass-button-outlined text-amber-800 border-amber-400 hover:bg-amber-200"
                  >
                    🔄 Retry
                  </AnimatedButton>
                  <button
                    onClick={dismissOfflineMessage}
                    className="text-amber-600 hover:text-amber-800 p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Indicator (Small) */}
      <AnimatePresence>
        {!isOnline && !showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-4 right-4 z-40"
          >
            <div className="glass-card bg-red-100 border-red-300 p-3 rounded-full shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-red-700">
                  Offline
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Restored Notification */}
      <AnimatePresence>
        {isOnline && offlineQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 z-40"
          >
            <div className="glass-card bg-green-100 border-green-300 p-4 rounded-lg shadow-lg max-w-sm">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-semibold text-green-800">
                    Back online!
                  </h4>
                  <p className="text-sm text-green-700">
                    Syncing {offlineQueue.length} queued actions...
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for offline queue management
export function useOfflineQueue() {
  const [queue, setQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (action) => {
    if (!isOnline) {
      setQueue(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date(),
        ...action
      }]);
      return true; // Added to queue
    }
    return false; // Execute immediately
  };

  const processQueue = async () => {
    for (const action of queue) {
      try {
        await action.execute();
        console.log('Processed queued action:', action.type);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }
    setQueue([]);
  };

  return {
    isOnline,
    queueSize: queue.length,
    addToQueue,
    processQueue
  };
}

export default OfflineSupport;