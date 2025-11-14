import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const containerVariants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

function PageTransition({ children, className = '' }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={`page-transition ${className}`}
      >
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Component-level transition wrapper
export function ComponentTransition({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
export function StaggeredList({ children, className = '', staggerDelay = 0.1 }) {
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Fade transition for modals and overlays
export function FadeTransition({ children, show, className = '' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Slide transition for sidebars and drawers
export function SlideTransition({ 
  children, 
  show, 
  direction = 'right', 
  className = '' 
}) {
  const slideVariants = {
    hidden: {
      x: direction === 'right' ? '100%' : direction === 'left' ? '-100%' : 0,
      y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
      opacity: 0
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={slideVariants}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageTransition;