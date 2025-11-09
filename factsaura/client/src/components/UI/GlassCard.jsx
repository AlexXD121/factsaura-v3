import { motion } from 'framer-motion'

function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  crisisLevel = null, 
  animate = true,
  hover = true,
  padding = 'md',
  ...props 
}) {
  // Crisis level styling
  const crisisClass = crisisLevel ? `crisis-${crisisLevel}` : ''
  
  // Variant styling
  const variantClasses = {
    default: 'glass-card',
    elevated: 'glass-card shadow-2xl border-white/30',
    subtle: 'glass-card bg-white/5 border-white/10',
    highlighted: 'glass-card bg-white/15 border-white/40 shadow-lg',
    danger: 'glass-card bg-red-500/10 border-red-400/30',
    warning: 'glass-card bg-yellow-500/10 border-yellow-400/30',
    success: 'glass-card bg-green-500/10 border-green-400/30',
    info: 'glass-card bg-blue-500/10 border-blue-400/30'
  }
  
  // Padding options
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  }
  
  const Component = animate ? motion.div : 'div'
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileHover: hover ? { scale: 1.02, y: -2 } : {},
    transition: { duration: 0.3, ease: "easeOut" }
  } : {}

  return (
    <Component
      className={`
        ${variantClasses[variant]} 
        ${crisisClass} 
        ${paddingClasses[padding]}
        ${className}
      `}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export default GlassCard