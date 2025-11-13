#!/usr/bin/env node

/**
 * Content Deduplication Test Script
 * Tests the content deduplication system with sample data
 */

const ContentDeduplicationService = require('../services/contentDeduplicationService');

// Sample test data with various types of duplicates
const sampleContent = [
  // Exact duplicates (same title and content)
  {
    id: 'news_1',
    title: 'Breaking: Major earthquake hits California',
    content: 'A 7.2 magnitude earthquake struck Southern California this morning, causing widespread damage and power outages.',
    url: 'https://example-news.com/earthquake-california',
    sourceType: 'news',
    publishedAt: '2024-01-15T10:00:00Z',
    crisisScore: 0.9,
    score: 150
  },
  {
    id: 'reddit_1',
    title: 'Breaking: Major earthquake hits California',
    content: 'A 7.2 magnitude earthquake struck Southern California this morning, causing widespread damage and power outages.',
    url: 'https://reddit.com/r/news/earthquake_ca',
    sourceType: 'reddit',
    publishedAt: '2024-01-15T10:05:00Z',
    crisisScore: 0.8,
    score: 2500,
    numComments: 450
  },

  // URL duplicates (same article, different sources)
  {
    id: 'news_2',
    title: 'Scientists discover new species in Amazon rainforest',
    content: 'Researchers have identified a previously unknown species of frog in the Amazon basin.',
    url: 'https://www.reuters.com/science/amazon-species-discovery',
    sourceType: 'news',
    crisisScore: 0.1,
    score: 75
  },
  {
    id: 'reddit_2',
    title: 'New frog species found in Amazon!',
    content: 'Check out this cool discovery - scientists found a new frog species in the Amazon rainforest.',
    url: 'https://reuters.com/science/amazon-species-discovery',
    sourceType: 'reddit',
    crisisScore: 0.1,
    score: 890,
    numComments: 67
  },

  // Fuzzy duplicates (similar titles, slightly different content)
  {
    id: 'gdelt_1',
    title: 'Stock market crashes amid inflation fears',
    content: 'Global stock markets experienced significant declines today as investors worry about rising inflation rates.',
    sourceType: 'gdelt',
    crisisScore: 0.7,
    score: 0
  },
  {
    id: 'news_3',
    title: 'Stock markets crash due to inflation concerns',
    content: 'Stock markets around the world fell sharply today as inflation fears grip investors.',
    url: 'https://financial-times.com/markets-crash',
    sourceType: 'news',
    crisisScore: 0.75,
    score: 200
  },

  // Title similarity duplicates
  {
    id: 'reddit_3',
    title: 'COVID-19 vaccine shows promising results in trials',
    content: 'A new COVID-19 vaccine candidate has shown 95% efficacy in phase 3 trials.',
    sourceType: 'reddit',
    crisisScore: 0.6,
    score: 1200,
    numComments: 300
  },
  {
    id: 'news_4',
    title: 'COVID vaccine demonstrates promising trial results',
    content: 'Clinical trials for a new coronavirus vaccine show 95% effectiveness rate.',
    url: 'https://medical-news.com/covid-vaccine-trials',
    sourceType: 'news',
    crisisScore: 0.65,
    score: 180
  },

  // Unique content (no duplicates)
  {
    id: 'gdelt_2',
    title: 'International climate summit begins in Geneva',
    content: 'World leaders gather in Geneva for crucial climate change negotiations.',
    sourceType: 'gdelt',
    crisisScore: 0.4,
    score: 0
  },
  {
    id: 'news_5',
    title: 'Tech company announces revolutionary AI breakthrough',
    content: 'A major technology company claims to have achieved a significant breakthrough in artificial intelligence.',
    url: 'https://tech-news.com/ai-breakthrough',
    sourceType: 'news',
    crisisScore: 0.2,
    score: 95
  },

  // Edge cases
  {
    id: 'edge_1',
    title: '',
    content: 'Content without title',
    sourceType: 'reddit',
    crisisScore: 0.1,
    score: 10
  },
  {
    id: 'edge_2',
    title: 'Title without content',
    content: '',
    sourceType: 'news',
    crisisScore: 0.1,
    score: 5
  }
];

