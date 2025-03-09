import React from "react";
import { Link, useParams } from "react-router-dom";
import { styled } from "@mui/system";
import "../styles/Sidebar.css";
import { FaVideo, FaQuestionCircle, FaChartBar } from "react-icons/fa";

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

const InterviewSessionSidebar = () => {
  const { id } = useParams();

  return (
    <StyledSidebar className="sidebar">
      <div className="logo-container">
        <img src="/assets/icon.jpeg" alt="Logo" className="logo" />
      </div>
      <ul>
        <li>
          <Link 
            to={`/interviewer/interview/${id}`} 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaVideo className="icon" /> Current Session
          </Link>
        </li>
        <li>
          <Link 
            to={`/interviewer/interview/${id}/questions`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaQuestionCircle className="icon" /> Questions
          </Link>
        </li>
        <li>
          <Link 
            to={`/interviewer/interview/${id}/reports`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <FaChartBar className="icon" /> Reports
          </Link>
        </li>
      </ul>
    </StyledSidebar>
  );
};

export default InterviewSessionSidebar;
