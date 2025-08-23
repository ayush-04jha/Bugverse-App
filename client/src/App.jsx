import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { BugProvider } from "./contexts/BugContext";
import Navigation from "./components/Navigation";
import AuthPage from "./components/Auth/AuthPage";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import DeveloperDashboard from "./components/Dashboard/DeveloperDashboard";
import TesterDashboard from "./components/Dashboard/TesterDashboard";
import BugDetailPage from "./components/BugDetail/BugDetailPage";
import LeaderboardPage from "./components/Common/LeaderBoardPage";
import BugSummary from "./components/Common/BugsSummary";

function DashboardRouter({ onBugClick }) {
  const { user } = useAuth();

  switch (user.role) {
    case "admin":
      return <AdminDashboard onBugClick={onBugClick} />;
    case "developer":
      return <DeveloperDashboard onBugClick={onBugClick} />;
    case "tester":
      return <TesterDashboard onBugClick={onBugClick} />;
    default:
      return <div>Unknown role</div>;
  }
}

function AppRoutes({ onBugClick }) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardRouter onBugClick={onBugClick} />} />
      <Route path="/bug/:bugId" element={<BugDetailPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/bugsummary" element={<BugSummary />} />
      <Route path="*" element={<div>404 Page Not Found</div>} />
    </Routes>
  );
}

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBugClick = (bugId) => {
    navigate(`/bug/${bugId}`);
  };

  const handleGoToLeaderboard = () => {
    navigate("/leaderboard");
  };

  const handleGotoBugSummary = () => {
    navigate("/bugsummary");
  };

  if (!user) {
    return <AuthPage />;
  }

  return (
    <BugProvider>
      <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
        <Navigation
          onLeaderboardClick={handleGoToLeaderboard}
          onBugSummaryClick={handleGotoBugSummary}
        />
        <AppRoutes onBugClick={handleBugClick} />
      </div>
    </BugProvider>
  );
}

// Wrap App with Router in index.js
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
