// Demo Posts Data - Task 4.1
// Creates 15 impressive sample posts with varied AI analysis results
// Includes crisis-related content, medical misinformation, and different confidence levels

const crypto = require('crypto');

class DemoPostsData {
  constructor() {
    this.urgencyLevels = ['critical', 'high', 'medium'];
    this.harmCategories = ['medical', 'crisis', 'political', 'environmental', 'financial', 'general'];
    this.mutationTypes = [
      'word_substitution', 'phrase_addition', 'context_shift', 'emotional_amplification',
      'source_modification', 'numerical_change', 'location_change', 'time_shift'
    ];
  }

  /**
   * Generate 15 impressive demo posts with varied AI analysis results
   */
  generateDemoPosts() {
    const posts = [
      // 1. HIGH CONFIDENCE MISINFORMATION - Mumbai Floods Crisis
      {
        title: "URGENT: Mumbai Floods - Government Hiding Death Toll",
        content: "BREAKING: Mumbai floods have killed over 2000 people but government is hiding the real numbers. My cousin works in BMC and confirmed they're only reporting 50 deaths. Share this before they delete it! #MumbaiFloods #CoverUp",
        confidence: 0.92,
        is_misinformation: true,
        urgency_level: 'critical',
        harm_category: 'crisis',
        crisis_keywords: ['floods', 'death toll', 'government hiding', 'BMC', 'Mumbai'],
        reasoning_steps: [
          "Unverified claim about death toll with no credible sources",
          "Uses emotional language and conspiracy theory patterns",
          "Encourages viral sharing with urgency tactics",
          "Claims insider knowledge without verification"
        ],
        uncertainty_flags: ["Unverified casualty numbers", "Anonymous source claims"],
        post_type: 'user_submitted'
      },

      // 2. MEDICAL MISINFORMATION - High Confidence
      {
        title: "Turmeric Cures COVID-19 in 24 Hours - Doctors Confirm",
        content: "Scientists at AIIMS Delhi have confirmed that turmeric powder mixed with warm milk can completely cure COVID-19 within 24 hours. Big Pharma is trying to suppress this information. My neighbor tried it and tested negative the next day!",
        confidence: 0.89,
        is_misinformation: true,
        urgency_level: 'high',
        harm_category: 'medical',
        crisis_keywords: ['COVID-19', 'cure', 'AIIMS', 'turmeric', 'Big Pharma'],
        reasoning_steps: [
          "False medical claim without peer-reviewed evidence",
          "Misattributes authority to AIIMS without verification",
          "Promotes unproven treatment that could delay proper care",
          "Uses conspiracy theory about pharmaceutical companies"
        ],
        uncertainty_flags: ["Unverified medical claims", "No peer-reviewed sources"],
        post_type: 'user_submitted',
        mutation_analysis: {
          is_mutation: true,
          mutation_type: 'source_modification',
          family_id: 'turmeric-covid-family',
          generation: 2,
          confidence: 0.85
        }
      },

      // 3. AI-GENERATED WARNING POST - Critical
      {
        title: "🚨 MISINFORMATION ALERT: False Earthquake Prediction Spreading",
        content: "⚠️ AI DETECTED MISINFORMATION ⚠️\n\nDetected on multiple platforms: Claims that a 9.0 earthquake will hit Delhi on November 15th\n\nAnalysis: No scientific basis for earthquake prediction with specific dates. Seismologists cannot predict earthquakes with such precision.\n\nConfidence: 94% fake news\n\nSources: Indian Meteorological Department, USGS Earthquake Hazards Program\n\n#FakeNewsAlert #EarthquakeFacts",
        confidence: 0.94,
        is_misinformation: false, // This is a warning post about misinformation
        urgency_level: 'critical',
        harm_category: 'crisis',
        crisis_keywords: ['earthquake', 'prediction', 'Delhi', 'misinformation'],
        reasoning_steps: [
          "AI-generated warning about false earthquake prediction",
          "Provides scientific context about earthquake prediction limitations",
          "Cites authoritative sources (IMD, USGS)",
          "Helps prevent panic from false predictions"
        ],
        uncertainty_flags: [],
        post_type: 'ai_generated',
        ai_generated: true
      },

      // 4. MEDIUM CONFIDENCE - Suspicious but Unclear
      {
        title: "New Study Shows Vitamin D Prevents All Cancers",
        content: "A recent study from a European university found that taking 10,000 IU of Vitamin D daily can prevent all types of cancer. The study followed 50,000 people for 2 years. Doctors don't want you to know this simple truth.",
        confidence: 0.67,
        is_misinformation: true,
        urgency_level: 'medium',
        harm_category: 'medical',
        crisis_keywords: ['cancer', 'Vitamin D', 'prevent', 'study'],
        reasoning_steps: [
          "Overstated medical claims about cancer prevention",
          "Vague source attribution ('European university')",
          "Promotes conspiracy theory about medical professionals",
          "Lacks specific study details or peer review information"
        ],
        uncertainty_flags: ["Vague source attribution", "Overstated medical benefits"],
        post_type: 'user_submitted'
      },

      // 5. FINANCIAL MISINFORMATION - High Confidence
      {
        title: "Government Banning Cash - Digital Currency Mandatory by December",
        content: "URGENT: RBI has secretly decided to ban all cash transactions from December 1st. Only digital currency will be accepted. Banks are not telling customers. Withdraw all your money NOW before it becomes worthless! #CashBan #DigitalCurrency",
        confidence: 0.88,
        is_misinformation: true,
        urgency_level: 'high',
        harm_category: 'financial',
        crisis_keywords: ['cash ban', 'RBI', 'digital currency', 'December', 'banks'],
        reasoning_steps: [
          "False claim about government policy without official sources",
          "Creates financial panic with urgent withdrawal advice",
          "No credible evidence from RBI or government sources",
          "Uses conspiracy language about secret decisions"
        ],
        uncertainty_flags: ["No official government sources", "Panic-inducing financial advice"],
        post_type: 'user_submitted'
      },

      // 6. LOW CONFIDENCE - Potentially Misleading
      {
        title: "Local Weather Station Reports Unusual Temperature Patterns",
        content: "The weather station near my house has been showing temperatures 5 degrees higher than normal for the past week. Could this be related to the new cell tower they installed? Some people are saying it might be affecting the readings.",
        confidence: 0.23,
        is_misinformation: false,
        urgency_level: 'medium',
        harm_category: 'environmental',
        crisis_keywords: ['temperature', 'weather station', 'cell tower'],
        reasoning_steps: [
          "Observational report with speculation about causation",
          "No clear misinformation but suggests unproven connection",
          "Could be legitimate concern about equipment interference",
          "Lacks scientific evidence but not definitively false"
        ],
        uncertainty_flags: ["Speculative causation", "Anecdotal observation"],
        post_type: 'user_submitted'
      },

      // 7. POLITICAL MISINFORMATION - High Confidence
      {
        title: "Election Results Already Decided - Voting Machines Hacked",
        content: "LEAKED: Internal documents show that electronic voting machines have been pre-programmed with results. Your vote doesn't matter - the election is already decided. A whistleblower from the Election Commission confirmed this. Democracy is dead! #ElectionFraud #VotingScam",
        confidence: 0.91,
        is_misinformation: true,
        urgency_level: 'critical',
        harm_category: 'political',
        crisis_keywords: ['election', 'voting machines', 'hacked', 'pre-programmed', 'Election Commission'],
        reasoning_steps: [
          "Serious allegations against electoral integrity without evidence",
          "Claims insider knowledge from anonymous 'whistleblower'",
          "Could undermine democratic participation and trust",
          "No verifiable sources or documentation provided"
        ],
        uncertainty_flags: ["Anonymous whistleblower claims", "No verifiable evidence"],
        post_type: 'user_submitted'
      },

      // 8. AI-GENERATED WARNING - Medical
      {
        title: "🚨 HEALTH ALERT: False Insulin Alternative Claims Detected",
        content: "⚠️ MISINFORMATION DETECTED ⚠️\n\nViral claim: 'Cinnamon powder can replace insulin for diabetics'\n\nAnalysis: Extremely dangerous medical misinformation. Cinnamon cannot replace insulin therapy. Diabetics following this advice risk diabetic ketoacidosis and death.\n\nConfidence: 96% dangerous misinformation\n\nSources: American Diabetes Association, Endocrinology Society of India\n\n#DiabetesFacts #MedicalMisinformation",
        confidence: 0.96,
        is_misinformation: false, // Warning post
        urgency_level: 'critical',
        harm_category: 'medical',
        crisis_keywords: ['insulin', 'diabetes', 'cinnamon', 'medical misinformation'],
        reasoning_steps: [
          "AI-generated warning about dangerous medical misinformation",
          "Explains serious health risks of following false advice",
          "Cites authoritative medical organizations",
          "Prevents potential harm to diabetic patients"
        ],
        uncertainty_flags: [],
        post_type: 'ai_generated',
        ai_generated: true
      },

      // 9. ENVIRONMENTAL MISINFORMATION - Medium Confidence
      {
        title: "5G Towers Killing Birds - Massive Die-Off in Bangalore",
        content: "Hundreds of birds found dead near 5G towers in Bangalore. Local veterinarian says it's radiation poisoning. Government is covering this up to protect telecom companies. Take photos before they clean up the evidence! #5GKillsBirds #BangaloreBirds",
        confidence: 0.74,
        is_misinformation: true,
        urgency_level: 'medium',
        harm_category: 'environmental',
        crisis_keywords: ['5G towers', 'birds', 'radiation', 'Bangalore', 'die-off'],
        reasoning_steps: [
          "Unverified claims about 5G health effects on wildlife",
          "Attributes cause without scientific investigation",
          "Promotes conspiracy theory about government cover-up",
          "Lacks credible veterinary or scientific sources"
        ],
        uncertainty_flags: ["Unverified veterinary claims", "No scientific investigation"],
        post_type: 'user_submitted'
      },

      // 10. CRISIS MISINFORMATION - Very High Confidence
      {
        title: "Cyclone Hitting Mumbai Tonight - Evacuate Immediately",
        content: "URGENT ALERT: Meteorological department insider confirms Category 5 cyclone will hit Mumbai at 2 AM tonight. Government hasn't issued warning to avoid panic. Evacuate coastal areas NOW! Wind speeds 200+ kmph expected. Share to save lives! #CycloneAlert #MumbaiEvacuate",
        confidence: 0.95,
        is_misinformation: true,
        urgency_level: 'critical',
        harm_category: 'crisis',
        crisis_keywords: ['cyclone', 'Mumbai', 'evacuate', 'Category 5', 'meteorological'],
        reasoning_steps: [
          "False emergency alert without official meteorological confirmation",
          "Could cause mass panic and unnecessary evacuation",
          "Claims insider knowledge contradicting official sources",
          "No verification from IMD or disaster management authorities"
        ],
        uncertainty_flags: ["No official weather service confirmation", "Contradicts official sources"],
        post_type: 'user_submitted'
      },

      // 11. MODERATE CONFIDENCE - Partially True but Misleading
      {
        title: "Air Quality Index Reaches 500 in Delhi - Worst Ever Recorded",
        content: "Delhi's air quality has reached AQI 500 today, the worst ever recorded in the city's history. This is 10 times worse than Beijing's worst day. People are dropping dead on the streets from breathing this toxic air. The government has declared a health emergency but media is not reporting it.",
        confidence: 0.58,
        is_misinformation: true,
        urgency_level: 'high',
        harm_category: 'environmental',
        crisis_keywords: ['air quality', 'AQI 500', 'Delhi', 'toxic air', 'health emergency'],
        reasoning_steps: [
          "AQI levels may be accurate but claims are exaggerated",
          "False claim about people 'dropping dead on streets'",
          "Unverified comparison with Beijing's historical data",
          "No evidence of unreported government health emergency"
        ],
        uncertainty_flags: ["Exaggerated health impacts", "Unverified government response claims"],
        post_type: 'user_submitted'
      },

      // 12. MUTATION EXAMPLE - Turmeric Family Tree
      {
        title: "BREAKING: Turmeric and Ginger Cure COVID in 12 Hours - Harvard Study",
        content: "Harvard Medical School researchers have confirmed that a mixture of turmeric and ginger can completely eliminate COVID-19 from the body in just 12 hours. The study was published in the New England Journal of Medicine but Big Pharma is trying to suppress it. My doctor friend confirmed this works!",
        confidence: 0.87,
        is_misinformation: true,
        urgency_level: 'high',
        harm_category: 'medical',
        crisis_keywords: ['COVID-19', 'turmeric', 'ginger', 'Harvard', 'cure'],
        reasoning_steps: [
          "False attribution to Harvard Medical School",
          "Claims publication in prestigious journal without verification",
          "Promotes unproven COVID-19 treatment",
          "Uses conspiracy theory about pharmaceutical suppression"
        ],
        uncertainty_flags: ["False institutional attribution", "Unverified journal publication"],
        post_type: 'user_submitted',
        mutation_analysis: {
          is_mutation: true,
          mutation_type: 'phrase_addition',
          family_id: 'turmeric-covid-family',
          generation: 2,
          confidence: 0.91,
          parent_content: "Turmeric can cure COVID-19 completely within 24 hours"
        }
      },

      // 13. LOW CONFIDENCE - Legitimate Concern
      {
        title: "Increased Traffic Accidents Near New Highway Construction",
        content: "There have been 3 accidents this week near the new highway construction site on NH-8. The temporary traffic signals might be confusing drivers. Local residents are concerned about safety. Has anyone else noticed this pattern?",
        confidence: 0.15,
        is_misinformation: false,
        urgency_level: 'medium',
        harm_category: 'general',
        crisis_keywords: ['accidents', 'highway construction', 'traffic signals', 'NH-8'],
        reasoning_steps: [
          "Legitimate safety concern about traffic patterns",
          "Observational report without false claims",
          "Seeks community input rather than making definitive statements",
          "Could be valuable information for traffic authorities"
        ],
        uncertainty_flags: [],
        post_type: 'user_submitted'
      },

      // 14. AI-GENERATED WARNING - Financial
      {
        title: "🚨 SCAM ALERT: Fake Cryptocurrency Investment Scheme Detected",
        content: "⚠️ FINANCIAL SCAM DETECTED ⚠️\n\nViral scheme: 'Invest ₹10,000 in DelhiCoin, get ₹1 lakh in 30 days'\n\nAnalysis: Classic Ponzi scheme using fake cryptocurrency. No legitimate blockchain, no regulatory approval. Victims report losing entire investments.\n\nConfidence: 98% fraudulent scheme\n\nSources: Reserve Bank of India, Securities and Exchange Board of India\n\n#CryptoScam #FinancialFraud",
        confidence: 0.98,
        is_misinformation: false, // Warning post
        urgency_level: 'critical',
        harm_category: 'financial',
        crisis_keywords: ['cryptocurrency', 'investment', 'scam', 'Ponzi scheme', 'DelhiCoin'],
        reasoning_steps: [
          "AI-generated warning about financial fraud",
          "Identifies classic Ponzi scheme characteristics",
          "Cites regulatory authorities for credibility",
          "Protects potential victims from financial loss"
        ],
        uncertainty_flags: [],
        post_type: 'ai_generated',
        ai_generated: true
      },

      // 15. VERY HIGH CONFIDENCE - Dangerous Medical Misinformation
      {
        title: "Drinking Bleach Kills Cancer Cells - Miracle Cure Discovered",
        content: "MIRACLE DISCOVERY: Drinking diluted bleach (MMS - Miracle Mineral Solution) kills all cancer cells within weeks. FDA and doctors don't want you to know this $2 cure because it would destroy their billion-dollar cancer industry. Thousands cured already! #MiracleMineral #CancerCure",
        confidence: 0.99,
        is_misinformation: true,
        urgency_level: 'critical',
        harm_category: 'medical',
        crisis_keywords: ['bleach', 'cancer cure', 'MMS', 'Miracle Mineral Solution', 'FDA'],
        reasoning_steps: [
          "Extremely dangerous medical misinformation promoting toxic substance",
          "Bleach consumption can cause severe poisoning and death",
          "False conspiracy claims about medical establishment",
          "Could lead to serious harm or death if followed"
        ],
        uncertainty_flags: ["Life-threatening medical advice", "Promotes consumption of toxic substances"],
        post_type: 'user_submitted'
      }
    ];

    // Add metadata and IDs to each post
    return posts.map((post, index) => ({
      // Basic post fields
      title: post.title,
      content: post.content,
      content_type: 'text',
      source_url: null,
      post_type: post.ai_generated ? 'ai_detected' : 'user_submitted',
      author_id: 'system-user-id', // Will be replaced with actual system user ID
      
      // Crisis context fields (matching database schema)
      crisis_context: {
        urgency_level: post.urgency_level,
        harm_category: post.harm_category,
        crisis_keywords_found: post.crisis_keywords
      },
      urgency_level: post.urgency_level,
      location_relevance: this.extractLocation(post.content) || 'global',
      harm_category: post.harm_category,
      crisis_keywords: post.crisis_keywords,
      
      // AI analysis fields (matching database schema)
      ai_analysis: {
        confidence_score: post.confidence,
        is_misinformation: post.is_misinformation,
        explanation: this.generateExplanation(post),
        reasoning_steps: post.reasoning_steps,
        uncertainty_flags: post.uncertainty_flags,
        sources_checked: this.generateSourcesChecked(post),
        processing_time_ms: Math.floor(Math.random() * 2000) + 500,
        analysis_quality: post.confidence > 0.8 ? 'high' : post.confidence > 0.5 ? 'medium' : 'low',
        model_version: post.ai_generated ? 'jan-ai-v1.2' : 'fallback-v1.0',
        mutation_analysis: post.mutation_analysis || null
      },
      confidence_score: post.confidence,
      is_misinformation: post.is_misinformation,
      analysis_explanation: this.generateExplanation(post),
      reasoning_steps: post.reasoning_steps,
      sources_checked: this.generateSourcesChecked(post),
      uncertainty_flags: post.uncertainty_flags,
      analysis_timestamp: new Date(Date.now() - (15 - index) * 2 * 60 * 60 * 1000).toISOString(),
      
      // Engagement metrics
      upvotes: Math.floor(Math.random() * 50) + (post.is_misinformation ? 5 : 20),
      downvotes: Math.floor(Math.random() * 20) + (post.is_misinformation ? 15 : 2),
      comments_count: Math.floor(Math.random() * 25),
      expert_verifications: post.ai_generated ? 1 : 0,
      community_trust_score: post.is_misinformation ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3,
      
      // Status flags
      is_published: true,
      is_flagged: post.confidence > 0.8 && post.is_misinformation,
      is_verified: post.ai_generated || (!post.is_misinformation && post.confidence < 0.3),
      
      // Timestamps
      created_at: new Date(Date.now() - (15 - index) * 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - (15 - index) * 2 * 60 * 60 * 1000).toISOString()
    }));
  }

