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
        <div className="glass-card content-box p-12 text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-6">
              <span className="text-6xl">🔍</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
              Welcome to{' '}
              <span className="text-info">
                FactSaura
              </span>
            </h1>
            <p className="text-secondary text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered misinformation detection with transparent analysis and community trust
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <AnimatedButton variant="primary" size="xl" className="glass-button">
                🚀 Get Started
              </AnimatedButton>
              <AnimatedButton variant="outline" size="xl" className="glass-button-outlined">
                📚 Learn More
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div variants={itemVariants}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            How FactSaura Works
          </h2>
          <p className="text-secondary text-lg">
            Transparent AI analysis with community verification
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card crisis-medium p-8 h-full">
              <div className="text-center">
                <div className="text-5xl mb-6">🤖</div>
                <h3 className="text-primary font-bold text-xl mb-4">AI Analysis</h3>
                <p className="text-secondary text-base mb-6 leading-relaxed">
                  Advanced AI provides step-by-step reasoning and confidence scoring for every analysis
                </p>
                <div className="flex justify-center">
                  <ConfidenceMeter confidence={0.92} size="md" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card crisis-high p-8 h-full">
              <div className="text-center">
                <div className="text-5xl mb-6">⚡</div>
                <h3 className="text-primary font-bold text-xl mb-4">Crisis Detection</h3>
                <p className="text-secondary text-base mb-6 leading-relaxed">
                  Real-time monitoring for crisis-related misinformation with urgency-based alerts
                </p>
                <div className="flex justify-center">
                  <ConfidenceMeter confidence={0.78} size="md" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card crisis-critical p-8 h-full">
              <div className="text-center">
                <div className="text-5xl mb-6">👥</div>
                <h3 className="text-primary font-bold text-xl mb-4">Community Trust</h3>
                <p className="text-secondary text-base mb-6 leading-relaxed">
                  Community voting and expert verification build trust scores for every piece of content
                </p>
                <div className="flex justify-center">
                  <ConfidenceMeter confidence={0.85} size="md" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={itemVariants}>
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">
              Trusted by the Community
            </h2>
            <p className="text-secondary">
              Real-time statistics from our AI-powered analysis platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold text-info mb-2">1000+</div>
              <div className="text-secondary font-medium">Posts Analyzed</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold text-safe mb-2">95%</div>
              <div className="text-secondary font-medium">AI Accuracy</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold text-warning mb-2">24/7</div>
              <div className="text-secondary font-medium">Analysis Ready</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-4xl font-bold text-danger mb-2">3sec</div>
              <div className="text-secondary font-medium">Response Time</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Home