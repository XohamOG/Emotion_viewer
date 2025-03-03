import React from "react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import "../styles/LandingPage.css"; // Updated CSS file

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* 3D Spline Background */}
      <Spline
        scene="https://prod.spline.design/MZm4MqttnZzYraVm/scene.splinecode"
        className="spline-scene"
      />

      <div className="overlay">
        <h1>Welcome to Emotion View</h1>
        <p>Select your role:</p>
        <div className="buttons">
          <button className="btn patient" onClick={() => navigate("/interviewer")}>
            Interviewer
          </button>
          {/* <button className="btn caretaker" onClick={() => navigate("/caretaker")}>
            Caretaker
          </button> */}
          <button className="btn doctor" onClick={() => navigate("/interviewee")}>
            Interviewee
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
