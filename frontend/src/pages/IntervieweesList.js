import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/IntervieweesList.css"; // Ensure you have appropriate styles

const interviewees = [
  {
    id: 1,
    name: "Jai Doe",
    email: "john@example.com",
    role: "Software Engineer",
    experience: "3 years",
    skills: ["React", "Node.js", "MongoDB"],
    resume: "/resumes/john_doe.pdf",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Data Scientist",
    experience: "5 years",
    skills: ["Python", "Machine Learning"],
    resume: "/resumes/jane_smith.pdf",
  },
  {
    id: 3,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Product Manager",
    experience: "7 years",
    skills: ["Agile", "Scrum", "UX/UI"],
    resume: "/resumes/alice_johnson.pdf",
  },
];

const IntervieweesList = () => {
  const [selectedInterviewee, setSelectedInterviewee] = useState("");

  return (
    <div className="interviewees-list">
      <h2>Select an Interviewee</h2>

      {/* Interviewee Cards */}
      <div className="cards-container">
        {interviewees.map((interviewee) => (
          <div key={interviewee.id} className="card">
            <h3>{interviewee.name}</h3>
            <p><strong>Email:</strong> {interviewee.email}</p>
            <p><strong>Role:</strong> {interviewee.role}</p>
            <p><strong>Experience:</strong> {interviewee.experience}</p>
            <p><strong>Skills:</strong> {interviewee.skills.join(", ")}</p>
            <a
              href={interviewee.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="resume-link"
            >
              📄 View Resume
            </a>
          </div>
        ))}
      </div>

      {/* Dropdown & Start Interview Button */}
      <div className="dropdown-container">
        <select
          value={selectedInterviewee}
          onChange={(e) => setSelectedInterviewee(e.target.value)}
        >
          <option value="" disabled>Select an Interviewee</option>
          {interviewees.map((interviewee) => (
            <option key={interviewee.id} value={interviewee.id}>
              {interviewee.name} ({interviewee.role})
            </option>
          ))}
        </select>

        <Link
          to={selectedInterviewee ? `/interviewer/interview/${selectedInterviewee}` : "#"}
          className={`start-button ${!selectedInterviewee ? "disabled" : ""}`}
          onClick={(e) => !selectedInterviewee && e.preventDefault()}
        >
          Start Interview
        </Link>
      </div>
    </div>
  );
};

export default IntervieweesList;
