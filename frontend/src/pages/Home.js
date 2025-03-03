import React from "react";
import Spline from "@splinetool/react-spline";
import "../styles/Home.css"; // Ensure this CSS file exists

const Home = () => {
  return (
    <div className="home-container">
      {/* Spline 3D Background */}
      <Spline
        scene="https://prod.spline.design/MZm4MqttnZzYraVm/scene.splinecode"
        className="spline-scene"
      />

      {/* Overlay Text */}
      <div className="overlay-text">
        <h1>Welcome to Emotion View</h1>
        <h2>Welcome to Interview Companion</h2>
        <p>Manage your interviews with ease.</p>
      </div>
    </div>
  );
};

export default Home;
