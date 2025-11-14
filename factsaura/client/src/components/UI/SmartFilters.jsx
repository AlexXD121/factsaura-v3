import { motion } from 'framer-motion';
import { useState } from 'react';

const SmartFilters = ({ 
  onFilterChange, 
  onSortChange,
  activeFilters = {},
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    urgency_level: [
      { value: '', label: 'All Levels', icon: '⚪' },
      { value: 'critical', label: 'Critical', icon: '🔴' },
      { value: 'high', label: 'High', icon: '🟡' },
      { value: 'medium', label: 'Medium', icon: '🔵' },
      { value: 'low', label: 'Low', icon: '🟢' }
    ],
    is_misinformation: [
      { value: '', label: 'All Posts', icon: '📋' },
      { value: 'true', label: 'Misinformation', icon: '⚠️' },
      { value: 'false', label: 'Verified', icon: '✅' }
    ],
    harm_category: [
      { value: '', label: 'All Categories', icon: '🏷️' },
      { value: 'medical', label: 'Medical', icon: '🏥' },
      { value: 'crisis', label: 'Crisis', icon: '🚨' },
      { value: 'financial', label: 'Financial', icon: '💰' },
      { value: 'political', label: 'Political', icon: '🏛️' }
    ]
  };

  const sortOptions = [
    { value: 'created_at:desc', label: 'Latest First', icon: '🕐' },
    { value: 'created_at:asc', label: 'Oldest First', icon: '🕑' },
    { value: 'confidence:desc', label: 'Highest Confidence', icon: '📊' },
    { value: 'upvotes:desc', label: 'Most Upvoted', icon: '👍' },
    { value: 'urgency_level:desc', label: 'Most Critical', icon: '🚨' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newValue = value === '' ? undefined : value;
    onFilterChange(filterType, newValue);
  };

  const handleSortChange = (sortValue) => {
    const [sortBy, sortOrder] = sortValue.split(':');
    onSortChange(sortBy, sortOrder);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).filter(value => 
      value !== undefined && value !== ''
    ).length;
  };

  const clearAllFilters = () => {
    Object.keys(activeFilters).forEach(key => {
      onFilterChange(key, undefined);
    });
  };

  return (
    <motion.div
      className={`bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-lg ${className}`}
      layout
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Sort</h3>
            {getActiveFilterCount() > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {getActiveFilterCount()} active
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg"
              >
                ⌄
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Urgency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <select
              value={activeFilters.urgency_level || ''}
              onChange={(e) => handleFilterChange('urgency_level', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {filterOptions.urgency_level.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Misinformation Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <select
              value={activeFilters.is_misinformation || ''}
              onChange={(e) => handleFilterChange('is_misinformation', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {filterOptions.is_misinformation.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isExpanded ? 'Less Filters' : 'More Filters'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Advanced Filters (Expandable) */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-4 border-t border-gray-200/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Harm Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harm Category
              </label>
              <select
                value={activeFilters.harm_category || ''}
                onChange={(e) => handleFilterChange('harm_category', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {filterOptions.harm_category.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Generated Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Type
              </label>
              <select
                value={activeFilters.ai_generated || ''}
                onChange={(e) => handleFilterChange('ai_generated', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Sources</option>
                <option value="true">🤖 AI Detected</option>
                <option value="false">👤 User Submitted</option>
              </select>
            </div>

            {/* Confidence Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Level
              </label>
              <select
                value={activeFilters.confidence_range || ''}
                onChange={(e) => handleFilterChange('confidence_range', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Confidence</option>
                <option value="high">📊 High (80%+)</option>
                <option value="medium">📈 Medium (50-80%)</option>
                <option value="low">📉 Low (&lt;50%)</option>
              </select>
            </div>
          </div>

          {/* Filter Tags */}
          {getActiveFilterCount() > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (!value || value === '') return null;
                  
                  const filterGroup = filterOptions[key];
                  const option = filterGroup?.find(opt => opt.value === value);
                  
                  return (
                    <motion.span
                      key={key}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>{option?.icon}</span>
                      <span>{option?.label || value}</span>
                      <button
                        onClick={() => handleFilterChange(key, undefined)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        ✕
                      </button>
                    </motion.span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SmartFilters;