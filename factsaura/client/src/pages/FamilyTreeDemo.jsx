import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ModernFamilyTree from '../components/FamilyTree/ModernFamilyTree';
import { GlassCard, AnimatedButton, SmartLoadingSkeleton } from '../components/UI';
import { demoAPI } from '../services/api';

const FamilyTreeDemo = () => {
  const [availableTrees, setAvailableTrees] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load demo family tree using the demo API
  const loadDemoTree = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the demo API to create the full family tree with 47 mutations
      const result = await demoAPI.createDemoFamilyTree();

      if (result.success) {
        const familyId = result.data.familyId;
        const totalNodes = result.data.totalNodes;

        setSelectedFamilyId(familyId);
        setAvailableTrees([{
          familyId,
          name: `Turmeric COVID Cure Demo (${totalNodes} nodes, ${result.data.maxDepth} generations)`
        }]);

        console.log('✅ Demo family tree loaded:', result.data);
      } else {
        throw new Error(result.error || 'Failed to create demo tree');
      }
    } catch (error) {
      console.error('Error loading demo tree:', error);
      setError(`Failed to load demo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load demo on component mount
  useEffect(() => {
    loadDemoTree();
  }, []);

  // Handle node selection
  const handleNodeSelect = (node) => {
    console.log('Selected node:', node);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-primary mb-4">
            🧬 Truth DNA Family Tree
          </h1>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Interactive visualization of how misinformation evolves and mutates across generations.
            Track the genealogy of fake news and understand mutation patterns.
          </p>
        </motion.div>

        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-primary mb-1">Demo Family Tree</h3>
                <p className="text-sm text-secondary">
                  Explore how the "Turmeric COVID cure" misinformation mutates across 47 variations
                </p>
                {availableTrees.length > 0 && (
                  <p className="text-xs text-info mt-1">
                    {availableTrees[0].name}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <AnimatedButton
                  onClick={loadDemoTree}
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? 'Loading...' : 'Create New Demo'}
                </AnimatedButton>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                <div className="text-red-800 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Family Tree Visualization */}
        {loading ? (
          <SmartLoadingSkeleton variant="card" count={3} />
        ) : selectedFamilyId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ModernFamilyTree
              familyId={selectedFamilyId}
              data={null} // Will use demo data
            />
          </motion.div>
        ) : null}

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <GlassCard className="p-6 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-primary mb-2">Mutation Tracking</h3>
            <p className="text-sm text-secondary">
              Visualize how misinformation changes and evolves through different variants
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-primary mb-2">Pattern Analysis</h3>
            <p className="text-sm text-secondary">
              Understand spread patterns and identify dominant mutation types
            </p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl mb-3">🌳</div>
            <h3 className="font-semibold text-primary mb-2">Interactive Tree</h3>
            <p className="text-sm text-secondary">
              Explore the genealogy with zoom, pan, and detailed node information
            </p>
          </GlassCard>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <GlassCard className="p-6">
            <h3 className="font-semibold text-primary mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-primary mb-2">Mutation Detection</h4>
                <ul className="space-y-1 text-secondary">
                  <li>• Semantic similarity analysis</li>
                  <li>• Pattern recognition algorithms</li>
                  <li>• Confidence scoring system</li>
                  <li>• Genealogy path tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-primary mb-2">Visualization Features</h4>
                <ul className="space-y-1 text-secondary">
                  <li>• Interactive SVG tree rendering</li>
                  <li>• Color-coded mutation types</li>
                  <li>• Zoom and pan controls</li>
                  <li>• Real-time statistics</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilyTreeDemo;