import React from 'react';

const PriorityBadge = ({ priority, size = 'sm' }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = size === 'lg' ? 'px-3 py-2 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span className={`${sizeClasses} rounded-full font-medium border ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;