  generateExplanation(post) {
    if (post.ai_generated) {
      return `This is an AI-generated warning post about detected misinformation. The original false claim has been analyzed and flagged to prevent harm.`;
    }
    
    if (post.is_misinformation) {
      const reasons = [];
      if (post.confidence > 0.9) reasons.push("extremely high confidence indicators");
      if (post.crisis_keywords.length > 3) reasons.push("multiple crisis-related keywords");
      if (post.reasoning_steps.some(step => step.includes("conspiracy"))) reasons.push("conspiracy theory patterns");
      if (post.reasoning_steps.some(step => step.includes("unverified"))) reasons.push("unverified claims");
      
      return `This content shows ${reasons.join(", ")} suggesting it contains misinformation that could cause harm.`;
    } else {
      return `This content appears to be legitimate information or a reasonable concern without clear misinformation indicators.`;
    }
  }

  generateSourcesChecked(post) {
    const allSources = [
      'Google Fact Check Tools',
      'WHO Fact Sheets',
      'Government Health Departments',
      'Peer-reviewed Medical Journals',
      'Official Weather Services',
      'Financial Regulatory Bodies',
      'News Verification Networks',
      'Scientific Research Databases'
    ];
    
    const relevantSources = [];
    if (post.harm_category === 'medical') {
      relevantSources.push('WHO Fact Sheets', 'Peer-reviewed Medical Journals', 'Government Health Departments');
    }
    if (post.harm_category === 'crisis') {
      relevantSources.push('Official Weather Services', 'Government Emergency Services');
    }
    if (post.harm_category === 'financial') {
      relevantSources.push('Financial Regulatory Bodies', 'Central Bank Announcements');
    }
    
    relevantSources.push('Google Fact Check Tools');
    return relevantSources.slice(0, 3);
  }

