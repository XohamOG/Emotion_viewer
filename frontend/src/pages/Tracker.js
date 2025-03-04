import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Tracker.css";

const InterviewPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/jobs/");
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
      const res = await fetch("http://127.0.0.1:8000/api/interview/jobs/", {
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
        <input
          type="text"
          value={newJobTitle}
          onChange={(e) => setNewJobTitle(e.target.value)}
          placeholder="Enter job title"
        />
        <textarea
          value={newJobDescription}
          onChange={(e) => setNewJobDescription(e.target.value)}
          placeholder="Enter job description"
          rows="4"
        />
        <button className="addbut" onClick={addJob}>Add Job</button>
      </div>

      <h3>Available Jobs</h3>
      <ul>
        {jobPositions.map((job) => (
          <li key={job.id}>{job.title} - {job.description}</li>
        ))}
      </ul>

      <Link to="/interviewer/candidates">
        <button className="canbut">Go to Candidates Page</button>
      </Link>
    </div>
  );
};

export default InterviewPage;
