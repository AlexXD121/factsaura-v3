// Family Tree Demo Data - Task 2.2
// Creates sample misinformation family tree data with "Turmeric COVID cure" example
// Includes 47 mutations across 8 mutation types with generation tracking

const crypto = require('crypto');

class FamilyTreeDemoData {
  constructor() {
    this.mutationTypes = {
      WORD_SUBSTITUTION: 'word_substitution',
      PHRASE_ADDITION: 'phrase_addition', 
      CONTEXT_SHIFT: 'context_shift',
      EMOTIONAL_AMPLIFICATION: 'emotional_amplification',
      SOURCE_MODIFICATION: 'source_modification',
      NUMERICAL_CHANGE: 'numerical_change',
      LOCATION_CHANGE: 'location_change',
      TIME_SHIFT: 'time_shift'
    };

    this.mutationColors = {
      [this.mutationTypes.WORD_SUBSTITUTION]: '#F97316', // Orange
      [this.mutationTypes.PHRASE_ADDITION]: '#EAB308', // Yellow
      [this.mutationTypes.CONTEXT_SHIFT]: '#84CC16', // Lime
      [this.mutationTypes.EMOTIONAL_AMPLIFICATION]: '#EF4444', // Red
      [this.mutationTypes.SOURCE_MODIFICATION]: '#EC4899', // Pink
      [this.mutationTypes.NUMERICAL_CHANGE]: '#8B5CF6', // Purple
      [this.mutationTypes.LOCATION_CHANGE]: '#10B981', // Emerald
      [this.mutationTypes.TIME_SHIFT]: '#3B82F6' // Blue
    };
  }

  /**
   * Generate the complete Turmeric COVID cure family tree with 47 mutations
   */
  generateTurmericCovidFamilyTree() {
    const familyId = 'demo-turmeric-covid-family';
    const rootNodeId = 'root-turmeric-original';
    const timestamp = new Date().toISOString();

    // Original misinformation (Generation 0)
    const originalContent = "Turmeric can cure COVID-19 completely within 24 hours";
    
    const familyTree = {
      familyId,
      rootNodeId,
      createdAt: timestamp,
      lastUpdated: timestamp,
      treeMetrics: {
        totalNodes: 48, // 1 original + 47 mutations
        maxDepth: 4,
        totalBranches: 12,
        averageBranchingFactor: 3.2,
        leafNodes: 23,
        activeNodes: 48
      },
      genealogyAnalysis: {
        dominantMutationTypes: [
          { type: this.mutationTypes.EMOTIONAL_AMPLIFICATION, count: 12, percentage: 25.5 },
          { type: this.mutationTypes.NUMERICAL_CHANGE, count: 9, percentage: 19.1 },
          { type: this.mutationTypes.PHRASE_ADDITION, count: 8, percentage: 17.0 },
          { type: this.mutationTypes.WORD_SUBSTITUTION, count: 7, percentage: 14.9 },
          { type: this.mutationTypes.SOURCE_MODIFICATION, count: 5, percentage: 10.6 },
          { type: this.mutationTypes.LOCATION_CHANGE, count: 3, percentage: 6.4 },
          { type: this.mutationTypes.CONTEXT_SHIFT, count: 2, percentage: 4.3 },
          { type: this.mutationTypes.TIME_SHIFT, count: 1, percentage: 2.1 }
        ],
        evolutionPatterns: [
          'Rapid emotional amplification in first generation',
          'Numerical claims become more extreme over generations',
          'Geographic specificity increases with mutations',
          'Authority sources become more elaborate'
        ],
        spreadAnalysis: {
          totalReach: 15420,
          spreadVelocity: 2.3,
          viralityScore: 0.87
        }
      }
    };

    // Generate all nodes and their relationships
    const { nodes, edges } = this.generateAllMutations();

    // Create visualization data
    const visualizationData = {
      nodes: nodes.map(node => ({
        id: node.nodeId,
        label: this.truncateContent(node.content, 20),
        type: node.nodeType,
        generation: node.generation,
        depth: node.depth,
        mutationType: node.mutationType,
        confidence: node.confidence,
        childrenCount: node.children ? node.children.size || node.children.length : 0,
        color: node.nodeType === 'original' ? '#DC2626' : this.mutationColors[node.mutationType],
        size: this.calculateNodeSize(node)
      })),
      edges: edges,
      levels: this.calculateLevels(nodes),
      statistics: {
        totalNodes: nodes.length,
        maxDepth: Math.max(...nodes.map(n => n.depth)),
        mutationTypeDistribution: this.calculateMutationDistribution(nodes)
      }
    };

    return {
      ...familyTree,
      nodes,
      edges,
      visualizationData
    };
  }

