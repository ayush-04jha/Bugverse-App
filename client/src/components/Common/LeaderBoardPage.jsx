import React from "react";
import DeveloperLeaderboard from "./developerLeaderBoard";
import { useNavigate } from "react-router-dom";

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const onBack = ()=>{
      navigate("/");
  }
  return (
    <div className=" p-6">
      
      <h1 className="text-3xl font-bold mb-6">Developer Leaderboard</h1>
      <DeveloperLeaderboard />
     <button onClick={onBack} className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded " > ← Back </button>
    </div>
  );
}












