import React, { useState } from "react";
import "../styles/TrackerCandid.css";

const TrackerCandidates = () => {
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [candidates, setCandidates] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", job: "Software Engineer" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", job: "Data Analyst" },
  ]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const addCandidate = () => {
    if (!candidateName.trim() || !candidateEmail.trim() || !selectedJob) {
      alert("Please fill in all fields.");
      return;
    }

    const newCandidate = {
      id: candidates.length + 1,
      name: candidateName,
      email: candidateEmail,
      job: selectedJob,
    };

    setCandidates([...candidates, newCandidate]);
    setCandidateName("");
    setCandidateEmail("");
    setSelectedJob("");
  };

  const startInterview = () => {
    if (!selectedCandidate) return;
    alert(`Starting interview for ${selectedCandidate.name}`);
  };

  // Find the selected candidate object
  const selectedCandidateObj = candidates.find((c) => c.id === Number(selectedCandidate));

  return (
    <>
      {/* Tracker Form Section */}
      <div className="tracker-container">
        <h2>Add Candidates</h2>
        <div className="input-container">
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Enter candidate name"
          />
          <input
            type="email"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            placeholder="Enter candidate email"
          />
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            <option value="">Select a Job</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Analyst">Data Analyst</option>
          </select>
          <button onClick={addCandidate}>Add Candidate</button>
        </div>

        <h3>Choose Candidate</h3>
        <div className="choose-container">
          <select
            value={selectedCandidate || ""}
            onChange={(e) => setSelectedCandidate(Number(e.target.value))}
          >
            <option value="">Select a Candidate</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} - {candidate.job}
              </option>
            ))}
          </select>
          <button className="start-button" onClick={startInterview} disabled={!selectedCandidate}>
            Start Interview
          </button>
        </div>

        {/* Display selected candidate details (if any) */}
        {selectedCandidateObj && (
          <div className="selected-candidate-details">
            <h3>Selected Candidate</h3>
            <p><strong>Name:</strong> {selectedCandidateObj.name}</p>
            <p><strong>Email:</strong> {selectedCandidateObj.email}</p>
            <p><strong>Job:</strong> {selectedCandidateObj.job}</p>
          </div>
        )}
      </div>

      {/* Existing Candidates Section Always Visible */}
      <div className="candidates-section">
        <h3>Existing Candidates</h3>
        <div className="candidates-list">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="candidate-card">
              <h4>{candidate.name}</h4>
              <p>Email: {candidate.email}</p>
              <p>Applied for: {candidate.job}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TrackerCandidates;