  /**
   * Generate all 47 mutations across 4 generations
   */
  generateAllMutations() {
    const nodes = [];
    const edges = [];

    // Root node (Generation 0)
    const rootNode = {
      nodeId: 'root-turmeric-original',
      familyId: 'demo-turmeric-covid-family',
      content: "Turmeric can cure COVID-19 completely within 24 hours",
      nodeType: 'original',
      generation: 0,
      depth: 0,
      parentId: null,
      children: new Set(),
      confidence: 1.0,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
    };
    nodes.push(rootNode);

    // Generation 1 mutations (12 direct children from root)
    const gen1Mutations = this.generateGeneration1Mutations();
    gen1Mutations.forEach(mutation => {
      nodes.push(mutation);
      edges.push({
        from: rootNode.nodeId,
        to: mutation.nodeId,
        type: 'parent_child'
      });
      rootNode.children.add(mutation.nodeId);
    });

    // Generation 2 mutations (20 children from gen1)
    const gen2Mutations = this.generateGeneration2Mutations(gen1Mutations);
    gen2Mutations.forEach(mutation => {
      nodes.push(mutation);
      edges.push({
        from: mutation.parentId,
        to: mutation.nodeId,
        type: 'parent_child'
      });
      // Add to parent's children
      const parent = nodes.find(n => n.nodeId === mutation.parentId);
      if (parent) {
        parent.children.add(mutation.nodeId);
      }
    });

    // Generation 3 mutations (12 children from gen2)
    const gen3Mutations = this.generateGeneration3Mutations(gen2Mutations);
    gen3Mutations.forEach(mutation => {
      nodes.push(mutation);
      edges.push({
        from: mutation.parentId,
        to: mutation.nodeId,
        type: 'parent_child'
      });
      // Add to parent's children
      const parent = nodes.find(n => n.nodeId === mutation.parentId);
      if (parent) {
        parent.children.add(mutation.nodeId);
      }
    });

    // Generation 4 mutations (3 children from gen3)
    const gen4Mutations = this.generateGeneration4Mutations(gen3Mutations);
    gen4Mutations.forEach(mutation => {
      nodes.push(mutation);
      edges.push({
        from: mutation.parentId,
        to: mutation.nodeId,
        type: 'parent_child'
      });
      // Add to parent's children
      const parent = nodes.find(n => n.nodeId === mutation.parentId);
      if (parent) {
        parent.children.add(mutation.nodeId);
      }
    });

    return { nodes, edges };
  }

