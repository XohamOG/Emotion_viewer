import React, { useEffect, useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import medicationsData from "../data/medications.json"; // Import JSON directly
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
  const [chartData, setChartData] = useState(null);
  const [prevMissed, setPrevMissed] = useState([]);
  const [medications, setMedications] = useState(medicationsData); // Use state
  const [healthScore, setHealthScore] = useState(100);
  const audioRef = useRef(null); // Reference to the audio element

  useEffect(() => {
    const updateData = () => {
      console.log("Checking for updates...");

      setMedications(medicationsData);

      const takenCount = medicationsData.filter((med) => med.status === "taken").length;
      const missedMeds = medicationsData
        .filter((med) => med.status === "missed")
        .map((med) => med.medicationName);

      const totalMeds = takenCount + missedMeds.length;
      const score = totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 100;
      setHealthScore(score);

      setChartData([
        { name: "Stress", count: takenCount },
        { name: "Confidence", count: missedMeds.length },
      ]);

      if (JSON.stringify(prevMissed) !== JSON.stringify(missedMeds) && missedMeds.length > 0) {
        sendEmail(missedMeds);
        playAlertSound(missedMeds); // Call the new function
        setPrevMissed(missedMeds);
      }
    };

    updateData();
    const interval = setInterval(updateData, 30000);

    return () => clearInterval(interval);
  }, [prevMissed]);

  const sendEmail = (missedMeds) => {
    const templateParams = {
      to_name: "Caregiver",
      message: `The following medications were missed:\n${missedMeds.join("\n")}`,
    };

    emailjs
      .send(
        "service_2db6czl",
        "template_l77856e",
        templateParams,
        "gWwDWi49T5Lao4ZCu"
      )
      .then((response) => console.log("Email sent successfully!", response))
      .catch((error) => console.error("Email sending failed:", error));
  };

  // New function to play audio alert and show an alert dialog
  const playAlertSound = (missedMeds) => {
    // Play the audio
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          console.log("Audio alert played successfully");
        })
        .catch((error) => {
          console.error("Failed to play audio alert:", error);
        });
    }

    // Show an alert with the missed medications
    setTimeout(() => {
      alert(`Medication Alert! The following medications were missed:\n${missedMeds.join("\n")}`);
    }, 500); // Short delay to ensure audio starts playing before the alert appears
  };

  // Define colors for health score visualization
  const COLORS = ["#2E7D32", "#D32F2F"]; // Green for taken, red for missed
  const healthData = [
    { name: "Stress", value: healthScore },
    { name: "Confidence", value: 100 - healthScore },
  ];

  return (
    <div className="health-reports-container">
      {/* Audio element for the alert sound */}
      <audio ref={audioRef} src="/sounds/venator_class_alarm.mp3" preload="auto" />
      
      {/* Health Score Gauge */}
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
              fill="#82ca9d"
              paddingAngle={5}
            >
              {healthData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <p className="health-score-text">{healthScore}% Anxiety</p>
      </div>

      {/* Medication Adherence Chart */}
      <div className="card chart-card">
        <h3>Anxiety</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4C9AFF" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HealthReports;
