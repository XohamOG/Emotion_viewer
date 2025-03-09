import React from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";
import "../styles/Sidebar.css";
import { FaHome, FaFileAlt, FaChartBar, FaUserTie, FaLifeRing } from "react-icons/fa";

const StyledSidebar = styled('div')({
  width: '240px',
  height: '100vh',
  background: '#1e1e1e',
  color: '#fff',
  borderRight: '1px solid #333',
  '& .active': {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    borderRadius: '8px',
  },
  '& a:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  }
});

const InterviewerSidebar = () => {
  return (
    <StyledSidebar className="sidebar">
      <div className="logo-container">
        <img src="/assets/icon.jpeg" alt="Logo" className="logo" />
      </div>
      <ul>
        <li>
          <Link to="home" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaHome className="icon" /> Home
          </Link>
        </li>
        <li>
          <Link to="interview">
            <FaUserTie className="icon" /> Add Job
          </Link>
        </li>
        <li>
          <Link to="/interview-sessions">
            <FaFileAlt className="icon" /> Resume Uploader
          </Link>
        </li>
      </ul>
    </StyledSidebar>
  );
};

export default InterviewerSidebar;
