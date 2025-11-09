import { motion } from 'framer-motion'
import { GlassCard, AnimatedButton, ConfidenceMeter } from '../components/UI'

function Feed() {
  // Mock data for demonstration
  const mockPosts = [
    {
      id: 1,
      title: "Mumbai Flood Emergency Alert",
      content: "Breaking: Severe flooding reported in Mumbai's Bandra area. Evacuation centers opened.",
      source: "@MumbaiPolice",
      timestamp: "2 minutes ago",
      crisisLevel: "critical",
      aiConfidence: 0.95,
      upvotes: 42,
      downvotes: 2,
      isVerified: true,
      aiAnalysis: "Cross-verified with official meteorological data and emergency services."
    },
    {
      id: 2,
      title: "COVID-19 Vaccine Misinformation",
      content: "False claim about vaccine side effects spreading on social media.",
      source: "@HealthWatch",
      timestamp: "15 minutes ago",
      crisisLevel: "high",
      aiConfidence: 0.87,
      upvotes: 28,
      downvotes: 5,
      isVerified: false,
      aiAnalysis: "Contradicts WHO guidelines and peer-reviewed medical research."
    },
    {
      id: 3,
      title: "Weather Update Verification",
      content: "Meteorological department confirms accuracy of weather warnings.",
      source: "@WeatherIndia",
      timestamp: "1 hour ago",
      crisisLevel: "medium",
      aiConfidence: 0.92,
      upvotes: 15,
      downvotes: 1,
      isVerified: true,
      aiAnalysis: "Matches official meteorological department forecasts."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="highlighted" padding="lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Community Feed</h1>
            <p className="text-white/80 text-lg">
              Real-time misinformation detection and community verification
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Posts */}
      <div className="space-y-6">
        {mockPosts.map((post) => (
          <motion.div key={post.id} variants={itemVariants}>
            <GlassCard 
              crisisLevel={post.crisisLevel} 
              padding="lg"
              className="hover:scale-[1.01] transition-transform duration-300"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    post.crisisLevel === 'critical' ? 'bg-red-400' :
                    post.crisisLevel === 'high' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}></div>
                  <div>
                    <span className="text-white/80 text-sm font-medium">{post.source}</span>
                    <span className="text-white/60 text-sm ml-2">• {post.timestamp}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {post.isVerified && (
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Verified
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.crisisLevel === 'critical' ? 'bg-red-500/20 text-red-300' :
                    post.crisisLevel === 'high' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {post.crisisLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{post.title}</h3>
                <p className="text-white/95 text-lg leading-relaxed font-medium">{post.content}</p>
              </div>

              {/* AI Analysis */}
              <div className="flex items-start space-x-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex-shrink-0">
                  <ConfidenceMeter confidence={post.aiConfidence} size="sm" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold mb-2 flex items-center text-sm">
                    <span className="mr-2">🤖</span>
                    AI Analysis
                  </h4>
                  <p className="text-white/90 text-sm leading-relaxed">{post.aiAnalysis}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <AnimatedButton variant="success" size="sm">
                    <span className="mr-1">👍</span>
                    {post.upvotes}
                  </AnimatedButton>
                  <AnimatedButton variant="danger" size="sm">
                    <span className="mr-1">👎</span>
                    {post.downvotes}
                  </AnimatedButton>
                  <AnimatedButton variant="ghost" size="sm">
                    Ask AI
                  </AnimatedButton>
                </div>
                
                <div className="flex space-x-2">
                  <AnimatedButton variant="outline" size="sm">
                    Share
                  </AnimatedButton>
                  <AnimatedButton variant="warning" size="sm">
                    Report
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <motion.div variants={itemVariants} className="text-center">
        <AnimatedButton variant="primary" size="lg">
          Load More Posts
        </AnimatedButton>
      </motion.div>
    </motion.div>
  )
}

export default Feed