import React from "react";
import { Outlet } from "react-router-dom"; // Allows nested routing
import Header from "./Header";
import Chatbot from "./Chatbot";
import "../styles/Layout.css"; // Assuming you already have this file
import InterviewerSidebar from "./InterviewerSidebar";

const InterviewerLayout = () => {
  return (
    <div className="layout">
      <InterviewerSidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Outlet /> {/* Dynamic Content Goes Here */}
        </div>
      </div>
      <Chatbot />
    </div>
  );
};

export default InterviewerLayout;
