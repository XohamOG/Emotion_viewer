import React from "react";
import { FaUserCircle } from "react-icons/fa"; // Import a user icon
import { FaBell } from "react-icons/fa"; // Import notification icon
import { FaGlobe } from "react-icons/fa"; // Import globe/translate icon
import "../styles/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="left-icons">
        <FaBell className="icon" />
        <FaGlobe className="icon" />
      </div>
      <h1 className="header-title">Hello, Aadi 👋</h1>
      <div className="user-icon">
        <FaUserCircle />
      </div>
    </header>
  );
};

export default Header;
