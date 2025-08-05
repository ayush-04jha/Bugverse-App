import React, { useState } from 'react';
import { useBugs } from '../../contexts/BugContext';
import { User, Shield, Code, TestTube, Edit3, Check, X } from 'lucide-react';

const UserManagement = () => {
  const { users, updateUserRole } = useBugs();
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

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

  const handleEditRole = (user) => {
    setEditingUser(user.id);
    setNewRole(user.role);
  };

  const handleSaveRole = (userId) => {
    updateUserRole(userId, newRole);
    setEditingUser(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewRole('');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4">
            <div className="font-medium text-sm text-gray-700">User</div>
            <div className="font-medium text-sm text-gray-700">Email</div>
            <div className="font-medium text-sm text-gray-700">Role</div>
            <div className="font-medium text-sm text-gray-700">Actions</div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {users.map(user => (
            <div key={user.id} className="px-6 py-4">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                
                <div className="text-gray-600">{user.email}</div>
                
                <div>
                  {editingUser === user.id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="developer">Developer</option>
                      <option value="tester">Tester</option>
                    </select>
                  ) : (
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {editingUser === user.id ? (
                    <>
                      <button
                        onClick={() => handleSaveRole(user.id)}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditRole(user)}
                      className="p-1 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;