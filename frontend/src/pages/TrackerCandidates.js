import React, { useState, useRef } from "react";
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
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);

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

  const startInterview = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate before starting the interview.");
      return;
    }
    alert(`Starting interview for ${selectedCandidate.name}`);
    await startScreenShare();
  };

  const startScreenShare = async () => {
    try {
      if (screenStream) {
        stopScreenShare();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      stream.getVideoTracks()[0].onended = () => stopScreenShare();
      setScreenStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
  };

  const selectedCandidateObj = candidates.find((c) => c.id === Number(selectedCandidate));

  return (
    <>
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
            Start Interview & Screen Share
          </button>
        </div>

        {selectedCandidateObj && (
          <div className="selected-candidate-details">
            <h3>Selected Candidate</h3>
            <p><strong>Name:</strong> {selectedCandidateObj.name}</p>
            <p><strong>Email:</strong> {selectedCandidateObj.email}</p>
            <p><strong>Job:</strong> {selectedCandidateObj.job}</p>
          </div>
        )}
      </div>

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

      <video ref={videoRef} autoPlay style={{ display: "none" }}></video>
    </>
  );
};

export default TrackerCandidates;
