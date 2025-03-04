import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaFileAlt, FaChartBar, FaUserTie, FaLifeRing } from "react-icons/fa"; // Import icons
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <div className="logo-container">
        <img src="/assets/icon.jpeg" alt="Logo" className="logo" />
      </div>
      <ul>
        <li>
          <NavLink to="home" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaHome className="icon" /> Home
          </NavLink>
        </li>
        <li>
          <NavLink to="resume" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaFileAlt className="icon" /> Resume Reader
          </NavLink>
        </li>
        <li>
          <NavLink to="reports" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaChartBar className="icon" /> Reports
          </NavLink>
        </li>
        <li>
          <NavLink to="interview" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaUserTie className="icon" /> Interview
          </NavLink>
        </li>
        <li>
          <NavLink to="support" className={({ isActive }) => (isActive ? "active" : "")}>
            <FaLifeRing className="icon" /> Support
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
