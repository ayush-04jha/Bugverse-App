import React from 'react';
import { useBugs } from '../../contexts/BugContext';
import { Calendar, User, Tag, MessageCircle } from 'lucide-react';

const BugCard = ({ bug, onClick, showActions, children }) => {
  const { getUserById } = useBugs();
  
  const assignedUser = bug.assignedTo ? getUserById(bug.assignedTo) : null;
  const reportedUser = getUserById(bug.reportedBy);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'testing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
          {bug.title}
        </h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(bug.priority)}`}>
            {bug.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bug.status)}`}>
            {bug.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {bug.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(bug.createdAt)}</span>
          </div>
          {assignedUser && (
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{assignedUser.name}</span>
            </div>
          )}
          {bug.comments?.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{bug.comments.length}</span>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400">
          by {reportedUser?.name}
        </div>
      </div>

      {bug.tags && bug.tags.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="h-4 w-4 text-gray-400" />
          <div className="flex space-x-1">
            {bug.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default BugCard;