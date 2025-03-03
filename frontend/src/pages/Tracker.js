import React, { useState, useEffect } from "react";

const InterviewPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [capturedData, setCapturedData] = useState([]);

  useEffect(() => {
    // Fetch available job positions from Django API
    fetch("http://127.0.0.1:8000/api/jobs/")
      .then((res) => res.json())
      .then((data) => setJobPositions(data))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const startInterview = async () => {
    if (!selectedJob) {
      alert("Please select a job position.");
      return;
    }

    // Create a new interview session
    const response = await fetch("http://127.0.0.1:8000/api/interviews/start/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: selectedJob }),
    });

    const data = await response.json();
    console.log("Interview Started:", data);

    // Simulate data capture (Replace with actual screen/audio capture logic)
    setCapturedData([
      { type: "image", data: "screenshot1.jpg" },
      { type: "audio", data: "audio_clip1.wav" },
    ]);
  };

  return (
    <div>
      <h2>Start Interview</h2>
      <select onChange={(e) => setSelectedJob(e.target.value)}>
        <option value="">Select a Job</option>
        {jobPositions.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>
      <button onClick={startInterview}>Start Interview</button>

      <h3>Captured Data (Simulated)</h3>
      <ul>
        {capturedData.map((item, index) => (
          <li key={index}>{item.type}: {item.data}</li>
        ))}
      </ul>
    </div>
  );
};

export default InterviewPage;
