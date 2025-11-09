import { motion } from 'framer-motion'
import { GlassCard, AnimatedButton, ConfidenceMeter } from '../components/UI'

function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="highlighted" padding="xl" className="text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6">
              <span className="text-6xl">🔍</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                FactSaura
              </span>
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered misinformation detection platform with real-time community verification
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <AnimatedButton variant="primary" size="xl" icon="🚀">
                Get Started
              </AnimatedButton>
              <AnimatedButton variant="outline" size="xl">
                Learn More
              </AnimatedButton>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>

      {/* Features Grid */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            How FactSaura Works
          </h2>
          <p className="text-white/70 text-lg">
            Three pillars of our misinformation detection system
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard crisisLevel="medium" padding="lg" className="h-full">
              <div className="text-center">
                <div className="text-5xl mb-6">🤖</div>
                <h3 className="text-white font-bold text-xl mb-4">AI Detection</h3>
                <p className="text-white/80 text-base mb-6 leading-relaxed">
                  Advanced AI agents continuously monitor and analyze content for misinformation patterns
                </p>
                <div className="flex justify-center">
                  <ConfidenceMeter confidence={0.92} size="md" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard crisisLevel="high" padding="lg" className="h-full">
              <div className="text-center">
                <div className="text-5xl mb-6">⚡</div>
                <h3 className="text-white font-bold text-xl mb-4">Real-time Alerts</h3>
                <p className="text-white/80 text-base mb-6 leading-relaxed">
                  Get instant notifications about trending misinformation and verified fact-checks
                </p>
                <div className="flex justify-center">
                  <ConfidenceMeter confidence={0.78} size="md" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard crisisLevel="critical" padding="lg" className="h-full">
              <div className="text-center">
                <div className="text-5xl mb-6">👥</div>
                <h3 className="text-white font-bold text-xl mb-4">Community Driven</h3>
                <p className="text-white/80 text-base mb-6 leading-relaxed">
                  Join experts and community members in collaborative fact-checking efforts
                </p>
                <div className="flex justify-center">
                  <ConfidenceMeter confidence={0.85} size="md" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="subtle" padding="lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Trusted by the Community
            </h2>
            <p className="text-white/70">
              Real-time statistics from our misinformation detection platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">1000+</div>
              <div className="text-white/80 font-medium">Posts Analyzed</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">95%</div>
              <div className="text-white/80 font-medium">Accuracy Rate</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-white/80 font-medium">Monitoring</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">5min</div>
              <div className="text-white/80 font-medium">Response Time</div>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

export default Home