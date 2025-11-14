// Demo Backup Data - Task 4.2
// Provides fallback demo data in case of API failures

export const backupDemoData = {
  posts: [
    {
      id: 'backup-1',
      title: 'URGENT: Mumbai Floods - False Evacuation Alert',
      content: 'BREAKING: All Mumbai residents must evacuate immediately due to dam burst. Government buses waiting at Bandra station. Share to save lives! #MumbaiFloods #Emergency',
      confidence: 0.95,
      is_misinformation: true,
      urgency_level: 'critical',
      harm_category: 'crisis',
      ai_generated: false,
      reasoning_steps: [
        'No official government evacuation order issued',
        'Dam burst claim unverified by authorities',
        'Emotional language designed to create panic',
        'No credible news sources reporting this event'
      ],
      created_at: new Date().toISOString(),
      upvotes: 0,
      downvotes: 15
    },
    {
      id: 'backup-2',
      title: 'Miracle Cure: Turmeric Completely Cures COVID-19',
      content: 'DOCTORS HATE THIS TRICK! My grandmother cured her COVID with just turmeric and hot water. Big Pharma doesn\'t want you to know this simple cure that works 100% of the time. Share before they delete this!',
      confidence: 0.88,
      is_misinformation: true,
      urgency_level: 'high',
      harm_category: 'medical',
      ai_generated: false,
      reasoning_steps: [
        'No scientific evidence for turmeric curing COVID-19',
        'Dangerous medical misinformation',
        'Conspiracy theory language about "Big Pharma"',
        'Anecdotal evidence presented as medical fact'
      ],
      created_at: new Date(Date.now() - 3600000).toISOString(),
      upvotes: 2,
      downvotes: 23,
      mutation_analysis: {
        is_mutation: true,
        original_claim: 'Turmeric has health benefits',
        mutation_type: 'medical_escalation'
      }
    },
    {
      id: 'backup-3',
      title: '🚨 AI ALERT: Dangerous Bleach Cure Detected',
      content: 'FactSaura AI has detected dangerous misinformation promoting bleach as a COVID cure. This content has been flagged across 15 platforms and poses immediate health risks. Original post removed, but mutations continue spreading.',
      confidence: 0.99,
      is_misinformation: false,
      urgency_level: 'critical',
      harm_category: 'medical',
      ai_generated: true,
      reasoning_steps: [
        'AI-generated warning post',
        'Alerts users about dangerous health misinformation',
        'Provides context about content removal',
        'Educational purpose to prevent harm'
      ],
      created_at: new Date(Date.now() - 1800000).toISOString(),
      upvotes: 45,
      downvotes: 1
    },
    {
      id: 'backup-4',
      title: 'Government Bans All Cash - Digital Currency Only',
      content: 'CONFIRMED: Government secretly passed law banning all physical currency starting tomorrow. Only digital payments allowed. Banks will confiscate all cash deposits. Withdraw everything NOW before it\'s too late!',
      confidence: 0.92,
      is_misinformation: true,
      urgency_level: 'high',
      harm_category: 'financial',
      ai_generated: false,
      reasoning_steps: [
        'No official government announcement',
        'Impossible to implement overnight',
        'Designed to create financial panic',
        'No credible news sources reporting this'
      ],
      created_at: new Date(Date.now() - 7200000).toISOString(),
      upvotes: 8,
      downvotes: 34
    },
    {
      id: 'backup-5',
      title: 'Earthquake Prediction: 9.0 Magnitude Tomorrow',
      content: 'URGENT WARNING: Seismologists predict massive 9.0 earthquake will hit Delhi tomorrow at 3:47 PM. Government hiding this information. Evacuate tall buildings immediately. This is not a drill!',
      confidence: 0.97,
      is_misinformation: true,
      urgency_level: 'critical',
      harm_category: 'crisis',
      ai_generated: false,
      reasoning_steps: [
        'Earthquakes cannot be predicted with such precision',
        'No seismological organization has issued such warning',
        'Conspiracy theory about government cover-up',
        'Designed to create mass panic'
      ],
      created_at: new Date(Date.now() - 10800000).toISOString(),
      upvotes: 3,
      downvotes: 67
    }
  ],
  
  statistics: {
    total_posts: 5,
    misinformation_detected: 4,
    ai_generated_warnings: 1,
    critical_urgency: 3,
    mutation_detected: 1,
    average_confidence: 0.94,
    detection_rate: 80
  },
  
  familyTree: {
    familyId: 'backup-family-1',
    rootNodeId: 'backup-root-1',
    totalNodes: 47,
    maxDepth: 4,
    mutationTypes: [
      'emotional_amplification',
      'numerical_change', 
      'phrase_addition',
      'context_removal',
      'platform_adaptation',
      'language_translation',
      'medical_escalation',
      'conspiracy_addition'
    ]
  },
  
  scenarios: {
    crisis: {
      name: 'Crisis Misinformation',
      posts: ['backup-1', 'backup-5'],
      description: 'Emergency-related false information that can cause panic'
    },
    medical: {
      name: 'Medical Misinformation', 
      posts: ['backup-2', 'backup-3'],
      description: 'Health-related false claims that can endanger lives'
    },
    financial: {
      name: 'Financial Scams',
      posts: ['backup-4'],
      description: 'Economic misinformation designed to create financial panic'
    }
  }
};

// Backup demo data provider component
const DemoBackupData = ({ onDataLoaded }) => {
  React.useEffect(() => {
    // Simulate API delay for realistic experience
    const timer = setTimeout(() => {
      if (onDataLoaded) {
        onDataLoaded(backupDemoData);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [onDataLoaded]);
  
  return null; // This component doesn't render anything
};

export default DemoBackupData;