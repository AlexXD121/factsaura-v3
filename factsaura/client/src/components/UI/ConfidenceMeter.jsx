import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ConfidenceMeter = ({ 
  confidence, 
  size = 'md', 
  showLabel = true, 
  animated = true,
  variant = 'circular'
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(confidence);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(confidence);
    }
  }, [confidence, animated]);

  const percentage = Math.round(displayValue * 100);
  
  const getColor = (value) => {
    if (value >= 0.8) return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-500' };
    if (value >= 0.6) return { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-500' };
    if (value >= 0.4) return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-500' };
    return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-500' };
  };

  const colors = getColor(displayValue);
  
  const sizes = {
    sm: { container: 'w-12 h-12', text: 'text-xs', stroke: 2 },
    md: { container: 'w-16 h-16', text: 'text-sm', stroke: 3 },
    lg: { container: 'w-20 h-20', text: 'text-base', stroke: 4 },
    xl: { container: 'w-24 h-24', text: 'text-lg', stroke: 5 }
  };

  const sizeConfig = sizes[size];
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayValue * circumference);

  if (variant === 'linear') {
    return (
      <div className="w-full">
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Misinformation Confidence
            </span>
            <span className={`text-sm font-bold ${colors.text}`}>
              {percentage}%
            </span>
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className={`h-full ${colors.bg} rounded-full relative`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`relative ${sizeConfig.container}`}>
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="none"
            className="text-gray-200"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="25"
            cy="25"
            r={radius}
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={colors.text}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`font-bold ${colors.text} ${sizeConfig.text}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {percentage}%
          </motion.span>
        </div>

        {/* Glow effect for high confidence */}
        {displayValue >= 0.7 && (
          <motion.div
            className={`absolute inset-0 rounded-full ${colors.bg} opacity-20 blur-md`}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
      
      {showLabel && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div className={`text-xs font-medium ${colors.text}`}>
            {displayValue >= 0.8 ? 'High Risk' :
             displayValue >= 0.6 ? 'Medium Risk' :
             displayValue >= 0.4 ? 'Low Risk' : 'Verified'}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ConfidenceMeter;