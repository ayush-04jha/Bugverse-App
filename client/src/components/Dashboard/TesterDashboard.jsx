import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBugs } from '../../contexts/BugContext';
import { Plus, Bug, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import BugCard from '../Common/BugCard';
import ReportBugForm from './ReportBugForm';

const TesterDashboard = ({ onBugClick }) => {
  const { user } = useAuth();
  const { bugs } = useBugs();
  const [showReportForm, setShowReportForm] = useState(false);

  const reportedBugs = bugs.filter(bug => bug.reportedBy === user.id);

  const stats = {
    total: reportedBugs.length,
    open: reportedBugs.filter(bug => bug.status === 'open').length,
    resolved: reportedBugs.filter(bug => bug.status === 'resolved').length,
    inProgress: reportedBugs.filter(bug => bug.status === 'in-progress').length
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tester Dashboard</h1>
          <p className="text-gray-600">Report new bugs and track your submissions</p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Report Bug</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reported</p>
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
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Reported Bugs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Reported Bugs</h2>
        <div className="space-y-4">
          {reportedBugs.map(bug => (
            <BugCard 
              key={bug.id} 
              bug={bug} 
              onClick={() => onBugClick(bug.id)}
            />
          ))}
        </div>

        {reportedBugs.length === 0 && (
          <div className="text-center py-12">
            <Bug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bugs reported yet</h3>
            <p className="text-gray-600 mb-4">Start by reporting your first bug</p>
            <button
              onClick={() => setShowReportForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Report Bug</span>
            </button>
          </div>
        )}
      </div>

      {/* Report Bug Modal */}
      {showReportForm && (
        <ReportBugForm onClose={() => setShowReportForm(false)} />
      )}
    </div>
  );
};

export default TesterDashboard;