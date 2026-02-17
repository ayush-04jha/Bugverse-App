import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { BugProvider } from './contexts/BugContext';
import Navigation from './components/Navigation';
 
import { Outlet, Navigate } from "react-router-dom";
function App() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <BugProvider>
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <Navigation />
        <Outlet />   {/* 🔥 THIS WAS MISSING */}
      </div>
    </BugProvider>
  );
}

export default App;




