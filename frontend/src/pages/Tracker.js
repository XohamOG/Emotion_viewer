import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Tracker.css";

const InterviewPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/jobs/");
      if (!res.ok) throw new Error("Failed to fetch jobs.");
      const data = await res.json();
      setJobPositions(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const addJob = async () => {
    if (!newJobTitle.trim() || !newJobDescription.trim()) {
      alert("Please enter a job title and description.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/jobs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newJobTitle, description: newJobDescription }),
      });

      if (!res.ok) throw new Error("Failed to add job.");
      setNewJobTitle("");
      setNewJobDescription("");
      fetchJobs();
    } catch (err) {
      alert("Error adding job: " + err.message);
    }
  };

  return (
    <div className="container">
      <h2>Start Interview</h2>

      <div className="inpcont">
        <input type="text" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} placeholder="Enter job title" />
        <textarea value={newJobDescription} onChange={(e) => setNewJobDescription(e.target.value)} placeholder="Enter job description" rows="4" />
        <button className="addbut" onClick={addJob}>Add Job</button>
      </div>

      <select onChange={(e) => setSelectedJob(e.target.value)}>
        <option value="">Select a Job</option>
        {jobPositions.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>

      <Link to="/interviewer/candidates">
        <button className="canbut">Go to Candidates Page</button>
      </Link>

      <video ref={videoRef} autoPlay style={{ display: "none" }}></video>
    </div>
  );
};

export default InterviewPage;
