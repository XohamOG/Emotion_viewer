import React, { useState } from "react";

const ResumeReader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
    } else {
      alert("Only PDF files are allowed!");
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed!");

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📄 Resume Uploader</h2>

      <label style={styles.fileLabel}>
        Select Resume (PDF)
        <input type="file" accept=".pdf" onChange={handleFileUpload} style={styles.input} />
      </label>

      {file && <p style={styles.fileName}>Selected File: {file.name}</p>}

      <button onClick={handleSubmit} style={styles.fileButton} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload & Generate Questions"}
      </button>

      {uploading && (
        <div style={styles.progressBarContainer}>
          <p style={styles.progressText}>Uploading...</p>
          <div style={{ ...styles.progressBar, width: "50%" }}></div>
        </div>
      )}

      {questions.length > 0 && (
        <div style={styles.textContainer}>
          <h3 style={styles.textTitle}>Generated Questions:</h3>
          <ul>
            {questions.map((q, index) => (
              <li key={index} style={styles.text}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

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
    marginTop: "10px",
  },
  input: {
    display: "none",
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
