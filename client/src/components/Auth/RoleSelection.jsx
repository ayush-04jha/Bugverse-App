import React, { useState } from 'react';
import { UserCheck, Code, TestTube, Shield, ArrowRight } from 'lucide-react';
import instance from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const roles = [
    {
      id: 'tester',
      title: 'Tester',
      description: 'Report bugs and track their status',
      icon: TestTube,
      color: 'bg-blue-500',
    },
    {
      id: 'developer',
      title: 'Developer',
      description: 'Fix assigned bugs and update progress',
      icon: Code,
      color: 'bg-green-500',
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage users and oversee bug tracking',
      icon: Shield,
      color: 'bg-purple-500',
    },
  ];

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    setError('');
    setLoading(true);

    try {
      const response = await instance.post('/auth/google/complete-signup', { role });
      
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update AuthContext state
        setUser(response.data.user);
        
        // Navigate to home
        navigate('/', { replace: true });
      } else {
        setError('No token received from server');
      }
    } catch (err) {
      console.error('Role selection error:', err);
      setError(err.response?.data?.msg || 'Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Role</h1>
          </div>
          <p className="text-gray-600">
            Select how you want to participate in BugVerse
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => !loading && handleRoleSelect(role.id)}
                disabled={loading}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`h-16 w-16 ${role.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {role.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {role.description}
                    </p>
                  </div>

                  {isSelected && loading && (
                    <div className="absolute top-4 right-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {!loading && (
                    <div className={`absolute top-4 right-4 ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Cancel and go back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;