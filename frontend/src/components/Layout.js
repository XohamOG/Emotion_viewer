import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Chatbot from "./Chatbot"; // Import Chatbot component
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ResumeReader from "../pages/ResumeReader";
import Reports from "../pages/Reports";
import Support from "../pages/Support";
import Medicines from "../pages/Tracker";
import "../styles/Layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/resume" element={<ResumeReader />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </div>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Layout;
