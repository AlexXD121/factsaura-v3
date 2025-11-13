import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FamilyTree } from '../components/FamilyTree';
import { GlassCard, AnimatedButton } from '../components/UI';

const FamilyTreeDemo = () => {
  const [availableTrees, setAvailableTrees] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoData, setDemoData] = useState(null);

  // Create demo family tree data
  const createDemoTree = async () => {
    try {
      setLoading(true);
      
      // Create a demo family tree with original misinformation
      const originalContent = "Turmeric can cure COVID-19 completely within 24 hours";
      
      const response = await fetch('/api/family-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent,
          metadata: {
            source: 'Demo',
            category: 'medical_misinformation',
            severity: 'high'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const familyId = result.data.familyId;
        const rootNodeId = result.data.rootNodeId;

        // Add some demo mutations
        const mutations = [
          {
            content: "Turmeric and ginger can cure COVID-19 completely within 24 hours",
            mutationData: {
              mutationType: 'phrase_addition',
              confidence: 0.85,
              similarityScore: 0.92
            }
          },
          {
            content: "Turmeric can cure COVID-19 completely within 12 hours",
            mutationData: {
              mutationType: 'numerical_change',
              confidence: 0.78,
              similarityScore: 0.95
            }
          },
          {
            content: "Turmeric can cure coronavirus completely within 24 hours",
            mutationData: {
              mutationType: 'word_substitution',
              confidence: 0.82,
              similarityScore: 0.88
            }
          }
        ];

        // Add mutations to the tree
        for (const mutation of mutations) {
          await fetch(`/api/family-tree/${familyId}/mutations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              parentNodeId: rootNodeId,
              content: mutation.content,
              mutationData: mutation.mutationData
            })
          });
        }

        setSelectedFamilyId(familyId);
        setAvailableTrees([{ familyId, name: 'Turmeric COVID Cure Demo' }]);
      }
    } catch (error) {
      console.error('Error creating demo tree:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load demo on component mount
  useEffect(() => {
    createDemoTree();
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
                  Explore how the "Turmeric COVID cure" misinformation mutates
                </p>
              </div>
              <div className="flex gap-3">
                <AnimatedButton
                  onClick={createDemoTree}
                  disabled={loading}
                  variant="primary"
                >
                  {loading ? 'Creating...' : 'Create New Demo'}
                </AnimatedButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Family Tree Visualization */}
        {selectedFamilyId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FamilyTree
              familyId={selectedFamilyId}
              onNodeSelect={handleNodeSelect}
              showControls={true}
              autoRefresh={false}
              className="mb-8"
            />
          </motion.div>
        )}

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