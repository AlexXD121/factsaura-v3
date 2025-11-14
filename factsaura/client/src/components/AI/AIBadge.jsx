import { motion } from 'framer-motion';

function AIBadge({ 
  type = 'generated', 
  size = 'sm', 
  animated = true,
  showIcon = true,
  urgency = 'medium',
  className = '' 
}) {
  const getBadgeConfig = (type, urgency) => {
    const baseConfigs = {
      'generated': {
        text: 'AI Generated',
        icon: '🤖',
        bg: 'bg-blue-100',
        text_color: 'text-blue-800',
        border: 'border-blue-200',
        shadow: 'shadow-blue-100'
      },
      'analyzed': {
        text: 'AI Analyzed',
        icon: '🔍',
        bg: 'bg-purple-100',
        text_color: 'text-purple-800',
        border: 'border-purple-200',
        shadow: 'shadow-purple-100'
      },
      'verified': {
        text: 'AI Verified',
        icon: '✅',
        bg: 'bg-green-100',
        text_color: 'text-green-800',
        border: 'border-green-200',
        shadow: 'shadow-green-100'
      },
      'flagged': {
        text: 'AI Flagged',
        icon: '🚨',
        bg: 'bg-red-100',
        text_color: 'text-red-800',
        border: 'border-red-200',
        shadow: 'shadow-red-100'
      },
      'uncertain': {
        text: 'AI Uncertain',
        icon: '❓',
        bg: 'bg-amber-100',
        text_color: 'text-amber-800',
        border: 'border-amber-200',
        shadow: 'shadow-amber-100'
      },
      'fallback': {
        text: 'Fallback Mode',
        icon: '🔄',
        bg: 'bg-orange-100',
        text_color: 'text-orange-800',
        border: 'border-orange-200',
        shadow: 'shadow-orange-100'
      }
    };

    const config = baseConfigs[type] || baseConfigs['generated'];
    
    // Crisis-aware styling modifications
    if (urgency === 'critical' && type === 'flagged') {
      config.bg = 'bg-red-200';
      config.border = 'border-red-400';
      config.text_color = 'text-red-900';
      config.shadow = 'shadow-red-200';
    } else if (urgency === 'high' && (type === 'flagged' || type === 'uncertain')) {
      config.bg = 'bg-amber-200';
      config.border = 'border-amber-400';
      config.text_color = 'text-amber-900';
      config.shadow = 'shadow-amber-200';
    }
    
    return config;
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'px-1.5 py-0.5 text-xs';
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  const config = getBadgeConfig(type, urgency);
  const sizeClasses = getSizeClasses(size);

  const badgeContent = (
    <div className={`
      inline-flex items-center space-x-1 rounded-full font-bold border-2 shadow-sm
      ${config.bg} ${config.text_color} ${config.border} ${config.shadow} ${sizeClasses} ${className}
    `}>
      {showIcon && (
        <motion.span
          animate={
            (type === 'flagged' && urgency === 'critical') 
              ? { rotate: [0, 10, -10, 0] }
              : {}
          }
          transition={{ 
            duration: 0.5, 
            repeat: (type === 'flagged' && urgency === 'critical') ? Infinity : 0,
            repeatDelay: 1 
          }}
        >
          {config.icon}
        </motion.span>
      )}
      <span>{config.text}</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
}

export default AIBadge;