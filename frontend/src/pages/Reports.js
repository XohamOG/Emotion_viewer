import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import "../styles/Reports.css";

const socket = io("http://localhost:5000"); // Connect to Flask WebSocket server

const HealthReports = () => {
  const [chartData, setChartData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [healthScore, setHealthScore] = useState(100);

  useEffect(() => {
    socket.on("update_chart", (data) => {
      let stressedCount = 0, confidentCount = 0, unknownCount = 0;
      let timeline = [];

      Object.entries(data).forEach(([key, { status, type, timestamp }]) => {
        if (status === "Stressed") stressedCount++;
        else if (status === "Confident") confidentCount++;
        else unknownCount++;

        timeline.push({ time: timestamp, stressed: status === "Stressed" ? 1 : 0, confident: status === "Confident" ? 1 : 0 });
      });

      const totalFrames = stressedCount + confidentCount + unknownCount;
      const score = totalFrames > 0 ? Math.round((confidentCount / totalFrames) * 100) : 100;

      setChartData([
        { name: "Stressed", count: stressedCount, color: "#D32F2F" },
        { name: "Confident", count: confidentCount, color: "#2E7D32" },
        { name: "Unknown", count: unknownCount, color: "#FF9800" },
      ]);
      setTimelineData(timeline);
      setHealthScore(score);
    });

    return () => {
      socket.off("update_chart"); // Cleanup on unmount
    };
  }, []);

  const COLORS = ["#D32F2F", "#2E7D32", "#FF9800"];
  const healthData = chartData.map(({ name, count }) => ({ name, value: count }));

  return (
    <div className="health-reports-container">
      <div className="card health-score-card">
        <h3>Overall Health Score</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={healthData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
              {healthData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <p className="health-score-text">{healthScore}% Confidence</p>
      </div>

      <div className="card chart-card">
        <h3>Stress Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count">
              {chartData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card timeline-card">
        <h3>Stress Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timelineData}>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="stressed" stroke="#D32F2F" />
            <Line type="monotone" dataKey="confident" stroke="#2E7D32" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthReports;
