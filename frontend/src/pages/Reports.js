import React, { useEffect, useState, useRef } from "react";
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
} from "recharts";

const HealthReports = () => {
  const [chartData, setChartData] = useState([
    { name: "Stressed", count: 0, color: "#D32F2F" },
    { name: "Confident", count: 0, color: "#2E7D32" },
    { name: "Unknown", count: 0, color: "#FF9800" },
  ]);
  const [healthScore, setHealthScore] = useState(100);
  const audioRef = useRef(null);

  // Function to fetch latest JSON data
  const fetchStressData = async () => {
    try {
      console.log("Fetching stress data...");
      const response = await fetch("/data/emoresults.json?" + new Date().getTime());
 // Cache-busting
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const stressData = await response.json();
      console.log("Fetched JSON data:", stressData); // ✅ This confirms it's reading the file
  
      let stressedCount = 0;
      let confidentCount = 0;
      let unknownCount = 0;
  
      Object.values(stressData).forEach((status) => {
        if (status === "Stressed") {
          stressedCount++;
        } else if (status === "Confident") {
          confidentCount++;
        } else {
          unknownCount++;
        }
      });
  
      console.log(`Parsed data -> Stressed: ${stressedCount}, Confident: ${confidentCount}, Unknown: ${unknownCount}`);
  
      const totalFrames = stressedCount + confidentCount + unknownCount;
      const score = totalFrames > 0 ? Math.round((confidentCount / totalFrames) * 100) : 100;
      setHealthScore(score);
  
      setChartData([
        { name: "Stressed", count: stressedCount, color: "#D32F2F" },
        { name: "Confident", count: confidentCount, color: "#2E7D32" },
        { name: "Unknown", count: unknownCount, color: "#FF9800" },
      ]);
    } catch (error) {
      console.error("Error fetching stress data:", error);
    }
  };
  

  useEffect(() => {
    fetchStressData();
    const interval = setInterval(fetchStressData, 30000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ["#D32F2F", "#2E7D32", "#FF9800"];
  const healthData = chartData.map(({ name, count }) => ({ name, value: count }));

  return (
    <div className="health-reports-container">
      <audio ref={audioRef} src="/sounds/venator_class_alarm.mp3" preload="auto" />

      <div className="card health-score-card">
        <h3>Stress Score</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={healthData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={180}
              endAngle={0}
              paddingAngle={5}
            >
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
    </div>
  );
};

export default HealthReports;
