import { motion } from 'framer-motion'

function AnimatedButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon = null,
  loadingText = 'Loading...',
  fullWidth = false,
  ...props 
}) {
  const baseClasses = 'glass-button font-medium transition-all duration-300 flex items-center justify-center relative overflow-hidden'
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
    xl: 'px-10 py-5 text-xl gap-3'
  }
  
  const variantClasses = {
    primary: 'bg-primary/20 border-primary/50 hover:bg-primary/30 hover:border-primary/70 hover:shadow-lg hover:shadow-primary/25',
    secondary: 'bg-secondary/20 border-secondary/50 hover:bg-secondary/30 hover:border-secondary/70 hover:shadow-lg hover:shadow-secondary/25',
    success: 'bg-success/20 border-success/50 hover:bg-success/30 hover:border-success/70 hover:shadow-lg hover:shadow-success/25',
    warning: 'bg-warning/20 border-warning/50 hover:bg-warning/30 hover:border-warning/70 hover:shadow-lg hover:shadow-warning/25',
    danger: 'bg-danger/20 border-danger/50 hover:bg-danger/30 hover:border-danger/70 hover:shadow-lg hover:shadow-danger/25',
    ghost: 'bg-white/5 border-white/20 hover:bg-white/15 hover:border-white/40',
    outline: 'bg-transparent border-white/30 hover:bg-white/10 hover:border-white/50'
  }

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
    />
  )

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: disabled || loading ? 1 : 1.05,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { 
      scale: disabled || loading ? 1 : 0.95,
      transition: { duration: 0.1 }
    }
  }

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Button content */}
      <div className="relative z-10 flex items-center gap-2">
        {loading ? (
          <>
            <LoadingSpinner />
            <span>{loadingText}</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </div>
    </motion.button>
  )
}

export default AnimatedButton