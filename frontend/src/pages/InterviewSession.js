import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/InterviewSession.css";
import TrackerCandidates from "./TrackerCandidates"; // Import TrackerCandidates
import ResumeReader from "./ResumeReader"; // Import ResumeReader component

const interviewees = [
  {
    id: 1,
    name: "Jai Doe",
    email: "john@example.com",
    role: "Software Engineer",
    experience: "3 years",
    skills: ["React", "Node.js", "MongoDB"],
    resume: "/resumes/jai_resume.pdf",
    image: "/images/jai_image.jpg",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Data Scientist",
    experience: "5 years",
    skills: ["Python", "Machine Learning"],
    resume: "/resumes/jane_resume.pdf",
    image: "/images/jane.jpg",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Product Manager",
    experience: "7 years",
    skills: ["Agile", "Scrum", "UX/UI"],
    resume: "/resumes/alice_resume.pdf",
    image: "/images/alice.jpg",
  },
];

const InterviewSession = () => {
  const { id } = useParams();
  const candidate = interviewees.find((c) => c.id === parseInt(id));

  return (
    <div className="interview-container">
      <div className="interview-sidebar">
        {candidate ? (
          <div className="interview-candidate-card">
            <img
              src={process.env.PUBLIC_URL + candidate.image}
              alt={candidate.name}
              className="interview-candidate-image"
            />
            <h2>{candidate.name}</h2>
            <p><strong>Email:</strong> {candidate.email}</p>
            <p><strong>Role:</strong> {candidate.role}</p>
            <p><strong>Experience:</strong> {candidate.experience}</p>
            <h4>Skills:</h4>
            <div className="interview-skills-container">
              {candidate.skills.map((skill, index) => (
                <span key={index} className="interview-skill-badge">{skill}</span>
              ))}
            </div>
          </div>
        ) : (
          <p className="error-message">No candidate found for ID {id}.</p>
        )}

        <div className="interview-questions">
          <h2>📌 Generated Interview Questions</h2>
          {candidate && candidate.resume ? (
            <ResumeReader /> // Use the ResumeReader here to display questions
          ) : (
            <p>Resume not available.</p>
          )}
        </div>
      </div>

      <div className="interview-right-container">
        <div className="interview-resume-section">
          {candidate && candidate.resume ? (
            <iframe
              src={process.env.PUBLIC_URL + candidate.resume}
              title="Candidate Resume"
              className="interview-resume"
              aria-label="Candidate Resume"
            ></iframe>
          ) : (
            <p className="error-message">Resume not available.</p>
          )}
        </div>

        <div className="interview-footer">
          <TrackerCandidates /> {/* Only the Start Interview button will show now */}
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
