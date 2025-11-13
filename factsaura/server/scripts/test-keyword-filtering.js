/**
 * Test Script for Keyword-Based Content Filtering
 * Tests the KeywordFilterService functionality with sample content
 */

const KeywordFilterService = require('../services/keywordFilterService');

// Sample test content from different sources
const sampleContent = [
  // Crisis content
  {
    title: "Breaking: Major earthquake hits Mumbai, emergency evacuation underway",
    content: "A 7.2 magnitude earthquake struck Mumbai at 3:45 AM, causing widespread damage. Emergency services are coordinating evacuation efforts.",
    source: "news"
  },
  {
    title: "URGENT: Flood warning issued for Delhi residents",
    content: "Heavy rainfall has caused severe flooding in Delhi. Residents are advised to stay indoors and avoid travel.",
    source: "news"
  },
  
  // Misinformation content
  {
    title: "SHOCKING: Government hiding the truth about vaccine side effects",
    content: "Leaked documents reveal that big pharma and the government are covering up serious vaccine side effects. They don't want you to know the truth!",
    source: "reddit"
  },
  {
    title: "Conspiracy: 5G towers causing health problems - WAKE UP SHEEPLE",
    content: "The mainstream media won't tell you this, but 5G radiation is causing serious health issues. This is a deep state conspiracy to control the population.",
    source: "reddit"
  },
  
  // Viral content
  {
    title: "You won't believe what this celebrity did - GONE VIRAL",
    content: "This shocking video of a celebrity has broken the internet! Everyone is talking about it. Must see!",
    source: "social"
  },
  
  // Spam content
  {
    title: "Get rich quick with this amazing opportunity - ACT FAST!",
    content: "Make $5000 per day working from home! Limited time offer, 100% guaranteed results. Click here now!",
    source: "social"
  },
  
  // Health misinformation
  {
    title: "Miracle cure for COVID-19 that doctors don't want you to know",
    content: "This secret remedy can cure coronavirus in 24 hours! Big pharma is suppressing this information because they want to sell expensive treatments.",
    source: "blog"
  },
  
  // Normal content
  {
    title: "Local weather forecast for Mumbai",
    content: "Partly cloudy skies expected in Mumbai today with temperatures ranging from 25-30°C. Light rainfall possible in the evening.",
    source: "news"
  }
];

async function testKeywordFiltering() {
  console.log('🧪 Testing Keyword-Based Content Filtering Service\n');
  
  try {
    // Initialize the service
    const filterService = new KeywordFilterService();
    
    console.log('📊 Service Statistics:');
    console.log(JSON.stringify(filterService.getStats(), null, 2));
    console.log('\n');
    
    // Test 1: Basic content filtering
    console.log('🔍 Test 1: Basic Content Filtering');
    console.log('=' .repeat(50));
    
    const basicResult = filterService.filterContent(sampleContent, {
      categories: ['crisis', 'misinformation', 'viral', 'spam'],
      includeScores: true,
      includeMatches: true
    });
    
    console.log(`Total items processed: ${basicResult.totalProcessed}`);
    console.log(`Items after filtering: ${basicResult.totalFiltered}`);
    
    basicResult.items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   Overall Score: ${item.overallKeywordScore?.toFixed(3)}`);
      console.log(`   Primary Category: ${item.filterReason}`);
      console.log(`   Scores: Crisis(${item.keywordScores?.crisis?.toFixed(3)}), Misinformation(${item.keywordScores?.misinformation?.toFixed(3)}), Viral(${item.keywordScores?.viral?.toFixed(3)}), Spam(${item.keywordScores?.spam?.toFixed(3)})`);
      if (item.keywordMatches && Object.keys(item.keywordMatches).length > 0) {
        console.log(`   Matched Keywords:`, item.keywordMatches);
      }
    });
    
    // Test 2: Crisis content detection
    console.log('\n\n🚨 Test 2: Crisis Content Detection');
    console.log('=' .repeat(50));
    
    const crisisResult = filterService.getCrisisContent(sampleContent, 0.3);
    console.log(`Crisis items found: ${crisisResult.totalFiltered}`);
    
    crisisResult.items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Crisis Score: ${item.keywordScores?.crisis?.toFixed(3)}`);
      console.log(`   Crisis Keywords: ${item.keywordMatches?.crisis?.join(', ') || 'None'}`);
    });
    
    // Test 3: Misinformation detection
    console.log('\n\n🕵️ Test 3: Misinformation Detection');
    console.log('=' .repeat(50));
    
    const misinfoResult = filterService.getMisinformationContent(sampleContent, 0.4);
    console.log(`Misinformation items found: ${misinfoResult.totalFiltered}`);
    
    misinfoResult.items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Misinformation Score: ${item.keywordScores?.misinformation?.toFixed(3)}`);
      console.log(`   Misinformation Keywords: ${item.keywordMatches?.misinformation?.join(', ') || 'None'}`);
    });
    
    // Test 4: Spam removal
    console.log('\n\n🗑️ Test 4: Spam Content Removal');
    console.log('=' .repeat(50));
    
    const spamResult = filterService.removeSpamContent(sampleContent, 0.6);
    console.log(`Original items: ${sampleContent.length}`);
    console.log(`After spam removal: ${spamResult.totalFiltered}`);
    console.log(`Spam items removed: ${spamResult.spamRemoved}`);
    
    spamResult.items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Spam Score: ${item.keywordScores?.spam?.toFixed(3)}`);
    });
    
    // Test 5: Custom keyword management
    console.log('\n\n⚙️ Test 5: Custom Keyword Management');
    console.log('=' .repeat(50));
    
    console.log('Available categories:', filterService.getCategories());
    
    // Add custom keywords
    filterService.addKeywords('crisis', ['tsunami', 'wildfire', 'blackout']);
    console.log('Added custom crisis keywords');
    
    // Test with custom keywords
    const customContent = [{
      title: "Massive wildfire threatens residential areas",
      content: "A rapidly spreading wildfire is approaching residential neighborhoods, forcing thousands to evacuate.",
      source: "news"
    }];
    
    const customResult = filterService.filterContent(customContent, {
      categories: ['crisis'],
      includeScores: true,
      includeMatches: true
    });
    
    const customItem = Array.isArray(customResult.items) ? customResult.items[0] : customResult.items;
    console.log(`Custom keyword test - Crisis Score: ${customItem.keywordScores?.crisis?.toFixed(3)}`);
    console.log(`Matched Keywords: ${customItem.keywordMatches?.crisis?.join(', ') || 'None'}`);
    
    // Test 6: Configuration update
    console.log('\n\n🔧 Test 6: Configuration Update');
    console.log('=' .repeat(50));
    
    console.log('Original config:', filterService.config);
    
    filterService.updateConfig({
      caseSensitive: true,
      partialMatch: false,
      scoreThresholds: {
        crisis: 0.2,
        misinformation: 0.3
      }
    });
    
    console.log('Updated config:', filterService.config);
    
    // Final statistics
    console.log('\n\n📈 Final Statistics');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(filterService.getStats(), null, 2));
    
    console.log('\n✅ All keyword filtering tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testKeywordFiltering();
}

module.exports = { testKeywordFiltering, sampleContent };