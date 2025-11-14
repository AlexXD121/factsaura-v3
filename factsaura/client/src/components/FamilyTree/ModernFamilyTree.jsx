import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import ModernCard from '../UI/ModernCard';
import ConfidenceMeter from '../UI/ConfidenceMeter';

const ModernFamilyTree = ({ familyId, data }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);

  // Sample family tree data structure
  const sampleData = data || {
    id: 'family-1',
    rootNode: {
      id: 'root-1',
      title: 'Original Misinformation Post',
      content: 'Drinking bleach cures COVID-19',
      confidence: 0.95,
      generation: 0,
      mutations: 12,
      platform: 'Twitter',
      timestamp: '2024-01-15T10:00:00Z'
    },
    nodes: [
      {
        id: 'node-1',
        parentId: 'root-1',
        title: 'Mutation: Household Cleaners',
        content: 'Any household cleaner can cure COVID-19',
        confidence: 0.87,
        generation: 1,
        mutations: 8,
        platform: 'Facebook',
        timestamp: '2024-01-15T12:30:00Z',
        mutationType: 'generalization'
      },
      {
        id: 'node-2',
        parentId: 'root-1',
        title: 'Mutation: Specific Brand',
        content: 'Lysol spray cures COVID-19 instantly',
        confidence: 0.92,
        generation: 1,
        mutations: 5,
        platform: 'WhatsApp',
        timestamp: '2024-01-15T14:15:00Z',
        mutationType: 'specification'
      },
      {
        id: 'node-3',
        parentId: 'node-1',
        title: 'Mutation: Diluted Version',
        content: 'Diluted cleaning products are safe COVID cure',
        confidence: 0.78,
        generation: 2,
        mutations: 3,
        platform: 'Reddit',
        timestamp: '2024-01-16T09:20:00Z',
        mutationType: 'mitigation'
      }
    ],
    statistics: {
      totalNodes: 16,
      maxGeneration: 4,
      avgConfidence: 0.85,
      platforms: ['Twitter', 'Facebook', 'WhatsApp', 'Reddit', 'TikTok'],
      timespan: '5 days'
    }
  };

  const treeData = data || sampleData;

  const getMutationColor = (mutationType) => {
    const colors = {
      generalization: '#ef4444', // red
      specification: '#f59e0b', // amber
      mitigation: '#10b981', // emerald
      amplification: '#8b5cf6', // violet
      translation: '#06b6d4', // cyan
      platform_adaptation: '#f97316' // orange
    };
    return colors[mutationType] || '#6b7280';
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      Twitter: '🐦',
      Facebook: '📘',
      WhatsApp: '💬',
      Reddit: '🤖',
      TikTok: '🎵',
      Instagram: '📷',
      YouTube: '📺'
    };
    return icons[platform] || '🌐';
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const renderNode = (node, x, y, isRoot = false) => {
    const nodeRadius = isRoot ? 60 : 45;
    const confidence = node.confidence || 0;
    
    return (
      <g key={node.id} transform={`translate(${x}, ${y})`}>
        {/* Node Circle */}
        <motion.circle
          r={nodeRadius}
          fill={`url(#gradient-${node.id})`}
          stroke={confidence >= 0.8 ? '#ef4444' : confidence >= 0.6 ? '#f59e0b' : '#10b981'}
          strokeWidth={3}
          className="cursor-pointer"
          onClick={() => handleNodeClick(node)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Gradient Definition */}
        <defs>
          <radialGradient id={`gradient-${node.id}`}>
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor={confidence >= 0.8 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'} />
          </radialGradient>
        </defs>
        
        {/* Platform Icon */}
        <text
          x={0}
          y={-10}
          textAnchor="middle"
          fontSize="20"
          className="pointer-events-none"
        >
          {getPlatformIcon(node.platform)}
        </text>
        
        {/* Confidence Percentage */}
        <text
          x={0}
          y={8}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={confidence >= 0.8 ? '#dc2626' : '#059669'}
          className="pointer-events-none"
        >
          {Math.round(confidence * 100)}%
        </text>
        
        {/* Generation Badge */}
        <circle
          cx={nodeRadius - 15}
          cy={-nodeRadius + 15}
          r="12"
          fill="#3b82f6"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x={nodeRadius - 15}
          y={-nodeRadius + 20}
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="white"
          className="pointer-events-none"
        >
          G{node.generation}
        </text>
        
        {/* Mutation Count */}
        {node.mutations > 0 && (
          <>
            <circle
              cx={-nodeRadius + 15}
              cy={-nodeRadius + 15}
              r="12"
              fill="#f59e0b"
              stroke="white"
              strokeWidth="2"
            />
            <text
              x={-nodeRadius + 15}
              y={-nodeRadius + 20}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
              className="pointer-events-none"
            >
              {node.mutations}
            </text>
          </>
        )}
      </g>
    );
  };

  const renderConnection = (fromX, fromY, toX, toY, mutationType) => {
    const color = getMutationColor(mutationType);
    
    return (
      <motion.line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={color}
        strokeWidth="3"
        strokeDasharray="5,5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ModernCard className="p-6" variant="gradient">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Misinformation Family Tree
            </h2>
            <p className="text-gray-600 mt-1">
              Track how misinformation spreads and mutates across platforms
            </p>
          </div>
          
          {/* Statistics */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{treeData.statistics.totalNodes}</div>
              <div className="text-xs text-gray-500">Total Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{treeData.statistics.maxGeneration}</div>
              <div className="text-xs text-gray-500">Generations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.round(treeData.statistics.avgConfidence * 100)}%
              </div>
              <div className="text-xs text-gray-500">Avg Confidence</div>
            </div>
          </div>
        </div>
      </ModernCard>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tree Visualization */}
        <div className="lg:col-span-3">
          <ModernCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mutation Network
              </h3>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleZoom(0.1)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  🔍+
                </button>
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  🔍-
                </button>
                <button
                  onClick={() => {
                    setZoomLevel(1);
                    setPanOffset({ x: 0, y: 0 });
                  }}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  🎯
                </button>
              </div>
            </div>
            
            {/* SVG Tree */}
            <div className="bg-gray-50 rounded-xl overflow-hidden" style={{ height: '500px' }}>
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 800 500"
                className="cursor-move"
              >
                <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
                  {/* Connections */}
                  {treeData.nodes.map(node => {
                    const parent = node.parentId === 'root-1' ? treeData.rootNode : 
                      treeData.nodes.find(n => n.id === node.parentId);
                    if (!parent) return null;
                    
                    // Simple layout - you can implement more sophisticated algorithms
                    const parentX = parent.id === 'root-1' ? 400 : 200 + (parent.generation * 150);
                    const parentY = parent.id === 'root-1' ? 100 : 150 + (parent.generation * 100);
                    const nodeX = 200 + (node.generation * 150);
                    const nodeY = 150 + (node.generation * 100) + (treeData.nodes.indexOf(node) * 80);
                    
                    return renderConnection(parentX, parentY, nodeX, nodeY, node.mutationType);
                  })}
                  
                  {/* Root Node */}
                  {renderNode(treeData.rootNode, 400, 100, true)}
                  
                  {/* Child Nodes */}
                  {treeData.nodes.map((node, index) => {
                    const x = 200 + (node.generation * 150);
                    const y = 150 + (node.generation * 100) + (index * 80);
                    return renderNode(node, x, y);
                  })}
                </g>
              </svg>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Generalization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>Specification</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span>Mitigation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span>Amplification</span>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Node Details Panel */}
        <div className="space-y-6">
          {selectedNode ? (
            <ModernCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Node Details
              </h3>
              
              <div className="space-y-4">
                {/* Platform */}
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getPlatformIcon(selectedNode.platform)}</span>
                  <span className="font-medium">{selectedNode.platform}</span>
                </div>
                
                {/* Confidence */}
                <div className="text-center">
                  <ConfidenceMeter 
                    confidence={selectedNode.confidence}
                    size="md"
                    showLabel={true}
                  />
                </div>
                
                {/* Content */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Content</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedNode.content}
                  </p>
                </div>
                
                {/* Metadata */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Generation:</span>
                    <span className="font-medium">{selectedNode.generation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mutations:</span>
                    <span className="font-medium">{selectedNode.mutations || 0}</span>
                  </div>
                  {selectedNode.mutationType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium capitalize">
                        {selectedNode.mutationType.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium">
                      {new Date(selectedNode.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </ModernCard>
          ) : (
            <ModernCard className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👆</div>
                <p className="text-gray-500">
                  Click on a node to see details
                </p>
              </div>
            </ModernCard>
          )}
          
          {/* Platform Distribution */}
          <ModernCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Platform Distribution
            </h3>
            
            <div className="space-y-3">
              {treeData.statistics.platforms.map((platform, index) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{getPlatformIcon(platform)}</span>
                    <span className="text-sm font-medium">{platform}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">
                      {Math.floor(Math.random() * 20) + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default ModernFamilyTree;