  extractLocation(content) {
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
    for (const location of locations) {
      if (content.includes(location)) {
        return location.toLowerCase();
      }
    }
    return 'global';
  }

  /**
   * Get posts filtered by criteria for demo scenarios
   */
  getFilteredPosts(posts, filters = {}) {
    let filtered = [...posts];
    
    if (filters.urgency_level) {
      filtered = filtered.filter(post => post.urgency_level === filters.urgency_level);
    }
    
    if (filters.is_misinformation !== undefined) {
      filtered = filtered.filter(post => post.is_misinformation === filters.is_misinformation);
    }
    
    if (filters.harm_category) {
      filtered = filtered.filter(post => post.harm_category === filters.harm_category);
    }
    
    if (filters.confidence_min) {
      filtered = filtered.filter(post => post.confidence >= filters.confidence_min);
    }
    
    return filtered;
  }

  /**
   * Get demo statistics for presentation
   */
  getDemoStatistics(posts) {
    const total = posts.length;
    const misinformation = posts.filter(p => p.is_misinformation).length;
    const aiGenerated = posts.filter(p => p.ai_generated).length;
    const critical = posts.filter(p => p.urgency_level === 'critical').length;
    const mutations = posts.filter(p => p.mutation_analysis?.is_mutation).length;
    
    const avgConfidence = posts.reduce((sum, p) => sum + p.confidence, 0) / total;
    
    const categoryDistribution = {};
    posts.forEach(post => {
      categoryDistribution[post.harm_category] = (categoryDistribution[post.harm_category] || 0) + 1;
    });
    
    return {
      total_posts: total,
      misinformation_detected: misinformation,
      ai_generated_warnings: aiGenerated,
      critical_urgency: critical,
      mutation_detected: mutations,
      average_confidence: Math.round(avgConfidence * 100) / 100,
      category_distribution: categoryDistribution,
      detection_rate: Math.round((misinformation / total) * 100),
      warning_coverage: Math.round((aiGenerated / misinformation) * 100)
    };
  }
}

module.exports = DemoPostsData;