async function testDeduplication() {
  console.log('🧪 Testing Content Deduplication System\n');
  
  const deduplicationService = new ContentDeduplicationService();
  
  console.log(`📊 Input: ${sampleContent.length} content items`);
  console.log('Sources breakdown:');
  const sourceCount = sampleContent.reduce((acc, item) => {
    acc[item.sourceType] = (acc[item.sourceType] || 0) + 1;
    return acc;
  }, {});
  Object.entries(sourceCount).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count} items`);
  });
  
  console.log('\n🔄 Running deduplication...\n');
  
  // Test deduplication
  const startTime = Date.now();
  const result = deduplicationService.deduplicateContent(sampleContent);
  const processingTime = Date.now() - startTime;
  
  console.log('✅ Deduplication Results:');
  console.log(`📈 Processing time: ${processingTime}ms`);
  console.log(`📊 Input items: ${result.stats.processed}`);
  console.log(`📊 Output items: ${result.items.length}`);
  console.log(`🗑️  Duplicates removed: ${result.stats.duplicatesRemoved}`);
  console.log(`🔍 Duplicate groups found: ${result.stats.duplicatesFound}`);
  
  console.log('\n📋 Remaining Content:');
  result.items.forEach((item, index) => {
    console.log(`${index + 1}. [${item.sourceType?.toUpperCase()}] ${item.title || 'No title'}`);
    console.log(`   Crisis Score: ${item.crisisScore || 0}`);
    console.log(`   URL: ${item.url || 'No URL'}`);
    console.log('');
  });
  
  if (result.duplicates.length > 0) {
    console.log('🔍 Duplicate Groups Found:');
    result.duplicates.forEach((group, index) => {
      console.log(`\nGroup ${index + 1}: ${group.length} items`);
      group.forEach(item => {
        console.log(`  - [${item.source}] ${item.title} (Crisis: ${item.crisisScore})`);
      });
    });
  }
  
  // Test analysis without removal
  console.log('\n🔬 Duplicate Analysis (without removal):');
  const analysis = deduplicationService.analyzeForDuplicates(sampleContent);
  console.log(`📊 Total items: ${analysis.totalItems}`);
  console.log(`🔍 Duplicate groups: ${analysis.duplicateGroups}`);
  console.log(`🗑️  Potential duplicates: ${analysis.potentialDuplicates}`);
  
  if (analysis.duplicateGroups && analysis.duplicateGroups.length > 0) {
    console.log('\n📋 Duplicate Group Details:');
    analysis.duplicateGroups.forEach(group => {
      console.log(`  Group ${group.groupId}: ${group.itemCount} items from sources: ${group.sources.join(', ')}`);
      console.log(`    Sample titles: ${group.titles.join(' | ')}`);
    });
  }
  
  // Test configuration
  console.log('\n⚙️ Testing Configuration Updates:');
  const originalConfig = deduplicationService.getConfig();
  console.log(`Original fuzzy threshold: ${originalConfig.fuzzyMatchThreshold}`);
  
  deduplicationService.updateConfig({ fuzzyMatchThreshold: 0.95 });
  const newConfig = deduplicationService.getConfig();
  console.log(`Updated fuzzy threshold: ${newConfig.fuzzyMatchThreshold}`);
  
  // Test with stricter settings
  const strictResult = deduplicationService.deduplicateContent(sampleContent);
  console.log(`\nWith stricter settings: ${strictResult.items.length} items (removed ${strictResult.stats.duplicatesRemoved} duplicates)`);
  
  // Test statistics
  console.log('\n📊 Service Statistics:');
  const stats = deduplicationService.getStats();
  console.log(`Total processed: ${stats.totalProcessed}`);
  console.log(`Total duplicates found: ${stats.duplicatesFound}`);
  console.log(`Total duplicates removed: ${stats.duplicatesRemoved}`);
  console.log(`Average processing time: ${stats.averageProcessingTime.toFixed(2)}ms`);
  console.log(`Deduplication rate: ${(stats.deduplicationRate * 100).toFixed(1)}%`);
  
  // Test performance with larger dataset
  console.log('\n🚀 Performance Test with Larger Dataset:');
  const largeDataset = [];
  for (let i = 0; i < 500; i++) {
    largeDataset.push({
      id: `perf_${i}`,
      title: `Performance Test Title ${i % 50}`, // Create duplicates every 50 items
      content: `This is performance test content for item ${i}. Some content will be similar.`,
      sourceType: i % 3 === 0 ? 'news' : i % 3 === 1 ? 'reddit' : 'gdelt',
      crisisScore: Math.random(),
      score: Math.floor(Math.random() * 1000)
    });
  }
  
  const perfStartTime = Date.now();
  const perfResult = deduplicationService.deduplicateContent(largeDataset);
  const perfTime = Date.now() - perfStartTime;
  
  console.log(`📊 Performance Results:`);
  console.log(`  Input: ${largeDataset.length} items`);
  console.log(`  Output: ${perfResult.items.length} items`);
  console.log(`  Removed: ${perfResult.stats.duplicatesRemoved} duplicates`);
  console.log(`  Processing time: ${perfTime}ms`);
  console.log(`  Items per second: ${Math.round(largeDataset.length / (perfTime / 1000))}`);
  
  console.log('\n✅ Content Deduplication Test Complete!');
}

// Run the test
if (require.main === module) {
  testDeduplication().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testDeduplication, sampleContent };