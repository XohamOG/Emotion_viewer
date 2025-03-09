import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";
import { FaHome, FaFileAlt, FaChartBar, FaUserTie, FaLifeRing } from "react-icons/fa";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";

const StyledSidebar = styled('div')({
  width: '240px',
  height: '100vh',
  background: '#1e1e1e',
  color: '#fff',
  borderRight: '1px solid #333',
});

const LogoContainer = styled(Box)({
  padding: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderBottom: '1px solid #333',
});

const InterviewerSidebar = () => {
  return (
    <StyledSidebar className="sidebar">
      <LogoContainer className="logo-container">
        <img 
          src="/assets/icon.jpeg" 
          alt="Logo" 
          className="logo" 
          style={{ width: '80px', borderRadius: '50%' }} 
        />
      </LogoContainer>
      <ul>
        <li>
          <Link to="home" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaHome className="icon" /> Home
          </Link>
        </li>
        <li>
          <Link to="interview">
            <FaUserTie className="icon" /> Start Interview
          </Link>
        </li>
        <li>
          <Link to="/interview-sessions">
            <FaFileAlt className="icon" /> Interview Sessions
          </Link>
        </li>
      </ul>
      <Box mt="auto" p={2}>
        <Typography 
          variant="body2" 
          align="center" 
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          © 2025 Emotion Viewer
        </Typography>
      </Box>
    </StyledSidebar>
  );
};

export default InterviewerSidebar;
