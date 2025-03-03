import React from "react";
import { Outlet } from "react-router-dom"; // Allows nested routing
import Sidebar from "./Sidebar";
import Header from "./Header";
import Chatbot from "./Chatbot";
import "../styles/Layout.css"; // Assuming you already have this file

const PatientLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
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

export default PatientLayout;
