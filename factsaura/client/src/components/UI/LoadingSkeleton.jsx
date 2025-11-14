import { motion } from 'framer-motion'

function LoadingSkeleton({ 
  variant = 'post', 
  count = 1,
  className = '',
  animated = true,
  showRetry = false,
  onRetry = null,
  error = null
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  // Error state
  if (error) {
    const ErrorWrapper = animated ? motion.div : 'div'
    const errorProps = animated ? { variants: itemVariants } : {}

    return (
      <ErrorWrapper {...errorProps}>
        <div className={`glass-card p-6 alert-warning ${className}`}>
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              Failed to Load
            </h3>
            <p className="text-secondary text-sm mb-4">
              {typeof error === 'string' ? error : error.message || 'Something went wrong'}
            </p>
            {showRetry && onRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetry}
                className="glass-button-outlined px-4 py-2 text-sm hover-lift"
              >
                🔄 Try Again
              </motion.button>
            )}
          </div>
        </div>
      </ErrorWrapper>
    )
  }

  const skeletons = Array.from({ length: count }, (_, index) => {
    const SkeletonWrapper = animated ? motion.div : 'div'
    const wrapperProps = animated ? { variants: itemVariants } : {}

    switch (variant) {
      case 'post':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`glass-card p-6 ${className}`}>
              <div className="animate-pulse">
                {/* Header with crisis indicator */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="skeleton h-3 w-3 rounded-full"></div>
                    <div className="skeleton h-4 w-20"></div>
                  </div>
                  <div className="skeleton h-6 w-16 rounded-full"></div>
                </div>
                
                {/* Title and content */}
                <div className="mb-4">
                  <div className="skeleton h-6 w-3/4 mb-3"></div>
                  <div className="skeleton h-4 w-full mb-2"></div>
                  <div className="skeleton h-4 w-5/6 mb-2"></div>
                  <div className="skeleton h-4 w-2/3 mb-4"></div>
                </div>
                
                {/* AI Analysis section */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="skeleton h-12 w-12 rounded-full"></div>
                  <div className="flex-1">
                    <div className="skeleton h-4 w-32 mb-2"></div>
                    <div className="skeleton h-3 w-48"></div>
                  </div>
                </div>
                
                {/* Tags and metadata */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="skeleton h-6 w-20 rounded-full"></div>
                  <div className="skeleton h-6 w-16 rounded-full"></div>
                  <div className="skeleton h-6 w-24 rounded-full"></div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="skeleton h-8 w-16 rounded-lg"></div>
                    <div className="skeleton h-8 w-16 rounded-lg"></div>
                    <div className="skeleton h-8 w-20 rounded-lg"></div>
                  </div>
                  <div className="skeleton h-8 w-24 rounded-lg"></div>
                </div>
              </div>
            </div>
          </SkeletonWrapper>
        )
      
      case 'feed':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`space-y-6 ${className}`}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="glass-card p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="skeleton h-8 w-8 rounded-full"></div>
                        <div className="skeleton h-4 w-24"></div>
                      </div>
                      <div className="skeleton h-6 w-20 rounded-full"></div>
                    </div>
                    <div className="skeleton h-5 w-4/5 mb-3"></div>
                    <div className="skeleton h-4 w-full mb-2"></div>
                    <div className="skeleton h-4 w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </SkeletonWrapper>
        )
      
      case 'chat':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`space-y-4 ${className}`}>
              {/* User message */}
              <div className="flex justify-end">
                <div className="glass-card p-3 max-w-xs">
                  <div className="animate-pulse">
                    <div className="skeleton h-4 w-32 mb-1"></div>
                    <div className="skeleton h-4 w-24"></div>
                  </div>
                </div>
              </div>
              
              {/* AI typing indicator */}
              <div className="flex justify-start">
                <div className="glass-card p-3 max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="skeleton h-2 w-2 rounded-full animate-bounce"></div>
                      <div className="skeleton h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="skeleton h-2 w-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <div className="skeleton h-3 w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </SkeletonWrapper>
        )
      
      case 'card':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`glass-card p-6 ${className}`}>
              <div className="animate-pulse text-center">
                <div className="skeleton h-12 w-12 rounded-full mb-4 mx-auto"></div>
                <div className="skeleton h-5 w-3/4 mb-3 mx-auto"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-5/6 mb-4 mx-auto"></div>
                <div className="skeleton h-8 w-24 rounded-lg mx-auto"></div>
              </div>
            </div>
          </SkeletonWrapper>
        )
      
      case 'profile':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`glass-card p-6 ${className}`}>
              <div className="animate-pulse">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="skeleton h-16 w-16 rounded-full"></div>
                  <div className="flex-1">
                    <div className="skeleton h-6 w-32 mb-2"></div>
                    <div className="skeleton h-4 w-48 mb-2"></div>
                    <div className="flex space-x-2">
                      <div className="skeleton h-5 w-16 rounded-full"></div>
                      <div className="skeleton h-5 w-20 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="skeleton h-8 w-12 mb-2 mx-auto"></div>
                    <div className="skeleton h-3 w-16 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="skeleton h-8 w-12 mb-2 mx-auto"></div>
                    <div className="skeleton h-3 w-16 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="skeleton h-8 w-12 mb-2 mx-auto"></div>
                    <div className="skeleton h-3 w-16 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </SkeletonWrapper>
        )
      
      case 'text':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`space-y-2 ${className}`}>
              <div className="animate-pulse">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-5/6"></div>
                <div className="skeleton h-4 w-4/6"></div>
              </div>
            </div>
          </SkeletonWrapper>
        )
      
      case 'button':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`skeleton h-10 w-24 rounded-lg ${className}`}></div>
          </SkeletonWrapper>
        )
      
      case 'avatar':
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`skeleton h-10 w-10 rounded-full ${className}`}></div>
          </SkeletonWrapper>
        )
      
      default:
        return (
          <SkeletonWrapper key={index} {...wrapperProps}>
            <div className={`skeleton h-20 w-full rounded-lg ${className}`}></div>
          </SkeletonWrapper>
        )
    }
  })

  const Container = animated ? motion.div : 'div'
  const containerProps = animated ? { 
    variants: containerVariants,
    initial: "hidden",
    animate: "visible"
  } : {}

  return (
    <Container {...containerProps}>
      {skeletons}
    </Container>
  )
}

export default LoadingSkeleton