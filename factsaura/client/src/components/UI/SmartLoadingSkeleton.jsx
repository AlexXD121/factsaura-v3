import { motion } from 'framer-motion';

const SmartLoadingSkeleton = ({ 
  variant = 'post', 
  count = 1, 
  animated = true,
  className = ''
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const SkeletonElement = ({ className: elementClass, children }) => (
    <div className={`relative overflow-hidden bg-gray-200 rounded ${elementClass}`}>
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      )}
      {children}
    </div>
  );

  const PostSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <SkeletonElement className="w-16 h-6 rounded-full" />
            <SkeletonElement className="w-12 h-6 rounded-full" />
            <SkeletonElement className="w-20 h-4 rounded" />
          </div>
          <SkeletonElement className="w-3/4 h-6 rounded mb-2" />
        </div>
        <SkeletonElement className="w-16 h-16 rounded-full ml-4" />
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <SkeletonElement className="w-full h-4 rounded" />
        <SkeletonElement className="w-full h-4 rounded" />
        <SkeletonElement className="w-2/3 h-4 rounded" />
      </div>

      {/* AI Analysis */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <SkeletonElement className="w-20 h-4 rounded" />
          <SkeletonElement className="flex-1 h-px rounded" />
        </div>
        <div className="space-y-2">
          <SkeletonElement className="w-full h-3 rounded" />
          <SkeletonElement className="w-4/5 h-3 rounded" />
          <SkeletonElement className="w-3/5 h-3 rounded" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <SkeletonElement className="w-16 h-8 rounded-lg" />
          <SkeletonElement className="w-16 h-8 rounded-lg" />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonElement className="w-20 h-8 rounded-lg" />
          <SkeletonElement className="w-16 h-8 rounded-lg" />
          <SkeletonElement className="w-18 h-8 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );

  const CardSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg"
    >
      <SkeletonElement className="w-3/4 h-6 rounded mb-4" />
      <div className="space-y-2 mb-4">
        <SkeletonElement className="w-full h-4 rounded" />
        <SkeletonElement className="w-2/3 h-4 rounded" />
      </div>
      <div className="flex justify-between">
        <SkeletonElement className="w-20 h-8 rounded-lg" />
        <SkeletonElement className="w-16 h-8 rounded-lg" />
      </div>
    </motion.div>
  );

  const ListSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="flex items-center space-x-4 p-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg"
    >
      <SkeletonElement className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonElement className="w-1/2 h-4 rounded" />
        <SkeletonElement className="w-3/4 h-3 rounded" />
      </div>
      <SkeletonElement className="w-16 h-8 rounded-lg" />
    </motion.div>
  );

  const StatSkeleton = () => (
    <motion.div
      variants={itemVariants}
      className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg text-center"
    >
      <SkeletonElement className="w-16 h-16 rounded-full mx-auto mb-4" />
      <SkeletonElement className="w-20 h-6 rounded mx-auto mb-2" />
      <SkeletonElement className="w-24 h-4 rounded mx-auto" />
    </motion.div>
  );

  const getSkeletonComponent = () => {
    switch (variant) {
      case 'post': return PostSkeleton;
      case 'card': return CardSkeleton;
      case 'list': return ListSkeleton;
      case 'stat': return StatSkeleton;
      default: return PostSkeleton;
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </motion.div>
  );
};

export default SmartLoadingSkeleton;