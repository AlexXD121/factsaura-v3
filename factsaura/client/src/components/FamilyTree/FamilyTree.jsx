import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, LoadingSkeleton } from '../UI';
import FamilyTreeVisualization from './FamilyTreeVisualization';
import { familyTreeAPI } from '../../services/api';

const FamilyTree = ({ 
  familyId, 
  className = '',
  onNodeSelect,
  showControls = true,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'statistics', 'patterns'

  // Fetch family tree data
  const fetchFamilyTree = async () => {
    if (!familyId) {
      setError('No family ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🌳 Fetching family tree:', familyId);
      
      // Get family tree with metrics and visualization data
      const result = await familyTreeAPI.getFamilyTree(familyId);
      
      if (result.success) {
        console.log('✅ Family tree loaded:', result.data);
        setTreeData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load family tree');
      }
    } catch (err) {
      console.error('❌ Error fetching family tree:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchFamilyTree();
  }, [familyId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !familyId) return;

    const interval = setInterval(fetchFamilyTree, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, familyId]);

  // Handle node selection
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  };

  // Handle node hover for additional info
  const handleNodeHover = (node, isHovering) => {
    // Could show tooltip or preview info
  };

  // Render loading state
  if (loading) {
    return (
      <div className={className}>
        <GlassCard className="p-6">
          <div className="space-y-4">
            <LoadingSkeleton className="h-8 w-64" />
            <LoadingSkeleton className="h-96 w-full" />
            <div className="flex gap-4">
              <LoadingSkeleton className="h-4 w-20" />
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-4 w-16" />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={className}>
        <GlassCard className="p-6 text-center" variant="danger">
          <div className="text-danger mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold">Failed to Load Family Tree</h3>
          </div>
          <p className="text-secondary mb-4">{error}</p>
          <button
            onClick={fetchFamilyTree}
            className="glass-button"
          >
            Try Again
          </button>
        </GlassCard>
      </div>
    );
  }

  // Render statistics view
  const renderStatistics = () => {
    if (!treeData?.treeMetrics && !treeData?.visualizationData?.statistics) return null;

    // Use either treeMetrics or visualizationData.statistics
    const metrics = treeData.treeMetrics || {};
    const vizStats = treeData.visualizationData?.statistics || {};
    const genealogyAnalysis = treeData.genealogyAnalysis || {};

    // Calculate statistics from available data
    const totalNodes = metrics.totalNodes || vizStats.totalNodes || 0;
    const maxDepth = metrics.maxDepth || vizStats.maxDepth || 0;
    const leafNodes = metrics.leafNodes || 0;
    const avgBranching = metrics.averageBranchingFactor || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <h4 className="font-semibold text-primary mb-2">Tree Structure</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Nodes:</span>
              <span className="font-medium">{totalNodes}</span>
            </div>
            <div className="flex justify-between">
              <span>Max Depth:</span>
              <span className="font-medium">{maxDepth}</span>
            </div>
            <div className="flex justify-between">
              <span>Generations:</span>
              <span className="font-medium">{maxDepth + 1}</span>
            </div>
            {leafNodes > 0 && (
              <div className="flex justify-between">
                <span>Leaf Nodes:</span>
                <span className="font-medium">{leafNodes}</span>
              </div>
            )}
            {avgBranching > 0 && (
              <div className="flex justify-between">
                <span>Avg Branching:</span>
                <span className="font-medium">{avgBranching.toFixed(1)}</span>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold text-primary mb-2">Mutation Analysis</h4>
          <div className="space-y-2 text-sm">
            {vizStats.mutationTypeDistribution && Object.entries(vizStats.mutationTypeDistribution).slice(0, 4).map(([type, count], index) => (
              <div key={index} className="flex justify-between">
                <span className="capitalize">{type.replace('_', ' ')}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {!vizStats.mutationTypeDistribution && (
              <div className="text-secondary text-center py-2">
                Mutation analysis available after tree creation
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h4 className="font-semibold text-primary mb-2">Evolution Metrics</h4>
          <div className="space-y-2 text-sm">
            {genealogyAnalysis.dominantMutationTypes?.slice(0, 3).map((mutation, index) => (
              <div key={index} className="flex justify-between">
                <span className="capitalize">{mutation.type.replace('_', ' ')}:</span>
                <span className="font-medium">{mutation.percentage?.toFixed(1)}%</span>
              </div>
            )) || (
              <>
                <div className="flex justify-between">
                  <span>Complexity:</span>
                  <span className="font-medium">High</span>
                </div>
                <div className="flex justify-between">
                  <span>Spread Rate:</span>
                  <span className="font-medium">Viral</span>
                </div>
                <div className="flex justify-between">
                  <span>Mutation Rate:</span>
                  <span className="font-medium">Active</span>
                </div>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    );
  };

  // Render patterns view
  const renderPatterns = () => {
    if (!treeData?.genealogyAnalysis?.spreadPattern) return null;

    const { spreadPattern } = treeData.genealogyAnalysis;

    return (
      <div className="space-y-4">
        <GlassCard className="p-4">
          <h4 className="font-semibold text-primary mb-4">Spread Pattern Analysis</h4>
          
          {/* Spread by level chart */}
          <div className="space-y-3">
            <h5 className="font-medium text-secondary">Mutations by Generation</h5>
            {spreadPattern.spreadByLevel?.map((level, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm w-16">Gen {level.level}:</span>
                <div className="flex-1 bg-white/10 rounded-full h-4 relative">
                  <motion.div
                    className="bg-blue-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(level.nodeCount / Math.max(...spreadPattern.spreadByLevel.map(l => l.nodeCount))) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
                <span className="text-sm w-8">{level.nodeCount}</span>
              </div>
            ))}
          </div>

          {/* Peak spread info */}
          {spreadPattern.peakSpreadLevel && (
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Peak Spread:</span> Generation {spreadPattern.peakSpreadLevel.level} 
                with {spreadPattern.peakSpreadLevel.nodeCount} mutations
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Controls */}
      {showControls && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'tree' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-secondary hover:bg-white/20'
              }`}
            >
              Tree View
            </button>
            <button
              onClick={() => setViewMode('statistics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'statistics' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-secondary hover:bg-white/20'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setViewMode('patterns')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'patterns' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-secondary hover:bg-white/20'
              }`}
            >
              Patterns
            </button>
          </div>

          <button
            onClick={fetchFamilyTree}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      )}

      {/* Content based on view mode */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'tree' && (
          <FamilyTreeVisualization
            familyId={familyId}
            data={treeData}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            interactive={true}
            showLabels={true}
            showMetrics={true}
          />
        )}

        {viewMode === 'statistics' && renderStatistics()}
        {viewMode === 'patterns' && renderPatterns()}
      </motion.div>

      {/* Family Tree Info */}
      {treeData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <GlassCard className="p-4" variant="subtle">
            <div className="flex justify-between items-center text-sm text-secondary">
              <div>
                Family ID: <span className="font-mono">{familyId}</span>
              </div>
              <div>
                Last Updated: {new Date(treeData.lastUpdated).toLocaleString()}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default FamilyTree;