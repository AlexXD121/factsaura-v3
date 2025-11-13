#!/usr/bin/env node

/**
 * Test Script for Trending Topic Detection
 * Tests the trending topic detection algorithms with real and mock data
 */

const TrendingTopicDetectionService = require('../services/trendingTopicDetectionService');

// Mock data simulating real-world scenarios
const mockScrapedContent = {
  news: [
    {
      title: 'Breaking: Major earthquake hits California, 7.2 magnitude',
      description: 'A powerful 7.2 magnitude earthquake struck Southern California at 3:45 PM, causing widespread damage and triggering emergency response protocols.',
      url: 'https://example.com/earthquake-california',
      publishedAt: new Date().toISOString(),
      author: 'Emergency Reporter',
      source: { name: 'CNN Breaking News' },
      crisisScore: 0.95
    },
    {
      title: 'Urgent: Fake vaccine certificates circulating online',
      description: 'Health officials warn of fraudulent COVID-19 vaccination certificates being sold on social media platforms.',
      url: 'https://example.com/fake-vaccine-certs',
      publishedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      author: 'Health Reporter',
      source: { name: 'Reuters Health' },
      crisisScore: 0.8
    },
    {
      title: 'Viral TikTok challenge leads to hospitalizations',
      description: 'Dangerous social media challenge spreads rapidly among teenagers, prompting safety warnings from medical professionals.',
      url: 'https://example.com/tiktok-challenge',
      publishedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      author: 'Social Media Reporter',
      source: { name: 'BBC News' },
      crisisScore: 0.7
    },
    {
      title: 'New AI breakthrough promises revolutionary changes',
      description: 'Tech companies announce major advancement in artificial intelligence that could transform multiple industries.',
      url: 'https://example.com/ai-breakthrough',
      publishedAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      author: 'Tech Reporter',
      source: { name: 'TechCrunch' },
      crisisScore: 0.2
    },
    {
      title: 'Stock market sees massive surge amid economic optimism',
      description: 'Major indices reach record highs as investors show confidence in economic recovery.',
      url: 'https://example.com/stock-surge',
      publishedAt: new Date(Date.now() - 1200000).toISOString(), // 20 minutes ago
      author: 'Finance Reporter',
      source: { name: 'Bloomberg' },
      crisisScore: 0.1
    }
  ],
  reddit: [
    {
      id: 'eq_thread_1',
      title: 'EARTHQUAKE MEGATHREAD - 7.2 magnitude hits Southern California',
      selftext: 'Official discussion thread for the major earthquake. Please share updates, check-ins, and safety information here.',
      url: 'https://reddit.com/r/LosAngeles/eq_thread_1',
      created_utc: Math.floor(Date.now() / 1000) - 120, // 2 minutes ago
      author: 'LAModerator',
      subreddit: 'LosAngeles',
      score: 4500,
      num_comments: 892,
      ups: 4600,
      downs: 100,
      upvote_ratio: 0.98,
      crisisScore: 0.9
    },
    {
      id: 'eq_thread_2',
      title: 'Did anyone else feel that massive earthquake?? LA area',
      selftext: 'Holy shit that was intense! My whole apartment shook for like 30 seconds. Everyone okay?',
      url: 'https://reddit.com/r/news/eq_thread_2',
      created_utc: Math.floor(Date.now() / 1000) - 180, // 3 minutes ago
      author: 'LAResident2024',
      subreddit: 'news',
      score: 2800,
      num_comments: 456,
      ups: 2900,
      downs: 100,
      upvote_ratio: 0.97,
      crisisScore: 0.85
    },
    {
      id: 'vaccine_fraud',
      title: 'PSA: Fake vaccine cards being sold on Instagram and Telegram',
      selftext: 'Saw multiple accounts selling fake vaccination certificates. This is dangerous misinformation that puts everyone at risk.',
      url: 'https://reddit.com/r/PublicHealth/vaccine_fraud',
      created_utc: Math.floor(Date.now() / 1000) - 400, // 6.7 minutes ago
      author: 'HealthAdvocate',
      subreddit: 'PublicHealth',
      score: 1200,
      num_comments: 234,
      ups: 1250,
      downs: 50,
      upvote_ratio: 0.96,
      crisisScore: 0.75
    },
    {
      id: 'tiktok_danger',
      title: 'This viral TikTok challenge is sending kids to the hospital',
      selftext: 'Parents need to know about this dangerous trend. Already 15 hospitalizations reported.',
      url: 'https://reddit.com/r/ParentingAdvice/tiktok_danger',
      created_utc: Math.floor(Date.now() / 1000) - 700, // 11.7 minutes ago
      author: 'ConcernedParent',
      subreddit: 'ParentingAdvice',
      score: 890,
      num_comments: 167,
      ups: 920,
      downs: 30,
      upvote_ratio: 0.97,
      crisisScore: 0.8
    },
    {
      id: 'ai_hype',
      title: 'This new AI is absolutely mind-blowing! Everyone needs to see this',
      selftext: 'Just tried the new AI system and it\'s incredible. This is going viral for good reason!',
      url: 'https://reddit.com/r/technology/ai_hype',
      created_utc: Math.floor(Date.now() / 1000) - 1000, // 16.7 minutes ago
      author: 'TechEnthusiast99',
      subreddit: 'technology',
      score: 1500,
      num_comments: 289,
      ups: 1550,
      downs: 50,
      upvote_ratio: 0.97,
      crisisScore: 0.15
    },
    {
      id: 'market_gains',
      title: 'Stock market hitting new records - what\'s driving this surge?',
      selftext: 'Seeing massive gains across all sectors. Is this sustainable or are we in a bubble?',
      url: 'https://reddit.com/r/investing/market_gains',
      created_utc: Math.floor(Date.now() / 1000) - 1300, // 21.7 minutes ago
      author: 'InvestorJoe',
      subreddit: 'investing',
      score: 650,
      num_comments: 123,
      ups: 680,
      downs: 30,
      upvote_ratio: 0.96,
      crisisScore: 0.1
    }
  ],
  gdelt: [
    {
      title: 'California Emergency Management Activates Statewide Response',
      url: 'https://gdelt.com/ca-emergency-response',
      seendate: new Date().toISOString(),
      domain: 'caloes.ca.gov',
      socialfacebookshares: 2500,
      socialscore: 3500,
      tone: { score: -6.8 }, // Very negative tone indicates major crisis
      themes: ['CRISIS', 'DISASTER', 'EMERGENCY', 'EARTHQUAKE'],
      locations: ['California', 'Los Angeles', 'San Diego'],
      crisisScore: 0.98
    },
    {
      title: 'WHO Issues Alert on Fraudulent Vaccination Documents',
      url: 'https://gdelt.com/who-vaccine-fraud-alert',
      seendate: new Date(Date.now() - 420000).toISOString(), // 7 minutes ago
      domain: 'who.int',
      socialfacebookshares: 800,
      socialscore: 1200,
      tone: { score: -3.2 }, // Negative tone for health warning
      themes: ['HEALTH', 'FRAUD', 'MISINFORMATION'],
      locations: ['Global'],
      crisisScore: 0.82
    },
    {
      title: 'Social Media Platform Removes Dangerous Challenge Content',
      url: 'https://gdelt.com/social-media-safety',
      seendate: new Date(Date.now() - 720000).toISOString(), // 12 minutes ago
      domain: 'tiktok.com',
      socialfacebookshares: 1200,
      socialscore: 1800,
      tone: { score: -2.1 }, // Moderately negative
      themes: ['SOCIAL_MEDIA', 'SAFETY', 'YOUTH'],
      locations: ['United States'],
      crisisScore: 0.7
    },
    {
      title: 'Tech Industry Celebrates Major AI Milestone',
      url: 'https://gdelt.com/ai-milestone',
      seendate: new Date(Date.now() - 1020000).toISOString(), // 17 minutes ago
      domain: 'techcrunch.com',
      socialfacebookshares: 950,
      socialscore: 1400,
      tone: { score: 4.5 }, // Positive tone
      themes: ['TECHNOLOGY', 'INNOVATION', 'AI'],
      locations: ['Silicon Valley', 'United States'],
      crisisScore: 0.2
    },
    {
      title: 'Global Markets Show Strong Performance Amid Recovery',
      url: 'https://gdelt.com/market-performance',
      seendate: new Date(Date.now() - 1320000).toISOString(), // 22 minutes ago
      domain: 'bloomberg.com',
      socialfacebookshares: 400,
      socialscore: 600,
      tone: { score: 3.8 }, // Positive tone
      themes: ['ECONOMY', 'MARKETS', 'FINANCE'],
      locations: ['Global', 'New York'],
      crisisScore: 0.1
    }
  ]
};

