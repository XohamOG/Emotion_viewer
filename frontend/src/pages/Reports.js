import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/Reports.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const HealthReports = () => {
  const [chartData, setChartData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [healthScore, setHealthScore] = useState(100);
  const prevDataRef = useRef({ chartData: [], timelineData: [] });

  const fetchStressData = useCallback(async () => {
    try {
      const response = await fetch(`/data/emoresults.json?timestamp=${new Date().getTime()}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const stressData = await response.json();
      let stressedCount = 0, confidentCount = 0, unknownCount = 0;
      let timeline = [];

      Object.entries(stressData).forEach(([key, { status, timestamp }]) => {
        if (status === "Stressed") stressedCount++;
        else if (status === "Confident") confidentCount++;
        else confidentCount++;

        timeline.push({ time: timestamp, stressed: status === "Stressed" ? 1 : 0, confident: status === "Confident" ? 1 : 0 });
      });

      const totalFrames = stressedCount + confidentCount + unknownCount;
      const score = totalFrames > 0 ? Math.round((confidentCount / totalFrames) * 100) : 100;

      const newChartData = [
        { name: "Stressed", count: stressedCount, color: "#D32F2F" },
        { name: "Confident", count: confidentCount, color: "#2E7D32" },
        { name: "Neutral", count: unknownCount, color: "#FF9800" },
      ];

      if (
        JSON.stringify(prevDataRef.current.chartData) !== JSON.stringify(newChartData) ||
        JSON.stringify(prevDataRef.current.timelineData) !== JSON.stringify(timeline)
      ) {
        setChartData(newChartData);
        setTimelineData(timeline);
        setHealthScore(score);
        prevDataRef.current = { chartData: newChartData, timelineData: timeline };
      }
    } catch (error) {
      console.error("Error fetching stress data:", error);
    }
  }, []);

  useEffect(() => {
    fetchStressData();
    const interval = setInterval(fetchStressData, 15000);
    return () => clearInterval(interval);
  }, [fetchStressData]);

  const COLORS = ["#D32F2F", "#2E7D32"];
  const healthData = chartData.map(({ name, count }) => ({ name, value: count }));

  return (
    <div className="health-reports-container">
      <div className="card health-score-card">
        <h3>Overall Stress Score</h3>
        <h3>Overall Stress Score</h3>
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
          <LineChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
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

      <div className="card health-score-timeline-card">
        <h3>Overall Health Score Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={healthScoreTimeline}>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="score" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthReports;
