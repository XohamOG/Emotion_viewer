import React from "react";
import { FaUserCircle, FaBell, FaGlobe } from "react-icons/fa";
import { styled } from "@mui/system";
import "../styles/Header.css";

const StyledHeader = styled('header')({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: '#fff',
});

const Header = () => {
  return (
    <StyledHeader className="header">
      <div className="left-icons">
        <FaBell className="icon" />
        <FaGlobe className="icon" />
      </div>
      <h1 className="header-title">Hello, Aadi 👋</h1>
      <div className="user-icon">
        <FaUserCircle />
      </div>
    </StyledHeader>
  );
};

export default Header;
