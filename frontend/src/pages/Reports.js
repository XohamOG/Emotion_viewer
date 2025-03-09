import React, { useEffect, useState, useRef, useCallback } from "react";
import "../styles/Reports.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const HealthReports = () => {
  const [chartData, setChartData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [healthScore, setHealthScore] = useState(100);
  const prevDataRef = useRef({ chartData: [], timelineData: [] });

  const fetchStressData = useCallback(async () => {
    try {
      const response = await fetch(`/data/emoresults.json?timestamp=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const stressData = await response.json();
      let stressedCount = 0, confidentCount = 0, unknownCount = 0;
      let cumulativeAudioStress = 0, cumulativeVideoStress = 0;
      let timeline = [];
  
      // Convert JSON data to sorted array
      const sortedData = Object.entries(stressData).map(([key, value]) => ({ ...value, filename: key }));
  
      sortedData.forEach(({ type, status }, index) => {
        if (status === "Stressed") {
          type === "audio" ? cumulativeAudioStress++ : cumulativeVideoStress++;
          stressedCount++;
        } else {
          confidentCount++;
        }
  
        // Use index instead of timestamp
        timeline.push({
          index: index + 1, // Simple numeric sequence
          audioStress: cumulativeAudioStress,
          videoStress: cumulativeVideoStress,
          stressedCount,
          confidentCount,
        });
      });
  
      const totalFrames = stressedCount + confidentCount + unknownCount;
      const score = totalFrames > 0 ? Math.round((confidentCount / totalFrames) * 100) : 100;
  
      const newChartData = [
        { name: "Stressed", count: stressedCount, color: "#D32F2F" },
        { name: "Confident", count: confidentCount, color: "#2E7D32" },
        { name: "Unknown", count: unknownCount, color: "#FF9800" },
      ];
  
      if (
        JSON.stringify(prevDataRef.current.chartData) !== JSON.stringify(newChartData) ||
        JSON.stringify(prevDataRef.current.timelineData) !== JSON.stringify(timeline)
      ) {
        setChartData(newChartData);
        setTimelineData(timeline); // Use numeric index for X-axis
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

  const COLORS = ["#D32F2F", "#2E7D32", "#FF9800"];
  const healthData = chartData.map(({ name, count }) => ({ name, value: count }));

  return (
    <div>
      <div className="health-reports-container">
      {/* 🔹 First Graph: Overall Health Score */}
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

      {/* 🔹 Second Graph: Stress Analysis */}
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

      {/* 🔹 Third Graph: Audio & Video Stress Over Time */}
      <div className="card timeline-card">
        <h3>Audio & Video Stress Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={timelineData}>
            <XAxis dataKey="index" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="audioStress" stroke="#D32F2F" name="Audio Stress Count" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="videoStress" stroke="#2E7D32" name="Video Stress Count" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Fourth Graph: Stress vs Confidence Over Time */}
      
    </div>
      <div className="fullwcont">
      <div className="card full-width-card">
        <h3>Stress vs Confidence Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <XAxis dataKey="index" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="stressedCount" stroke="#D32F2F" name="Stressed Count" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="confidentCount" stroke="#2E7D32" name="Confident Count" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
};

export default HealthReports;
