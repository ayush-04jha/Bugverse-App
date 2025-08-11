import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBugs } from '../../contexts/BugContext';
import { Bug, Clock, CheckCircle, AlertTriangle, MessageCircle, Send } from 'lucide-react';
import BugCard from '../Common/BugCard';
import StatusBadge from '../Common/StatusBadge';

const DeveloperDashboard = ({ onBugClick }) => {
  const { user } = useAuth();
  const { bugs, updateBug, addComment } = useBugs();
  const [selectedBug, setSelectedBug] = useState(null);
  const [comment, setComment] = useState('');
    console.log("bug aa rha hai kya??",bugs);
    

    
  const assignedBugs = bugs.filter(bug =>
  !bug.assignedTo || (bug.assignedTo._id && bug.assignedTo._id.toString() === user._id)
);
console.log("assigned bugs hai??",assignedBugs);

  const stats = {
    total: assignedBugs.length,
    open: assignedBugs.filter(bug => bug.status === 'open').length,
    inProgress: assignedBugs.filter(bug => bug.status === 'in-progress').length,
    testing: assignedBugs.filter(bug => bug.status === 'testing').length
  };

  const handleStatusUpdate = (bugId, newStatus) => {
    console.log("bugId ka status kya hai?",bugId);
    
    updateBug(bugId, { status: newStatus });
  };

  const handleAddComment = (bugId) => {
    if (comment.trim()) {
      addComment(bugId, {
        userId: user._id,
        userName: user.name,
        content: comment
      });
      setComment('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Dashboard</h1>
        <p className="text-gray-600">Manage your assigned bugs and update their status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bug className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Testing</p>
              <p className="text-3xl font-bold text-purple-600">{stats.testing}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Assigned Bugs */}
      <div className="space-y-6">
        {assignedBugs.map(bug => (
          <BugCard key={bug._id} bug={bug} onClick={() => onBugClick(bug._id)}>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(bug._id, 'in-progress');
                  }}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full hover:bg-yellow-200 transition-colors"
                  disabled={bug.status === 'in-progress'}
                >
                  Start Work
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(bug._id, 'testing');
                  }}
                  className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full hover:bg-purple-200 transition-colors"
                  disabled={bug.status === 'testing' || bug.status === 'resolved'}
                >
                  Ready for Testing
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(bug._id, 'resolved');
                  }}
                  className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                  disabled={bug.status === 'resolved'}
                >
                  Mark Resolved
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBug(selectedBug === bug._id ? null : bug._id);
                }}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Comment</span>
              </button>
            </div>

            {selectedBug === bug._id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(bug._id)}
                  />
                  <button
                    onClick={() => handleAddComment(bug._id)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {bug.comments?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Comments:</h4>
                    {bug.comments.slice(-3).map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </BugCard>
        ))}
      </div>

      {assignedBugs.length === 0 && (
        <div className="text-center py-12">
          <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs assigned</h3>
          <p className="text-gray-600">You don't have any bugs assigned to you yet</p>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;