// Demo Control Panel - Task 4.1
// Admin panel for managing demo data creation and scenarios

import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Using simple emoji icons instead of Heroicons for better compatibility
import GlassCard from '../UI/GlassCard';

const DemoControlPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const createDemoPosts = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await fetch('/api/demo/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastCreated(result.data);
        setStatistics(result.data.statistics);
      } else {
        setError(result.error?.message || 'Failed to create demo posts');
      }
    } catch (err) {
      setError('Error creating demo posts: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/demo/statistics');
      const result = await response.json();
      
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  React.useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Control Panel Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">📊</span>
            Demo Control Panel
          </h2>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Demo Ready</span>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6">
          Create and manage impressive demo content for FactSaura presentations. 
          This will generate 15 varied posts with different confidence levels and scenarios.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createDemoPosts}
            disabled={isCreating}
            className={`
              px-6 py-3 rounded-lg font-medium flex items-center space-x-2
              ${isCreating 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              transition-colors
            `}
          >
            {isCreating ? (
              <>
                <span className="text-lg animate-spin">🔄</span>
                <span>Creating Demo Posts...</span>
              </>
            ) : (
              <>
                <span className="text-lg">▶️</span>
                <span>Create Demo Posts</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchStatistics}
            className="px-6 py-3 rounded-lg font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center space-x-2"
          >
            <span className="text-lg">📊</span>
            <span>Refresh Stats</span>
          </motion.button>
        </div>
      </GlassCard>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <span className="text-2xl text-red-400 mr-3">❌</span>
              <div>
                <h3 className="text-red-400 font-medium">Error</h3>
                <p className="text-gray-300 text-sm">{error}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {lastCreated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <span className="text-2xl text-green-400 mr-3">✅</span>
              <div>
                <h3 className="text-green-400 font-medium">Demo Posts Created Successfully!</h3>
                <p className="text-gray-300 text-sm">
                  Created {lastCreated.created_count} out of {lastCreated.total_count} demo posts
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Statistics Display */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Demo Statistics</h3>
            
            {statistics.posts && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{statistics.posts.total_posts}</div>
                  <div className="text-sm text-gray-400">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{statistics.posts.misinformation_detected}</div>
                  <div className="text-sm text-gray-400">Misinformation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{statistics.posts.ai_generated_warnings}</div>
                  <div className="text-sm text-gray-400">AI Warnings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{statistics.posts.critical_urgency}</div>
                  <div className="text-sm text-gray-400">Critical</div>
                </div>
              </div>
            )}

            {statistics.demoReadiness && (
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Demo Readiness</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Total Content:</span>
                    <span className="text-white ml-2">{statistics.demoReadiness.totalDemoContent}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Detection Rate:</span>
                    <span className="text-white ml-2">{statistics.demoReadiness.misinformationCoverage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Crisis Scenarios:</span>
                    <span className="text-white ml-2">{statistics.demoReadiness.crisisScenarios}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">High Confidence:</span>
                    <span className="text-white ml-2">{statistics.demoReadiness.confidenceSpectrum?.high || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Medium Confidence:</span>
                    <span className="text-white ml-2">{statistics.demoReadiness.confidenceSpectrum?.medium || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Low Confidence:</span>
                    <span className="text-white ml-2">{statistics.demoReadiness.confidenceSpectrum?.low || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {/* Demo Scenarios Guide */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-4">Available Demo Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Crisis Misinformation (Mumbai floods, earthquakes)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Medical Misinformation (COVID cures, cancer)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Financial Scams (crypto, cash bans)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-300">AI-Generated Warnings</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Mutation Detection (Family Trees)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-300">Confidence Spectrum (15% - 99%)</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default DemoControlPanel;