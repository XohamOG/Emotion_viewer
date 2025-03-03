import React, { useState } from "react";
import Tesseract from "tesseract.js";

const ResumeReader = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]); // Store generated questions

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      extractText(file);
    }
  };

  const extractText = (file) => {
    setLoading(true);
    setProgress(0);

    Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.floor(m.progress * 100));
        }
      },
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
        sendToBackend(text);
      })
      .catch((error) => {
        console.error("OCR Error:", error);
        setLoading(false);
      });
  };

  const sendToBackend = async (extractedText) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate-questions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume_text: extractedText }),
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error("Backend Error:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📄 Resume Reader</h2>
      <label htmlFor="file-upload" style={styles.fileLabel}>
        <span style={styles.fileButton}>Choose File</span>
      </label>
      <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} style={styles.input} />

      {image && (
        <div style={styles.imageContainer}>
          <img src={image} alt="Uploaded Resume" style={styles.image} />
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

const styles = { /* (Your existing styles) */ };

export default ResumeReader;
