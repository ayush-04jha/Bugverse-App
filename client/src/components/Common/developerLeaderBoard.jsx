import React, { useEffect, useState } from "react";
import instance from "../../axios";


const getBadge = (rank) => {
  if (rank === 1) return "🥇 Gold";
  if (rank === 2) return "🥈 Silver";
  if (rank === 3) return "🥉 Bronze";
  return "🎯";
};

const DeveloperLeaderboard = () => {
 
  const [developers, setDevelopers] = useState([]);
  const [bugSlayer, setBugSlayer] = useState(null);
  
  

  // Points per bug severity
  const POINTS = {
    low: 5,
    medium: 10,
    high: 15,
    critical:20
  };

  useEffect(() => {
     
   
    const fetchData = async () => {
   
         const res = await instance.get("/bugs/resolved-bugs");
         const bugs = res.data;
         
         
    
      const devPoints = {};
      bugs.forEach((bug) => {
        if (!devPoints[bug.resolvedBy.name]) {
          devPoints[bug.resolvedBy.name] = { totalPoints: 0, weeklyPoints: 0 };
        }
        const points = POINTS[bug.severity] || 0;
        devPoints[bug.resolvedBy.name].totalPoints += points;

        // Check if bug resolved in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (new Date(bug.updatedAt) >= sevenDaysAgo) {
          devPoints[bug.resolvedBy.name].weeklyPoints += points;
        }
      });

      // Convert object to sorted array
      const sortedDevelopers = Object.entries(devPoints)
        .map(([name, scores]) => ({ name, ...scores }))
        .sort((a, b) => b.totalPoints - a.totalPoints);

      setDevelopers(sortedDevelopers);

      // Find Bug Slayer of the Week
      const weeklyTop = [...sortedDevelopers].sort(
        (a, b) => b.weeklyPoints - a.weeklyPoints
      )[0];
      setBugSlayer(weeklyTop);
    };

    fetchData();
  }, []);

  return (
    <div className=" bg-white shadow-lg rounded-xl p-6 w-full">
      <h2 className="text-2xl font-bold mb-4">🏆 Top Fixers</h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Rank</th>
            <th className="p-2">Developer</th>
            <th className="p-2">Points</th>
            <th className="p-2">Badge</th>
          </tr>
        </thead>
        <tbody>
          {developers.map((dev, idx) => (
            <tr key={dev.name} className="border-b hover:bg-gray-100">
              <td className="p-2">{idx + 1}</td>
              <td className="p-2">{dev.name}</td>
              <td className="p-2">{dev.totalPoints}</td>
              <td className="p-2">{getBadge(idx + 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {bugSlayer && (
        <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          <h3 className="text-xl font-bold">🔥 Bug Slayer of the Week</h3>
          <p>
            {bugSlayer.name} with {bugSlayer.weeklyPoints} points this week!
          </p>
        </div>
      )}
    </div>
  );
};

export default DeveloperLeaderboard;