  /**
   * Generate Generation 1 mutations (12 direct children from root)
   */
  generateGeneration1Mutations() {
    const baseTime = Date.now() - 6 * 24 * 60 * 60 * 1000; // 6 days ago
    
    return [
      // Emotional amplification mutations
      {
        nodeId: 'gen1-emotional-1',
        content: "URGENT: Turmeric can cure COVID-19 completely within 24 hours!",
        mutationType: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.92, children: new Set(),
        createdAt: new Date(baseTime + 1 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-emotional-2', 
        content: "BREAKING: Turmeric can cure COVID-19 completely within 24 hours - SHARE NOW!",
        mutationType: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.89, children: new Set(),
        createdAt: new Date(baseTime + 2 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-emotional-3',
        content: "SHOCKING TRUTH: Turmeric can cure COVID-19 completely within 24 hours",
        mutationType: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.87, children: new Set(),
        createdAt: new Date(baseTime + 3 * 60 * 60 * 1000).toISOString()
      },

      // Numerical change mutations
      {
        nodeId: 'gen1-numerical-1',
        content: "Turmeric can cure COVID-19 completely within 12 hours",
        mutationType: this.mutationTypes.NUMERICAL_CHANGE,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.85, children: new Set(),
        createdAt: new Date(baseTime + 4 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-numerical-2',
        content: "Turmeric can cure COVID-19 completely within 6 hours",
        mutationType: this.mutationTypes.NUMERICAL_CHANGE,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.83, children: new Set(),
        createdAt: new Date(baseTime + 5 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-numerical-3',
        content: "Turmeric can cure COVID-19 completely within 48 hours",
        mutationType: this.mutationTypes.NUMERICAL_CHANGE,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.81, children: new Set(),
        createdAt: new Date(baseTime + 6 * 60 * 60 * 1000).toISOString()
      },

      // Phrase addition mutations
      {
        nodeId: 'gen1-addition-1',
        content: "Turmeric and ginger can cure COVID-19 completely within 24 hours",
        mutationType: this.mutationTypes.PHRASE_ADDITION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.88, children: new Set(),
        createdAt: new Date(baseTime + 7 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-addition-2',
        content: "Turmeric with honey can cure COVID-19 completely within 24 hours",
        mutationType: this.mutationTypes.PHRASE_ADDITION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.86, children: new Set(),
        createdAt: new Date(baseTime + 8 * 60 * 60 * 1000).toISOString()
      },

      // Word substitution mutations
      {
        nodeId: 'gen1-substitution-1',
        content: "Turmeric can cure coronavirus completely within 24 hours",
        mutationType: this.mutationTypes.WORD_SUBSTITUTION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.90, children: new Set(),
        createdAt: new Date(baseTime + 9 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-substitution-2',
        content: "Turmeric can heal COVID-19 completely within 24 hours",
        mutationType: this.mutationTypes.WORD_SUBSTITUTION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.84, children: new Set(),
        createdAt: new Date(baseTime + 10 * 60 * 60 * 1000).toISOString()
      },

      // Source modification mutations
      {
        nodeId: 'gen1-source-1',
        content: "Scientists confirm: Turmeric can cure COVID-19 completely within 24 hours",
        mutationType: this.mutationTypes.SOURCE_MODIFICATION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.91, children: new Set(),
        createdAt: new Date(baseTime + 11 * 60 * 60 * 1000).toISOString()
      },
      {
        nodeId: 'gen1-source-2',
        content: "Doctors discover: Turmeric can cure COVID-19 completely within 24 hours",
        mutationType: this.mutationTypes.SOURCE_MODIFICATION,
        generation: 1, depth: 1, parentId: 'root-turmeric-original',
        confidence: 0.89, children: new Set(),
        createdAt: new Date(baseTime + 12 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Generate Generation 2 mutations (20 children from gen1)
   */
  generateGeneration2Mutations(gen1Parents) {
    const baseTime = Date.now() - 5 * 24 * 60 * 60 * 1000; // 5 days ago
    const mutations = [];
    let mutationIndex = 0;

    // Distribute children across gen1 parents (some parents have more children)
    const childDistribution = [3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1]; // Total: 20

    gen1Parents.forEach((parent, parentIndex) => {
      const childCount = childDistribution[parentIndex] || 0;
      
      for (let i = 0; i < childCount; i++) {
        mutationIndex++;
        const mutation = this.generateGen2Mutation(parent, mutationIndex, baseTime);
        mutations.push(mutation);
      }
    });

    return mutations;
  }

  generateGen2Mutation(parent, index, baseTime) {
    const mutationTypes = Object.values(this.mutationTypes);
    const randomType = mutationTypes[index % mutationTypes.length];
    
    const mutations = {
      [this.mutationTypes.EMOTIONAL_AMPLIFICATION]: [
        "CRITICAL ALERT: Turmeric MIRACLE cure destroys COVID-19 in hours!",
        "DOCTORS HATE THIS: Turmeric eliminates COVID-19 instantly!",
        "LIFE-SAVING SECRET: Turmeric obliterates COVID-19 completely!"
      ],
      [this.mutationTypes.NUMERICAL_CHANGE]: [
        "Turmeric can cure COVID-19 completely within 2 hours",
        "Turmeric can cure COVID-19 completely within 30 minutes", 
        "Turmeric can cure COVID-19 completely within 1 hour"
      ],
      [this.mutationTypes.PHRASE_ADDITION]: [
        "Turmeric with black pepper can cure COVID-19 completely within 24 hours",
        "Organic turmeric powder can cure COVID-19 completely within 24 hours",
        "Fresh turmeric root can cure COVID-19 completely within 24 hours"
      ],
      [this.mutationTypes.WORD_SUBSTITUTION]: [
        "Turmeric can eliminate COVID-19 completely within 24 hours",
        "Turmeric can destroy COVID-19 completely within 24 hours",
        "Turmeric can remove COVID-19 completely within 24 hours"
      ],
      [this.mutationTypes.SOURCE_MODIFICATION]: [
        "Harvard study proves: Turmeric can cure COVID-19 completely within 24 hours",
        "WHO confirms: Turmeric can cure COVID-19 completely within 24 hours",
        "Medical experts reveal: Turmeric can cure COVID-19 completely within 24 hours"
      ],
      [this.mutationTypes.LOCATION_CHANGE]: [
        "Mumbai doctors confirm: Turmeric can cure COVID-19 completely within 24 hours",
        "Delhi researchers find: Turmeric can cure COVID-19 completely within 24 hours",
        "Bangalore scientists prove: Turmeric can cure COVID-19 completely within 24 hours"
      ],
      [this.mutationTypes.CONTEXT_SHIFT]: [
        "Ancient Ayurvedic wisdom: Turmeric can cure COVID-19 completely within 24 hours",
        "Traditional Indian medicine: Turmeric can cure COVID-19 completely within 24 hours"
      ],
      [this.mutationTypes.TIME_SHIFT]: [
        "Recent breakthrough: Turmeric can cure COVID-19 completely within 24 hours"
      ]
    };

    const contentOptions = mutations[randomType] || [parent.content + " (enhanced)"];
    const content = contentOptions[index % contentOptions.length];

    return {
      nodeId: `gen2-${randomType}-${index}`,
      content,
      mutationType: randomType,
      generation: 2,
      depth: 2,
      parentId: parent.nodeId,
      confidence: Math.max(0.6, parent.confidence - 0.1 - Math.random() * 0.1),
      children: new Set(),
      createdAt: new Date(baseTime + index * 30 * 60 * 1000).toISOString() // 30 min intervals
    };
  }

  /**
   * Generate Generation 3 mutations (12 children from gen2)
   */
  generateGeneration3Mutations(gen2Parents) {
    const baseTime = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
    const mutations = [];
    
    // Select 12 parents from gen2 (some may have multiple children)
    const selectedParents = gen2Parents.slice(0, 12);
    
    selectedParents.forEach((parent, index) => {
      const mutation = {
        nodeId: `gen3-mutation-${index + 1}`,
        content: this.generateGen3Content(parent, index),
        mutationType: this.selectMutationType(parent.mutationType),
        generation: 3,
        depth: 3,
        parentId: parent.nodeId,
        confidence: Math.max(0.5, parent.confidence - 0.15),
        children: new Set(),
        createdAt: new Date(baseTime + index * 60 * 60 * 1000).toISOString() // 1 hour intervals
      };
      mutations.push(mutation);
    });

    return mutations;
  }

  /**
   * Generate Generation 4 mutations (3 final children)
   */
  generateGeneration4Mutations(gen3Parents) {
    const baseTime = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1 day ago
    const mutations = [];
    
    // Select 3 parents from gen3 for final mutations
    const selectedParents = gen3Parents.slice(0, 3);
    
    selectedParents.forEach((parent, index) => {
      const mutation = {
        nodeId: `gen4-final-${index + 1}`,
        content: this.generateGen4Content(parent, index),
        mutationType: this.mutationTypes.EMOTIONAL_AMPLIFICATION, // Final mutations are highly emotional
        generation: 4,
        depth: 4,
        parentId: parent.nodeId,
        confidence: Math.max(0.4, parent.confidence - 0.2),
        children: new Set(),
        createdAt: new Date(baseTime + index * 4 * 60 * 60 * 1000).toISOString() // 4 hour intervals
      };
      mutations.push(mutation);
    });

    return mutations;
  }

  generateGen3Content(parent, index) {
    const templates = [
      "GOVERNMENT HIDING TRUTH: Turmeric INSTANTLY destroys COVID-19 - Big Pharma PANICKING!",
      "MIRACLE BREAKTHROUGH: Golden turmeric powder ELIMINATES COVID-19 in minutes!",
      "ANCIENT SECRET REVEALED: Turmeric milk ANNIHILATES COVID-19 completely!",
      "DOCTORS SHOCKED: Simple turmeric recipe CURES COVID-19 faster than vaccines!",
      "VIRAL TRUTH: Turmeric tea OBLITERATES COVID-19 - Share before it's BANNED!",
      "MEDICAL REVOLUTION: Turmeric capsules DESTROY COVID-19 in record time!",
      "SUPPRESSED STUDY: Turmeric paste ELIMINATES COVID-19 symptoms instantly!",
      "BREAKING DISCOVERY: Turmeric juice NEUTRALIZES COVID-19 completely!",
      "FORBIDDEN KNOWLEDGE: Turmeric oil VAPORIZES COVID-19 in hours!",
      "URGENT UPDATE: Turmeric smoothie ERADICATES COVID-19 permanently!",
      "CLASSIFIED INFO: Turmeric extract DISSOLVES COVID-19 particles!",
      "LEAKED RESEARCH: Turmeric powder INCINERATES COVID-19 virus!"
    ];
    
    return templates[index % templates.length];
  }

  generateGen4Content(parent, index) {
    const finalMutations = [
      "🚨 FINAL WARNING 🚨 TURMERIC SUPER-CURE DESTROYS COVID-19 IN SECONDS - GOVERNMENT TRYING TO STOP THIS MESSAGE!!!",
      "⚡ ULTIMATE TRUTH ⚡ GOLDEN TURMERIC MIRACLE VAPORIZES COVID-19 INSTANTLY - SHARE BEFORE DELETION!!!",
      "🔥 LAST CHANCE 🔥 SACRED TURMERIC FORMULA ANNIHILATES COVID-19 FOREVER - BIG PHARMA TERRIFIED!!!"
    ];
    
    return finalMutations[index];
  }

  selectMutationType(parentType) {
    // Mutation evolution patterns
    const evolutionMap = {
      [this.mutationTypes.EMOTIONAL_AMPLIFICATION]: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
      [this.mutationTypes.NUMERICAL_CHANGE]: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
      [this.mutationTypes.PHRASE_ADDITION]: this.mutationTypes.SOURCE_MODIFICATION,
      [this.mutationTypes.WORD_SUBSTITUTION]: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
      [this.mutationTypes.SOURCE_MODIFICATION]: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
      [this.mutationTypes.LOCATION_CHANGE]: this.mutationTypes.SOURCE_MODIFICATION,
      [this.mutationTypes.CONTEXT_SHIFT]: this.mutationTypes.EMOTIONAL_AMPLIFICATION,
      [this.mutationTypes.TIME_SHIFT]: this.mutationTypes.EMOTIONAL_AMPLIFICATION
    };
    
    return evolutionMap[parentType] || this.mutationTypes.EMOTIONAL_AMPLIFICATION;
  }

  truncateContent(content, maxLength) {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  }

  calculateNodeSize(node) {
    const baseSize = 20;
    const childrenBonus = Math.min((node.children?.size || 0) * 3, 20);
    const confidenceBonus = (node.confidence || 0) * 10;
    return Math.max(baseSize + childrenBonus + confidenceBonus, 15);
  }

  calculateLevels(nodes) {
    const levels = {};
    nodes.forEach(node => {
      if (!levels[node.depth]) {
        levels[node.depth] = [];
      }
      levels[node.depth].push(node.nodeId);
    });
    return levels;
  }

  calculateMutationDistribution(nodes) {
    const distribution = {};
    nodes.forEach(node => {
      if (node.mutationType) {
        distribution[node.mutationType] = (distribution[node.mutationType] || 0) + 1;
      }
    });
    return distribution;
  }
}

module.exports = FamilyTreeDemoData;