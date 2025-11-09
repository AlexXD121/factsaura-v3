import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GlassCard, 
  AnimatedButton, 
  ConfidenceMeter, 
  LoadingSkeleton 
} from '../components/UI'

function ComponentTest() {
  const [confidence, setConfidence] = useState(0.75)
  const [loading, setLoading] = useState(false)
  const [showSkeletons, setShowSkeletons] = useState(false)

  const handleLoadingTest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 3000)
  }

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
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <GlassCard variant="highlighted" padding="lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              🧪 UI Components Test Lab
            </h1>
            <p className="text-white/80">
              Testing all FactSaura UI components with glassmorphism styling
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* GlassCard Variants */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-6">GlassCard Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard variant="default">
            <h3 className="text-lg font-semibold text-white mb-2">Default</h3>
            <p className="text-white/80">Standard glassmorphism card</p>
          </GlassCard>
          
          <GlassCard variant="elevated">
            <h3 className="text-lg font-semibold text-white mb-2">Elevated</h3>
            <p className="text-white/80">Enhanced shadow and border</p>
          </GlassCard>
          
          <GlassCard variant="subtle">
            <h3 className="text-lg font-semibold text-white mb-2">Subtle</h3>
            <p className="text-white/80">Minimal background opacity</p>
          </GlassCard>
          
          <GlassCard variant="highlighted">
            <h3 className="text-lg font-semibold text-white mb-2">Highlighted</h3>
            <p className="text-white/80">Increased visibility</p>
          </GlassCard>
          
          <GlassCard variant="success">
            <h3 className="text-lg font-semibold text-white mb-2">Success</h3>
            <p className="text-white/80">Green accent for positive states</p>
          </GlassCard>
          
          <GlassCard variant="danger">
            <h3 className="text-lg font-semibold text-white mb-2">Danger</h3>
            <p className="text-white/80">Red accent for warnings</p>
          </GlassCard>
        </div>
      </motion.section>

      {/* Crisis Level Cards */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-6">Crisis Level Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard crisisLevel="critical">
            <div className="text-center">
              <div className="text-2xl mb-2">🔴</div>
              <h3 className="text-lg font-semibold text-white mb-2">Critical</h3>
              <p className="text-white/80">Immediate danger alert</p>
            </div>
          </GlassCard>
          
          <GlassCard crisisLevel="high">
            <div className="text-center">
              <div className="text-2xl mb-2">🟡</div>
              <h3 className="text-lg font-semibold text-white mb-2">High</h3>
              <p className="text-white/80">Significant concern</p>
            </div>
          </GlassCard>
          
          <GlassCard crisisLevel="medium">
            <div className="text-center">
              <div className="text-2xl mb-2">🟢</div>
              <h3 className="text-lg font-semibold text-white mb-2">Medium</h3>
              <p className="text-white/80">Moderate attention needed</p>
            </div>
          </GlassCard>
        </div>
      </motion.section>

      {/* AnimatedButton Variants */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-6">AnimatedButton Variants</h2>
        <GlassCard>
          <div className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <AnimatedButton variant="primary">Primary</AnimatedButton>
                <AnimatedButton variant="secondary">Secondary</AnimatedButton>
                <AnimatedButton variant="success">Success</AnimatedButton>
                <AnimatedButton variant="warning">Warning</AnimatedButton>
                <AnimatedButton variant="danger">Danger</AnimatedButton>
                <AnimatedButton variant="ghost">Ghost</AnimatedButton>
                <AnimatedButton variant="outline">Outline</AnimatedButton>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <AnimatedButton size="xs">Extra Small</AnimatedButton>
                <AnimatedButton size="sm">Small</AnimatedButton>
                <AnimatedButton size="md">Medium</AnimatedButton>
                <AnimatedButton size="lg">Large</AnimatedButton>
                <AnimatedButton size="xl">Extra Large</AnimatedButton>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">States</h3>
              <div className="flex flex-wrap gap-4">
                <AnimatedButton 
                  loading={loading} 
                  onClick={handleLoadingTest}
                  loadingText="Processing..."
                >
                  {loading ? 'Loading...' : 'Test Loading'}
                </AnimatedButton>
                <AnimatedButton disabled>Disabled</AnimatedButton>
                <AnimatedButton icon="🚀">With Icon</AnimatedButton>
                <AnimatedButton fullWidth>Full Width</AnimatedButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.section>

      {/* ConfidenceMeter */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-6">ConfidenceMeter</h2>
        <GlassCard>
          <div className="space-y-8">
            {/* Confidence Control */}
            <div>
              <label className="block text-white mb-4">
                Confidence Level: {Math.round(confidence * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Circular Variants */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Circular Sizes</h3>
              <div className="flex flex-wrap items-center gap-8">
                <ConfidenceMeter confidence={confidence} size="xs" />
                <ConfidenceMeter confidence={confidence} size="sm" />
                <ConfidenceMeter confidence={confidence} size="md" />
                <ConfidenceMeter confidence={confidence} size="lg" />
                <ConfidenceMeter confidence={confidence} size="xl" />
              </div>
            </div>

            {/* Linear Variant */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Linear Progress</h3>
              <ConfidenceMeter 
                confidence={confidence} 
                variant="linear" 
                className="max-w-md"
              />
            </div>
          </div>
        </GlassCard>
      </motion.section>

      {/* LoadingSkeleton */}
      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-6">LoadingSkeleton</h2>
        <GlassCard>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Skeleton Variants</h3>
              <AnimatedButton
                size="sm"
                onClick={() => setShowSkeletons(!showSkeletons)}
              >
                {showSkeletons ? 'Hide' : 'Show'} Skeletons
              </AnimatedButton>
            </div>

            {showSkeletons && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-white mb-4">Post Skeleton</h4>
                  <LoadingSkeleton variant="post" />
                </div>

                <div>
                  <h4 className="text-white mb-4">Feed Skeleton</h4>
                  <LoadingSkeleton variant="feed" />
                </div>

                <div>
                  <h4 className="text-white mb-4">Chat Skeleton</h4>
                  <LoadingSkeleton variant="chat" />
                </div>

                <div>
                  <h4 className="text-white mb-4">Card Skeletons</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <LoadingSkeleton variant="card" />
                    <LoadingSkeleton variant="card" />
                    <LoadingSkeleton variant="card" />
                  </div>
                </div>

                <div>
                  <h4 className="text-white mb-4">Profile Skeleton</h4>
                  <LoadingSkeleton variant="profile" />
                </div>

                <div>
                  <h4 className="text-white mb-4">Small Components</h4>
                  <div className="flex flex-wrap gap-4">
                    <LoadingSkeleton variant="button" />
                    <LoadingSkeleton variant="avatar" />
                    <LoadingSkeleton variant="text" className="w-48" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.section>

      {/* Performance Test */}
      <motion.section variants={itemVariants}>
        <GlassCard variant="info">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              ✅ All Components Loaded Successfully
            </h3>
            <p className="text-white/80">
              All UI components are working with smooth animations and glassmorphism effects
            </p>
          </div>
        </GlassCard>
      </motion.section>
    </motion.div>
  )
}

export default ComponentTest