import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

function ConfidenceMeter({ 
  confidence, 
  size = 'md', 
  showPercentage = true,
  showLabel = true,
  animated = true,
  variant = 'circular',
  className = ''
}) {
  const [displayConfidence, setDisplayConfidence] = useState(0)
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayConfidence(confidence)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setDisplayConfidence(confidence)
    }
  }, [confidence, animated])

  const sizeClasses = {
    xs: 'w-12 h-12',
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  }
  
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  const getColor = (conf) => {
    if (conf >= 0.8) return { color: '#10b981', name: 'High Confidence', bg: 'bg-green-500/20' }
    if (conf >= 0.6) return { color: '#f59e0b', name: 'Medium Confidence', bg: 'bg-yellow-500/20' }
    if (conf >= 0.4) return { color: '#f97316', name: 'Low Confidence', bg: 'bg-orange-500/20' }
    return { color: '#ef4444', name: 'Very Low Confidence', bg: 'bg-red-500/20' }
  }

  const colorInfo = getColor(displayConfidence)

  if (variant === 'linear') {
    return (
      <div className={`w-full ${className}`}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">Confidence</span>
            {showPercentage && (
              <span className="text-sm font-semibold text-white">
                {Math.round(displayConfidence * 100)}%
              </span>
            )}
          </div>
        )}
        
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: colorInfo.color }}
            initial={{ width: 0 }}
            animate={{ width: `${displayConfidence * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1 
            }}
          />
        </div>
        
        {showLabel && (
          <div className="mt-2 text-xs text-white/60">
            {colorInfo.name}
          </div>
        )}
      </div>
    )
  }

  // Circular variant
  const radius = size === 'xs' ? 20 : size === 'sm' ? 28 : size === 'md' ? 40 : size === 'lg' ? 56 : 72
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (displayConfidence * circumference)
  const strokeWidth = size === 'xs' ? 3 : size === 'sm' ? 4 : size === 'md' ? 6 : size === 'lg' ? 8 : 10

  return (
    <div className={`relative ${sizeClasses[size]} flex flex-col items-center justify-center ${className}`}>
      {/* Circular progress */}
      <div className="relative">
        <svg className="transform -rotate-90 w-full h-full">
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={colorInfo.color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${colorInfo.color}40)`
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className={`font-bold text-white ${textSizes[size]}`}
            >
              {Math.round(displayConfidence * 100)}%
            </motion.span>
          )}
          
          {showLabel && size !== 'xs' && size !== 'sm' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="text-xs text-white/60 text-center leading-tight"
            >
              Confidence
            </motion.span>
          )}
        </div>
      </div>
      
      {/* Label below for smaller sizes */}
      {showLabel && (size === 'xs' || size === 'sm') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.3 }}
          className="mt-2 text-center"
        >
          <div className="text-xs text-white/60">Confidence</div>
          <div className={`text-xs font-medium ${colorInfo.bg} px-2 py-1 rounded-full mt-1`}>
            {colorInfo.name}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ConfidenceMeter