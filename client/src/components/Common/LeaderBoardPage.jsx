import React from "react";
import DeveloperLeaderboard from "./developerLeaderBoard";

export default function LeaderboardPage({ onBack }) {
  return (
    <div className=" p-6">
      
      <h1 className="text-3xl font-bold mb-6">Developer Leaderboard</h1>
      <DeveloperLeaderboard />
      <button
        onClick={onBack}
        className="mt-6 px-4 py-2  bg-blue-600 hover:bg-blue-700 transition text-white rounded "
      >
        ← Back
      </button>
    </div>
  );
}
