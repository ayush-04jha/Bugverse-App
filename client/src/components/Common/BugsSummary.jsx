import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import instance from "../../axios";

// Simple Card components
const Card = ({ children, className }) => (
  <div className={`border rounded-lg shadow p-4 ${className}`}>{children}</div>
);
const CardHeader = ({ children }) => <div className="mb-2 font-semibold">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-lg font-bold">{children}</h3>;

// Colors
const SOLVED_COLOR = "#22c55e";
const REMAINING_COLOR = "#ef4444";
const INCREASED_COLOR = "#f59e0b";
const DECREASED_COLOR = "#3b82f6";
const PIE_COLORS = ["#ef4444", "#22c55e"]; // Open, Closed
const SEVERITY_COLOR = "#60a5fa";
const PENDING_COLOR = "#f59e0b";
const CLOSED_COLOR = "#10b981";

export default function BugsSummaryAdvanced() {
  const [summary, setSummary] = useState({
    overall: { total: 0, open: 0, closed: 0, critical: 0 },
    me: { assigned: 0, open: 0, closed: 0, critical: 0 },
    team: { topResolvers: [], pendingByDev: [] },
    lastWeek: { solved: 0, remaining: 0, increased: 0, decreased: 0 },
  });
  const [recent, setRecent] = useState([]);

  // Fetch summary from backend
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await instance.get("/summary/bug-summary");
        setSummary(res.data);
      
        
        setRecent(res.data.recent || []);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };
    fetchSummary();
  }, []);

  // pie data
  const pieData = useMemo(
    () => [
      { name: "Open", value: summary.overall.open },
      { name: "Closed", value: summary.overall.closed },
    ],
    [summary]
  );

  const severityDist = useMemo(() => {
    const lev = { low: 0, medium: 0, high: 0, critical: 0 };
    recent.forEach((b) => {
      const s = (b.severity || "").toLowerCase();
      if (lev[s] !== undefined) lev[s] += 1;
    });
    return Object.entries(lev).map(([level, count]) => ({ level, count }));
  }, [recent]);

  const topResolvers = summary.team.topResolvers || [];
  const pendingByDev = summary.team.pendingByDev || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Bugs Summary</h1>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="All Bugs" value={summary.overall.total} />
        <StatCard label="Open" value={summary.overall.open} accent="text-red-500" />
        <StatCard label="Closed" value={summary.overall.closed} accent="text-green-600" />
        <StatCard label="Critical" value={summary.overall.critical} accent="text-rose-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="h-[360px]">
  <CardHeader>
    <CardTitle>Open vs Closed</CardTitle>
  </CardHeader>
  <CardContent className="h-[280px] flex flex-col items-center justify-center">
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value, percent }) =>
            `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
          }
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i]} />
          ))}
        </Pie>
        <ReTooltip formatter={(value, name) => [`${value} bugs`, name]} />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  </CardContent>
</Card>


        <Card className="h-[360px]">
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={severityDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="count" name="Count" fill={SEVERITY_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Centered Team Leaderboard */}
        <div className="xl:col-span-2 flex justify-center">
          <Card className="h-[360px] w-full max-w-full">
            <CardHeader>
              <CardTitle>Team Leaderboard (Closed)</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px]">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topResolvers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="developer"
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="closed" name="Closed" fill={CLOSED_COLOR} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Last Week Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Bugs Solved vs Remaining (Last Week)</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Solved", value: summary.lastWeek.solved },
                    { name: "Remaining", value: summary.lastWeek.remaining },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  <Cell fill={SOLVED_COLOR} />
                  <Cell fill={REMAINING_COLOR} />
                </Pie>
                <ReTooltip formatter={(value, name) => [`${value} bugs`, name]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Bugs Increased vs Decreased (Last Week)</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Increased", value: summary.lastWeek.increased },
                    { name: "Decreased", value: summary.lastWeek.decreased },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value, percent }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  <Cell fill={INCREASED_COLOR} />
                  <Cell fill={DECREASED_COLOR} />
                </Pie>
                <ReTooltip formatter={(value, name) => [`${value} bugs`, name]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <Card className="shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${accent || ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
