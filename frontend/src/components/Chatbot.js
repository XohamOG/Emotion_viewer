import React, { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle chatbot

  return (
    <div>
      {/* Chatbot Button with Custom Image */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "transparent",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <img
          src="/assets/cbot.jpg" // Replace with your actual image name
          alt="Chatbot"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </button>

      {/* Chatbot Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "400px",
            height: "600px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            zIndex: 999,
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✕
          </button>

          {/* Embedded Chatbot */}
          <iframe
            src="https://app.vectorshift.ai/voicebots/embedded/67c42e6ba4d1089732434ba2"
            width="100%"
            height="100%"
            allow="microphone"
            style={{ border: "none", borderRadius: "10px" }}
          />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
