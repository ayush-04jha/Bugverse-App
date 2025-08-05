import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bug, LogOut, User, Shield, Code, TestTube } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'developer': return <Code className="h-4 w-4" />;
      case 'tester': return <TestTube className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'developer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tester': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bug className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">BugVerse</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{user?.name}</span>
              <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                {getRoleIcon(user?.role)}
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;