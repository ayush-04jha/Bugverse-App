import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBugs } from '../../contexts/BugContext';
import { ArrowLeft, Calendar, User, Tag, MessageCircle, Send, Edit3, Save, X } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';
import PriorityBadge from '../Common/PriorityBadge';
import instance from '../../axios';
import socket from '../../socket';

const BugDetailPage = ({ bugId, onBack }) => {
  const { user } = useAuth();
  const { getBugById, getUserById, updateBug, addComment, users } = useBugs();
  const bug = getBugById(bugId);
  
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  if (!bug) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bug not found</h2>
          <p className="text-gray-600 mb-4">The bug you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go back</span>
          </button>
        </div>
      </div>
    );
  }

  const reportedUser = getUserById(bug.reportedBy);
  const assignedUser = bug.assignedTo ? getUserById(bug.assignedTo) : null;
  const developers = users.filter(u => u.role === 'developer');

  const canEdit = user.role === 'admin' || user.id === bug.assignedTo || user.id === bug.reportedBy;

  const handleStartEdit = () => {
    setEditData({
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      status: bug.status,
      assignedTo: bug.assignedTo || '',
      tags: bug.tags ? bug.tags.join(', ') : ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updates = {
      ...editData,
      tags: editData.tags ? editData.tags.split(',').map(tag => tag.trim()) : []
    };
  
    
    updateBug(bugId, updates);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleAddComment = async () => {
    if (comment.trim()) {

      try {
        const res = await instance.post(`/comments/bugs/${bugId}/comment`, {
        text: comment,
      });
        
      const newComment  = res.data;

      // emit to socket
      socket.emit("newComment",newComment)


     

      setComment('');

      } catch (err) {
          console.error('Failed to post comment:', err);
      }
      
      
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border-2 border-s-violet-800 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        
        {canEdit && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Bug</span>
          </button>
        )}

        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveEdit}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Bug Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full text-2xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-4">
                <select
                  value={editData.severity}
                  onChange={(e) => setEditData({ ...editData, severity: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="testing">Testing</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={editData.assignedTo}
                  onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Unassigned</option>
                  {developers.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{bug.title}</h1>
              <div className="flex items-center space-x-3">
                <PriorityBadge priority={bug.severity} size="lg" />
                <StatusBadge status={bug.status} size="lg" />
              </div>
            </>
          )}
        </div>

        {/* Bug Details */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Reported By</h3>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
                <span className="text-gray-900">{reportedUser?.name}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
              <div className="flex items-center space-x-2">
                {assignedUser ? (
                  <>
                    <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-3 w-3 text-gray-600" />
                    </div>
                    <span className="text-gray-900">{assignedUser.name}</span>
                  </>
                ) : (
                  <span className="text-gray-500 italic">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created</h3>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{formatDate(bug.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
            )}
          </div>

          {(bug.tags && bug.tags.length > 0) || isEditing ? (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  placeholder="Comma-separated tags"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div className="flex space-x-1">
                    {bug.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
             {bug.videoUrl && (
  <div className="mb-4 ml-6">
    
    <a href={bug.videoUrl} rel="noopener noreferrer" target="_blank" className='text-blue-400'>Bug video available</a>
  </div>
)}
        {/* Comments Section */}
        <div className="border-t border-gray-200 px-6 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
          
          {/* Add Comment */}
          <div className="mb-6">
            <div className="flex space-x-3">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Add Comment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {bug.comments?.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              bug.comments?.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{comment.user?.name}</h4>
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetailPage;