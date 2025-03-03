import React, { useState } from "react";
import Tesseract from "tesseract.js";

const ResumeReader = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Progress state

  // Handle file selection
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      extractText(file);
    }
  };

  // Perform OCR with progress tracking
  const extractText = (file) => {
    setLoading(true);
    setProgress(0);

    Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.floor(m.progress * 100)); // Update progress
        }
      },
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("OCR Error:", error);
        setLoading(false);
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📄 Resume Reader</h2>
      <label htmlFor="file-upload" style={styles.fileLabel}>
        <span style={styles.fileButton}>Choose File</span>
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={styles.input}
      />

      {image && (
        <div style={styles.imageContainer}>
          <img src={image} alt="Uploaded Prescription" style={styles.image} />
        </div>
      )}

      {loading && (
        <div style={styles.progressBarContainer}>
          <p style={styles.progressText}>Processing: {progress}%</p>
          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
        </div>
      )}

      {text && (
        <div style={styles.textContainer}>
          <h3 style={styles.textTitle}>Extracted Text:</h3>
          <p style={styles.text}>{text}</p>
        </div>
      )}
    </div>
  );
};

// Styling with animations
const styles = {
  container: {
    textAlign: "center",
    padding: "30px",
    maxWidth: "600px",
    margin: "auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#ffffff",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    transition: "all 0.3s ease-in-out",
  },
  header: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
    textTransform: "uppercase",
  },
  fileLabel: {
    display: "inline-block",
    cursor: "pointer",
    backgroundColor: "#4CAF50",
    padding: "12px 24px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s, transform 0.3s",
  },
  fileButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "background-color 0.3s, transform 0.3s",
    cursor: "pointer",
  },
  input: {
    display: "none", // Hide the default file input
  },
  imageContainer: {
    marginTop: "20px",
    padding: "15px",
    borderRadius: "12px",
    backgroundColor: "#f3f3f3",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease-in-out",
  },
  image: {
    maxWidth: "100%",
    height: "auto",
    borderRadius: "12px",
  },
  progressBarContainer: {
    marginTop: "30px",
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
  progressText: {
    fontSize: "16px",
    marginBottom: "10px",
    color: "#4caf50",
    fontWeight: "bold",
  },
  progressBar: {
    height: "10px",
    backgroundColor: "#4caf50",
    transition: "width 0.3s ease-in-out",
  },
  textContainer: {
    marginTop: "30px",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    backgroundColor: "#fafafa",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
    fontSize: "16px",
    color: "#333",
    lineHeight: "1.6",
  },
  textTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  text: {
    fontSize: "16px",
    color: "#555",
  },
};

export default ResumeReader;