async function testTrendingDetection() {
  console.log('🔥 Testing Trending Topic Detection Algorithms\n');
  
  try {
    // Initialize service
    const service = new TrendingTopicDetectionService();
    console.log('✅ Service initialized successfully\n');
    
    // Test content normalization
    console.log('📊 Testing Content Normalization...');
    const normalized = service.normalizeContent(mockScrapedContent);
    console.log(`   Normalized ${normalized.length} content items`);
    console.log(`   Sources: ${normalized.map(item => item.source).join(', ')}`);
    console.log(`   Platforms: ${[...new Set(normalized.map(item => item.platform))].join(', ')}\n`);
    
    // Test keyword extraction
    console.log('🏷️ Testing Keyword Extraction...');
    const sampleText = 'Breaking news: Major earthquake emergency response activated in California';
    const keywords = service.extractKeywords(sampleText);
    console.log(`   Sample text: "${sampleText}"`);
    console.log(`   Extracted keywords: ${keywords.slice(0, 10).join(', ')}${keywords.length > 10 ? '...' : ''}\n`);
    
    // Test topic extraction
    console.log('📈 Testing Topic Extraction...');
    const topics = service.extractTopics(normalized);
    console.log(`   Extracted ${topics.size} unique topics`);
    
    // Show top topics by mention count
    const topTopics = Array.from(topics.values())
      .sort((a, b) => b.totalMentions - a.totalMentions)
      .slice(0, 5);
    
    console.log('   Top topics by mentions:');
    topTopics.forEach((topic, index) => {
      console.log(`   ${index + 1}. "${topic.keyword}" - ${topic.totalMentions} mentions, ${topic.platforms.size} platforms`);
    });
    console.log();
    
    // Test full trending analysis
    console.log('🚀 Running Full Trending Analysis...');
    const startTime = Date.now();
    const analysis = await service.detectTrendingTopics(mockScrapedContent);
    const analysisTime = Date.now() - startTime;
    
    console.log(`   Analysis completed in ${analysisTime}ms\n`);
    
    // Display results
    console.log('📋 ANALYSIS RESULTS:');
    console.log('=' .repeat(50));
    
    console.log('\n📊 Summary Statistics:');
    console.log(`   Total Topics Analyzed: ${analysis.summary.totalTopics}`);
    console.log(`   Trending Topics: ${analysis.summary.trendingCount}`);
    console.log(`   Viral Topics: ${analysis.summary.viralCount}`);
    console.log(`   Crisis Topics: ${analysis.summary.crisisCount}`);
    console.log(`   Total Content Items: ${analysis.summary.totalContent}`);
    
    console.log('\n🔥 Top Trending Topics:');
    analysis.trendingTopics.slice(0, 5).forEach((topic, index) => {
      console.log(`   ${index + 1}. "${topic.keyword}"`);
      console.log(`      Score: ${topic.scores.trending.toFixed(3)} | Mentions: ${topic.totalMentions}`);
      console.log(`      Platforms: ${topic.platforms.join(', ')}`);
      console.log(`      Crisis: ${topic.isCrisisRelated ? 'Yes' : 'No'} | Viral: ${topic.isViral ? 'Yes' : 'No'}`);
      console.log();
    });
    
    console.log('🚨 Crisis Content Alerts:');
    analysis.crisisContent.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. "${item.title}"`);
      console.log(`      Crisis Score: ${item.crisisScore.toFixed(3)}`);
      console.log(`      Source: ${item.platform}`);
      console.log(`      Keywords: ${item.crisisKeywords?.join(', ') || 'N/A'}`);
      console.log();
    });
    
    console.log('🚀 Viral Content:');
    analysis.viralContent.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. "${item.title}"`);
      console.log(`      Viral Score: ${item.viralScore.toFixed(3)}`);
      console.log(`      Engagement: ${item.engagement.shares + item.engagement.comments + item.engagement.reactions}`);
      console.log(`      Indicators: ${item.viralIndicators?.join(', ') || 'N/A'}`);
      console.log();
    });
    
    console.log('📈 Platform Statistics:');
    Object.entries(analysis.platformStats).forEach(([platform, stats]) => {
      console.log(`   ${platform.toUpperCase()}:`);
      console.log(`      Content Count: ${stats.count}`);
      console.log(`      Avg Engagement: ${stats.avgEngagement?.toFixed(1) || 0}`);
      console.log(`      Avg Crisis Score: ${stats.avgCrisisScore?.toFixed(3) || 0}`);
      console.log();
    });
    
    console.log('💡 Key Insights:');
    console.log(`   Top Categories: ${analysis.insights.topCategories.map(cat => cat.category).join(', ')}`);
    console.log(`   Emerging Topics: ${analysis.insights.emergingTopics.length}`);
    console.log(`   Cross-Platform Trends: ${analysis.insights.crossPlatformTrends.length}`);
    console.log(`   Crisis Alerts: ${analysis.insights.crisisAlerts.length}`);
    
    // Test caching
    console.log('\n🗄️ Testing Analysis Caching...');
    const cachedStartTime = Date.now();
    const cachedAnalysis = await service.detectTrendingTopics(mockScrapedContent);
    const cachedTime = Date.now() - cachedStartTime;
    
    console.log(`   Cached analysis completed in ${cachedTime}ms`);
    console.log(`   Cache hit: ${cachedAnalysis.timestamp === analysis.timestamp ? 'Yes' : 'No'}`);
    
    // Test service statistics
    console.log('\n📊 Service Statistics:');
    const stats = service.getStats();
    console.log(`   Topics Tracked: ${stats.totalTopicsTracked}`);
    console.log(`   Current Trending: ${stats.currentTrendingCount}`);
    console.log(`   Cache Status: ${stats.cacheStatus}`);
    console.log(`   Memory Usage: ${JSON.stringify(stats.memoryUsage)}`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testTrendingDetection();
}

module.exports = { testTrendingDetection, mockScrapedContent };