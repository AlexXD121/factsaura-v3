/**
 * Test Auto-Posting Functionality
 * Simulates misinformation content to test the auto-posting service
 */

const AutoPostingService = require('./services/autoPostingService');

async function testAutoPosting() {
  console.log('🧪 Testing Auto-Posting Service...');
  
  const autoPostingService = new AutoPostingService();
  
  // Mock misinformation content that should trigger auto-posts
  const mockMisinformationContent = {
    news: [
      {
        title: "BREAKING: Miracle Cure for Cancer Found in Kitchen Spice",
        content: "Scientists have discovered that turmeric can cure all types of cancer in just 24 hours. Big pharma doesn't want you to know this secret! Share immediately to save lives. No need for chemotherapy anymore.",
        source: { name: "FakeNews Today" },
        publishedAt: new Date().toISOString(),
        url: "https://fakenews.com/miracle-cure"
      }
    ],
    reddit: [
      {
        title: "URGENT: COVID Vaccines Contain Mind Control Chips",
        selftext: "My friend who works at Pfizer told me that all COVID vaccines contain microchips that can control your thoughts. The government is using 5G towers to activate them. Wake up people! Don't let them control your mind!",
        subreddit: "conspiracy",
        score: 1500,
        numComments: 200,
        created_utc: Math.floor(Date.now() / 1000),
        permalink: "/r/conspiracy/comments/test123/urgent_covid_vaccines"
      }
    ],
    gdelt: [
      {
        title: "Global Elite Planning Population Control Through Water Supply",
        description: "Secret documents reveal that world leaders are adding fertility-reducing chemicals to public water supplies. This is part of a global depopulation agenda. Drink only bottled water to protect yourself and your family.",
        country: "Global",
        tone: { score: -8.5 },
        created_at: new Date().toISOString()
      }
    ]
  };
  
  try {
    console.log('📝 Processing mock misinformation content...');
    const result = await autoPostingService.processScrapedContent(mockMisinformationContent);
    
    console.log('✅ Auto-posting test completed:');
    console.log(`   - Processed: ${result.processed} items`);
    console.log(`   - Posts created: ${result.postsCreated}`);
    console.log(`   - Errors: ${result.errors?.length || 0}`);
    
    if (result.posts && result.posts.length > 0) {
      console.log('\n🚨 Auto-generated posts:');
      result.posts.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title}`);
        console.log(`      Confidence: ${Math.round(post.confidence_score * 100)}%`);
        console.log(`      Urgency: ${post.urgency_level}`);
      });
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.item}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Auto-posting test failed:', error);
  }
}

// Run the test
testAutoPosting().then(() => {
  console.log('\n🏁 Auto-posting test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});