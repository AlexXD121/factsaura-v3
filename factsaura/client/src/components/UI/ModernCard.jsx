import { motion } from 'framer-motion';
import { useState } from 'react';

const ModernCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  glow = false,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    default: 'bg-white/80 backdrop-blur-xl border border-gray-200/50',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    gradient: 'bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl border border-gray-200/30',
    danger: 'bg-red-50/80 backdrop-blur-xl border border-red-200/50',
    warning: 'bg-amber-50/80 backdrop-blur-xl border border-amber-200/50',
    success: 'bg-green-50/80 backdrop-blur-xl border border-green-200/50',
    info: 'bg-blue-50/80 backdrop-blur-xl border border-blue-200/50'
  };

  const hoverEffects = hover ? {
    whileHover: { 
      y: -4,
      scale: 1.02,
      boxShadow: glow 
        ? "0 20px 40px rgba(0, 0, 0, 0.1), 0 0 30px rgba(59, 130, 246, 0.3)"
        : "0 20px 40px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
    whileTap: { scale: 0.98 }
  } : {};

  return (
    <motion.div
      className={`
        ${variants[variant]}
        rounded-2xl shadow-lg transition-all duration-300
        ${glow && isHovered ? 'shadow-blue-500/25' : ''}
        ${className}
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      {...hoverEffects}
      {...props}
    >
      {children}
      
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default ModernCard;