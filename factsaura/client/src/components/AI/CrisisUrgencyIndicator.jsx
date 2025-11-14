import { motion } from 'framer-motion';

function CrisisUrgencyIndicator({ 
  urgencyLevel = 'medium', 
  size = 'md',
  animated = true,
  showDescription = false,
  className = '' 
}) {
  const getUrgencyConfig = (level) => {
    switch (level) {
      case 'critical':
        return {
          icon: '🚨',
          text: 'CRITICAL',
          bg: 'bg-red-100',
          text_color: 'text-red-900',
          border: 'border-red-400',
          shadow: 'shadow-red-200',
          description: 'Immediate action required - high risk of harm',
          pulseColor: 'bg-red-500'
        };
      case 'high':
        return {
          icon: '⚠️',
          text: 'HIGH',
          bg: 'bg-amber-100',
          text_color: 'text-amber-900',
          border: 'border-amber-400',
          shadow: 'shadow-amber-200',
          description: 'Urgent attention needed - moderate risk',
          pulseColor: 'bg-amber-500'
        };
      case 'medium':
        return {
          icon: '🔵',
          text: 'MEDIUM',
          bg: 'bg-blue-100',
          text_color: 'text-blue-900',
          border: 'border-blue-400',
          shadow: 'shadow-blue-200',
          description: 'Standard monitoring - low to moderate risk',
          pulseColor: 'bg-blue-500'
        };
      case 'low':
        return {
          icon: '🟢',
          text: 'LOW',
          bg: 'bg-green-100',
          text_color: 'text-green-900',
          border: 'border-green-400',
          shadow: 'shadow-green-200',
          description: 'Minimal concern - very low risk',
          pulseColor: 'bg-green-500'
        };
      default:
        return {
          icon: '🔵',
          text: 'UNKNOWN',
          bg: 'bg-gray-100',
          text_color: 'text-gray-900',
          border: 'border-gray-400',
          shadow: 'shadow-gray-200',
          description: 'Risk level assessment pending',
          pulseColor: 'bg-gray-500'
        };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const config = getUrgencyConfig(urgencyLevel);
  const sizeClasses = getSizeClasses(size);

  const indicatorContent = (
    <div className={`
      inline-flex items-center space-x-2 rounded-full font-bold border-2 shadow-lg relative overflow-hidden
      ${config.bg} ${config.text_color} ${config.border} ${config.shadow} ${sizeClasses} ${className}
    `}>
      {/* Pulse effect for critical urgency */}
      {urgencyLevel === 'critical' && (
        <motion.div
          className={`absolute inset-0 rounded-full ${config.pulseColor} opacity-20`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.1, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
      <motion.span
        className="text-lg relative z-10"
        animate={
          urgencyLevel === 'critical' 
            ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }
            : urgencyLevel === 'high'
            ? { scale: [1, 1.05, 1] }
            : {}
        }
        transition={{ 
          duration: urgencyLevel === 'critical' ? 0.5 : 1,
          repeat: (urgencyLevel === 'critical' || urgencyLevel === 'high') ? Infinity : 0,
          repeatDelay: urgencyLevel === 'critical' ? 0.5 : 2
        }}
      >
        {config.icon}
      </motion.span>
      
      <span className="relative z-10">{config.text}</span>
    </div>
  );

  if (animated) {
    return (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          {indicatorContent}
        </motion.div>
        
        {showDescription && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-xs text-center text-secondary max-w-xs"
          >
            {config.description}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {indicatorContent}
      {showDescription && (
        <div className="mt-2 text-xs text-center text-secondary max-w-xs">
          {config.description}
        </div>
      )}
    </div>
  );
}

export default CrisisUrgencyIndicator;