import React, { useState } from 'react';
import { Bug, Code, TestTube, Shield } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Branding */}
      <div className="lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className=" flex items-center justify-center space-x-3 mb-8">
            <div className="h-16 w-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Bug className=" h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold">BugVerse</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">
            Professional Bug Tracking Platform
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Streamline your development workflow with our intuitive bug tracking system
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-200" />
              <span className="text-blue-100">Admin Dashboard & User Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <Code className="h-6 w-6 text-blue-200" />
              <span className="text-blue-100">Developer Bug Assignment & Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <TestTube className="h-6 w-6 text-blue-200" />
              <span className="text-blue-100">Tester Bug Reporting & Status Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;