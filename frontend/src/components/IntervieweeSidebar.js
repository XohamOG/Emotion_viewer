import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css"; // Ensure this file exists
import { FaHome, FaFileAlt, FaChartBar, FaUserTie, FaLifeRing } from "react-icons/fa";

const InterviewerSidebar = () => {
  return (
    <div className="sidebar">
        <div className="logo-container">
        <img src="/assets/icon.jpeg" alt="Logo" className="logo" />
      </div>
      <ul>
        <li>
                  <Link to="home" className={({ isActive }) => (isActive ? "active" : "")}>
                    <FaHome className="icon" /> Home
                  </Link>
                </li>
        <li><Link to="interview">Add Job</Link></li>
        <li><Link to="/interview-sessions">Resume Uploader</Link></li>
      </ul>
    </div>
  );
};

export default InterviewerSidebar;
