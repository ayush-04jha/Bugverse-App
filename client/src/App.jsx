import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { BugProvider } from './contexts/BugContext';
import Navigation from './components/Navigation';
import AuthPage from './components/Auth/AuthPage';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import DeveloperDashboard from './components/Dashboard/DeveloperDashboard';
import TesterDashboard from './components/Dashboard/TesterDashboard';
import BugDetailPage from './components/BugDetail/BugDetailPage';
import LeaderboardPage from './components/Common/LeaderBoardPage';
function App() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedBugId, setSelectedBugId] = useState(null);

  const handleBugClick = (bugId) => {
    console.log("bugId:",bugId);
    
    setSelectedBugId(bugId);
    setCurrentView('bug-detail');
  };
     
     
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedBugId(null);
  };

  const handleGoToLeaderboard = () => {
    setCurrentView('leaderboard');
  };

  if (!user) {
    return <AuthPage />;
  }
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard onBugClick={handleBugClick} />;
      case 'developer':
        return <DeveloperDashboard onBugClick={handleBugClick}  />;
      case 'tester':
        return <TesterDashboard onBugClick={handleBugClick}/>;
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <BugProvider>
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <Navigation  onLeaderboardClick={handleGoToLeaderboard} />
        
        {currentView === 'dashboard' && renderDashboard()}
        
        {currentView === 'bug-detail' && (
          <BugDetailPage 
            bugId={selectedBugId} 
            onBack={handleBackToDashboard} 
          />
        )}
        {currentView === 'leaderboard' && (
          <LeaderboardPage onBack={handleBackToDashboard} />
        )}
      </div>
    </BugProvider>
  );
}

export default App;