import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import InterviewSessionSidebar from "./InterviewSessionSidebar"; // New sidebar for interview sessions
import "../styles/IntSess.css"; // Ensure you have this file

const InterviewSessionLayout = () => {
  return (
    <div className="layout">
      <InterviewSessionSidebar /> 
        <div className="session-page-content">
          <Outlet />
        </div>
    </div>
  );
};

export default InterviewSessionLayout;
