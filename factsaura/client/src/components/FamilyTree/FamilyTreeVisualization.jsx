import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../UI';

const FamilyTreeVisualization = ({ 
  familyId, 
  data, 
  onNodeClick, 
  onNodeHover,
  className = '',
  interactive = true,
  showLabels = true,
  showMetrics = true,
  layout = 'hierarchical'
}) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Process visualization data
  const { nodes, edges, levels, statistics } = useMemo(() => {
    if (!data?.visualizationData) {
      return { nodes: [], edges: [], levels: {}, statistics: {} };
    }
    return data.visualizationData;
  }, [data]);

  // Calculate layout positions
  const layoutData = useMemo(() => {
    if (!nodes.length) return { nodePositions: new Map(), dimensions: { width: 800, height: 600 } };

    const nodePositions = new Map();
    const levelHeight = 120;
    const nodeSpacing = 150;
    const startY = 50;
    
    // Group nodes by depth/level
    const nodesByLevel = {};
    nodes.forEach(node => {
      if (!nodesByLevel[node.depth]) {
        nodesByLevel[node.depth] = [];
      }
      nodesByLevel[node.depth].push(node);
    });

    // Calculate positions for each level
    Object.entries(nodesByLevel).forEach(([level, levelNodes]) => {
      const levelY = startY + (parseInt(level) * levelHeight);
      const totalWidth = (levelNodes.length - 1) * nodeSpacing;
      const startX = 400 - (totalWidth / 2); // Center horizontally

      levelNodes.forEach((node, index) => {
        const x = startX + (index * nodeSpacing);
        nodePositions.set(node.id, { x, y: levelY });
      });
    });

    // Calculate total dimensions
    const maxLevel = Math.max(...Object.keys(nodesByLevel).map(Number));
    const maxNodesInLevel = Math.max(...Object.values(nodesByLevel).map(arr => arr.length));
    
    const dimensions = {
      width: Math.max(800, maxNodesInLevel * nodeSpacing + 200),
      height: Math.max(600, (maxLevel + 1) * levelHeight + 100)
    };

    return { nodePositions, dimensions };
  }, [nodes]);

  // Update viewBox when layout changes
  useEffect(() => {
    if (layoutData.dimensions) {
      setViewBox({
        x: 0,
        y: 0,
        width: layoutData.dimensions.width,
        height: layoutData.dimensions.height
      });
    }
  }, [layoutData.dimensions]);

  // Handle node interactions
  const handleNodeClick = (node, event) => {
    event.stopPropagation();
    setSelectedNode(node.id === selectedNode?.id ? null : node);
    onNodeClick?.(node);
  };

  const handleNodeHover = (node, isHovering) => {
    if (!isMobile) { // Disable hover on mobile
      setHoveredNode(isHovering ? node : null);
      onNodeHover?.(node, isHovering);
    }
  };

  // Touch and pan handlers for mobile
  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      setIsPanning(true);
      setPanStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      });
    }
  };

  const handleTouchMove = (event) => {
    if (isPanning && event.touches.length === 1) {
      event.preventDefault();
      const deltaX = event.touches[0].clientX - panStart.x;
      const deltaY = event.touches[0].clientY - panStart.y;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - deltaX / zoom,
        y: prev.y - deltaY / zoom
      }));
      
      setPanStart({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Mouse handlers for desktop
  const handleMouseDown = (event) => {
    if (!isMobile && event.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleMouseMove = (event) => {
    if (isPanning && !isMobile) {
      event.preventDefault();
      const deltaX = event.clientX - panStart.x;
      const deltaY = event.clientY - panStart.y;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - deltaX / zoom,
        y: prev.y - deltaY / zoom
      }));
      
      setPanStart({
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isMobile) {
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
    } else {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      if (container) {
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [isPanning, panStart, zoom, isMobile]);

  // Get node color based on type and properties
  const getNodeColor = (node) => {
    if (node.type === 'original') return '#DC2626'; // Red for original
    
    const mutationColors = {
      'word_substitution': '#F97316', // Orange
      'phrase_addition': '#EAB308', // Yellow
      'context_shift': '#84CC16', // Lime
      'emotional_amplification': '#EF4444', // Red
      'source_modification': '#EC4899', // Pink
      'numerical_change': '#8B5CF6', // Purple
      'location_change': '#10B981', // Emerald
      'time_shift': '#3B82F6', // Blue
      'default': '#6B7280' // Gray
    };
    
    return mutationColors[node.mutationType] || mutationColors.default;
  };

  // Get node size based on properties
  const getNodeSize = (node) => {
    const baseSize = 20;
    const childrenBonus = Math.min(node.childrenCount * 3, 20);
    const confidenceBonus = (node.confidence || 0) * 10;
    return Math.max(baseSize + childrenBonus + confidenceBonus, 15);
  };

  // Render connection lines
  const renderEdges = () => {
    return edges.map((edge, index) => {
      const fromPos = layoutData.nodePositions.get(edge.from);
      const toPos = layoutData.nodePositions.get(edge.to);
      
      if (!fromPos || !toPos) return null;

      const isHighlighted = selectedNode?.id === edge.from || selectedNode?.id === edge.to ||
                           hoveredNode?.id === edge.from || hoveredNode?.id === edge.to;

      return (
        <motion.line
          key={`edge-${index}`}
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke={isHighlighted ? '#3B82F6' : '#CBD5E1'}
          strokeWidth={isHighlighted ? 3 : 2}
          strokeOpacity={isHighlighted ? 0.8 : 0.4}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: isHighlighted ? 0.8 : 0.4 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        />
      );
    });
  };

  // Render tree nodes
  const renderNodes = () => {
    return nodes.map((node, index) => {
      const position = layoutData.nodePositions.get(node.id);
      if (!position) return null;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      const nodeSize = getNodeSize(node);
      const nodeColor = getNodeColor(node);

      return (
        <g key={node.id}>
          {/* Node circle */}
          <motion.circle
            cx={position.x}
            cy={position.y}
            r={isMobile ? Math.max(nodeSize, 15) : nodeSize} // Minimum size for touch
            fill={nodeColor}
            stroke={isSelected ? '#1D4ED8' : isHovered ? '#3B82F6' : '#FFFFFF'}
            strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
            opacity={0.9}
            style={{ 
              cursor: interactive ? 'pointer' : 'default',
              touchAction: 'manipulation' // Optimize for touch
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            whileHover={interactive && !isMobile ? { scale: 1.2 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={interactive ? (e) => handleNodeClick(node, e) : undefined}
            onMouseEnter={interactive && !isMobile ? () => handleNodeHover(node, true) : undefined}
            onMouseLeave={interactive && !isMobile ? () => handleNodeHover(node, false) : undefined}
          />
          
          {/* Node label */}
          {showLabels && (
            <motion.text
              x={position.x}
              y={position.y + nodeSize + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#1E293B"
              fontWeight="500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
            >
              {node.label}
            </motion.text>
          )}
          
          {/* Generation indicator */}
          <motion.text
            x={position.x}
            y={position.y + 4}
            textAnchor="middle"
            fontSize="10"
            fill="#FFFFFF"
            fontWeight="600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
          >
            {node.generation}
          </motion.text>
        </g>
      );
    });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetZoom = () => {
    setZoom(1);
    setViewBox({ x: 0, y: 0, width: layoutData.dimensions.width, height: layoutData.dimensions.height });
  };

  // Pinch-to-zoom for mobile
  const handleWheel = (event) => {
    if (!isMobile) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.3), 3));
    }
  };

  if (!data || !nodes.length) {
    return (
      <GlassCard className={`p-8 text-center ${className}`}>
        <div className="text-secondary">
          {!data ? 'Loading family tree...' : 'No family tree data available'}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <GlassCard className="p-4">
        {/* Header with metrics */}
        {showMetrics && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-semibold text-primary">
                  Truth DNA Family Tree
                </h3>
                <div className="text-sm text-secondary">
                  {statistics.totalNodes || nodes.length} mutations • {(statistics.maxDepth || 0) + 1} generations
                </div>
              </div>
              
              {/* Zoom controls - Touch Friendly */}
              <div className="flex gap-2">
                <motion.button
                  onClick={handleZoomOut}
                  whileTap={{ scale: 0.95 }}
                  className={`${isMobile ? 'min-h-[44px] min-w-[44px]' : 'px-3 py-1'} text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors touch-manipulation flex items-center justify-center`}
                >
                  <span className="text-lg">−</span>
                </motion.button>
                <motion.button
                  onClick={handleResetZoom}
                  whileTap={{ scale: 0.95 }}
                  className={`${isMobile ? 'min-h-[44px] px-3' : 'px-3 py-1'} text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors touch-manipulation flex items-center justify-center`}
                >
                  <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
                </motion.button>
                <motion.button
                  onClick={handleZoomIn}
                  whileTap={{ scale: 0.95 }}
                  className={`${isMobile ? 'min-h-[44px] min-w-[44px]' : 'px-3 py-1'} text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors touch-manipulation flex items-center justify-center`}
                >
                  <span className="text-lg">+</span>
                </motion.button>
              </div>
            </div>

            {/* Tree Statistics */}
            {statistics.mutationTypeDistribution && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-white/5 rounded-lg p-3">
                <div className="text-center">
                  <div className="font-semibold text-primary">{nodes.length}</div>
                  <div className="text-secondary">Total Nodes</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary">{(statistics.maxDepth || 0) + 1}</div>
                  <div className="text-secondary">Generations</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary">{Object.keys(statistics.mutationTypeDistribution).length}</div>
                  <div className="text-secondary">Mutation Types</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-primary">{edges.length}</div>
                  <div className="text-secondary">Connections</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SVG Tree Visualization - Mobile Optimized */}
        <div 
          ref={containerRef}
          className={`w-full ${isMobile ? 'h-80' : 'h-96'} overflow-hidden border border-white/20 rounded-lg bg-white/5 relative ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {/* Mobile Instructions */}
          {isMobile && (
            <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Tap nodes • Pinch to zoom • Drag to pan
            </div>
          )}
          
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'center',
              touchAction: 'none' // Prevent default touch behaviors
            }}
            className="w-full h-full"
          >
            {/* Background grid */}
            <defs>
              <pattern
                id="grid"
                width="50"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  opacity="0.3"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Render edges first (behind nodes) */}
            <g className="edges">
              {renderEdges()}
            </g>
            
            {/* Render nodes */}
            <g className="nodes">
              {renderNodes()}
            </g>
          </svg>
        </div>

        {/* Mutation Type Legend */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-primary mb-2">Mutation Types</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Original</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Word Substitution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Phrase Addition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-lime-500"></div>
              <span>Context Shift</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Emotional Amplification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
              <span>Source Modification</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Numerical Change</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Location Change</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Node Details Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-0 right-0 w-80 ml-4"
          >
            <GlassCard className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-primary">Node Details</h4>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-secondary hover:text-primary"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedNode.type}
                </div>
                <div>
                  <span className="font-medium">Generation:</span> {selectedNode.generation}
                </div>
                <div>
                  <span className="font-medium">Children:</span> {selectedNode.childrenCount}
                </div>
                {selectedNode.mutationType && (
                  <div>
                    <span className="font-medium">Mutation:</span> {selectedNode.mutationType}
                  </div>
                )}
                {selectedNode.confidence && (
                  <div>
                    <span className="font-medium">Confidence:</span> {Math.round(selectedNode.confidence * 100)}%
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FamilyTreeVisualization;