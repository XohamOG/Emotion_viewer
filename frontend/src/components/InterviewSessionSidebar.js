import React from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/Sidebar.css"; // Use or create styles
import { FaVideo, FaQuestionCircle, FaChartBar } from "react-icons/fa";

const InterviewSessionSidebar = () => {
  const { id } = useParams(); // Get the current interview ID from URL

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src="/assets/icon.jpeg" alt="Logo" className="logo" />
      </div>
      <ul>
        <li>
          <Link to={`/interviewer/interview/${id}`}>
            <FaVideo className="icon" /> Current Session
          </Link>
        </li>
        <li>
          <Link to={`/interviewer/interview/${id}/questions`}>
            <FaQuestionCircle className="icon" /> Questions
          </Link>
        </li>
        <li>
          <Link to={`/interviewer/interview/${id}/reports`}>
            <FaChartBar className="icon" /> Reports
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default InterviewSessionSidebar;
