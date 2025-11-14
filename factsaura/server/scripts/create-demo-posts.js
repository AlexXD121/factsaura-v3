#!/usr/bin/env node

// Demo Posts Creation Script - Task 4.1
// Populates database with 15 impressive sample posts for demo

const DemoPostsData = require('../demo-data/demo-posts-data');
const Post = require('../models/Post');
const { supabaseAdmin } = require('../config/supabase');

class DemoPostsCreator {
  constructor() {
    this.demoData = new DemoPostsData();
  }

  async createDemoPosts() {
    try {
      console.log('🚀 Starting demo posts creation...');
      
      // Get system user ID
      const systemUserId = await this.getSystemUserId();
      if (!systemUserId) {
        throw new Error('System user not found. Please run user setup first.');
      }

      // Generate demo posts
      const demoPosts = this.demoData.generateDemoPosts();
      console.log(`📝 Generated ${demoPosts.length} demo posts`);

      // Clear existing demo posts (optional)
      await this.clearExistingDemoPosts();

      // Create posts in database
      const createdPosts = [];
      for (let i = 0; i < demoPosts.length; i++) {
        const postData = demoPosts[i];
        
        // Replace system user ID
        postData.author_id = systemUserId;
        
        console.log(`📄 Creating post ${i + 1}/${demoPosts.length}: "${postData.title.substring(0, 50)}..."`);
        
        try {
          const post = await Post.create(postData);
          createdPosts.push(post);
          console.log(`✅ Created post: ${post.id}`);
        } catch (error) {
          console.error(`❌ Failed to create post ${i + 1}:`, error.message);
          // Continue with other posts
        }
      }

      // Generate statistics
      const stats = this.demoData.getDemoStatistics(demoPosts);
      
      console.log('\n🎯 DEMO POSTS CREATION COMPLETE!');
      console.log('=====================================');
      console.log(`✅ Successfully created: ${createdPosts.length}/${demoPosts.length} posts`);
      console.log('\n📊 DEMO STATISTICS:');
      console.log(`• Total Posts: ${stats.total_posts}`);
      console.log(`• Misinformation Detected: ${stats.misinformation_detected} (${stats.detection_rate}%)`);
      console.log(`• AI-Generated Warnings: ${stats.ai_generated_warnings}`);
      console.log(`• Critical Urgency: ${stats.critical_urgency}`);
      console.log(`• Mutations Detected: ${stats.mutation_detected}`);
      console.log(`• Average Confidence: ${stats.average_confidence}`);
      
      console.log('\n🏷️ CATEGORY DISTRIBUTION:');
      Object.entries(stats.category_distribution).forEach(([category, count]) => {
        console.log(`• ${category}: ${count} posts`);
      });

      console.log('\n🎨 DEMO SCENARIOS AVAILABLE:');
      console.log('• Crisis Misinformation (Mumbai floods, earthquake predictions, cyclone alerts)');
      console.log('• Medical Misinformation (COVID cures, cancer treatments, insulin alternatives)');
      console.log('• Financial Scams (cash bans, crypto schemes, investment fraud)');
      console.log('• AI-Generated Warnings (automated detection and alerts)');
      console.log('• Mutation Detection (turmeric COVID cure family tree)');
      console.log('• Confidence Spectrum (15% to 99% confidence levels)');

      console.log('\n🚀 READY FOR DEMO!');
      console.log('Start the frontend and backend to see the impressive demo content.');
      
      return {
        success: true,
        created_count: createdPosts.length,
        total_count: demoPosts.length,
        statistics: stats,
        posts: createdPosts.map(p => ({ id: p.id, title: p.title, confidence: p.ai_analysis.confidence_score }))
      };

    } catch (error) {
      console.error('❌ Demo posts creation failed:', error);
      throw error;
    }
  }

  async getSystemUserId() {
    try {
      const { data: systemUser, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', 'system')
        .single();

      if (error) {
        console.error('❌ Error fetching system user:', error.message);
        return null;
      }

      console.log('✅ Found system user:', systemUser.id);
      return systemUser.id;
    } catch (error) {
      console.error('❌ Failed to get system user:', error);
      return null;
    }
  }

  async clearExistingDemoPosts() {
    try {
      console.log('🧹 Clearing existing demo posts...');
      
      // Delete posts that look like demo posts (have demo- prefix in content or are AI generated)
      const { data: demoPosts, error: fetchError } = await supabaseAdmin
        .from('posts')
        .select('id, title')
        .or('title.ilike.%URGENT:%,title.ilike.%BREAKING:%,title.ilike.%🚨%,post_type.eq.ai_generated');

      if (fetchError) {
        console.warn('⚠️ Could not fetch existing demo posts:', fetchError.message);
        return;
      }

      if (demoPosts && demoPosts.length > 0) {
        const postIds = demoPosts.map(p => p.id);
        const { error: deleteError } = await supabaseAdmin
          .from('posts')
          .delete()
          .in('id', postIds);

        if (deleteError) {
          console.warn('⚠️ Could not delete existing demo posts:', deleteError.message);
        } else {
          console.log(`✅ Cleared ${demoPosts.length} existing demo posts`);
        }
      } else {
        console.log('✅ No existing demo posts to clear');
      }
    } catch (error) {
      console.warn('⚠️ Error clearing demo posts:', error.message);
      // Continue anyway
    }
  }

  async getDemoPostsForPresentation() {
    try {
      const demoPosts = this.demoData.generateDemoPosts();
      
      // Group posts by demo scenarios
      const scenarios = {
        'High Confidence Misinformation (90%+)': demoPosts.filter(p => p.confidence >= 0.9 && p.is_misinformation),
        'Crisis Alerts (Critical Urgency)': demoPosts.filter(p => p.urgency_level === 'critical'),
        'Medical Misinformation': demoPosts.filter(p => p.harm_category === 'medical' && p.is_misinformation),
        'AI-Generated Warnings': demoPosts.filter(p => p.ai_generated),
        'Mutation Detection': demoPosts.filter(p => p.mutation_analysis?.is_mutation),
        'Low Confidence (Uncertain)': demoPosts.filter(p => p.confidence < 0.3)
      };

      console.log('\n🎭 DEMO PRESENTATION SCENARIOS:');
      console.log('=====================================');
      
      Object.entries(scenarios).forEach(([scenario, posts]) => {
        console.log(`\n📋 ${scenario} (${posts.length} posts):`);
        posts.forEach((post, index) => {
          console.log(`  ${index + 1}. "${post.title.substring(0, 60)}..." (${Math.round(post.confidence * 100)}%)`);
        });
      });

      return scenarios;
    } catch (error) {
      console.error('❌ Error generating presentation scenarios:', error);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const creator = new DemoPostsCreator();
  
  const command = process.argv[2];
  
  if (command === 'create') {
    creator.createDemoPosts()
      .then(result => {
        console.log('\n✅ Demo posts creation completed successfully!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Demo posts creation failed:', error.message);
        process.exit(1);
      });
  } else if (command === 'preview') {
    creator.getDemoPostsForPresentation()
      .then(() => {
        console.log('\n✅ Demo scenarios preview completed!');
        process.exit(0);
      })
      .catch(error => {
        console.error('\n❌ Preview failed:', error.message);
        process.exit(1);
      });
  } else {
    console.log('📖 Usage:');
    console.log('  node create-demo-posts.js create   - Create demo posts in database');
    console.log('  node create-demo-posts.js preview  - Preview demo scenarios');
    process.exit(0);
  }
}

module.exports = DemoPostsCreator;