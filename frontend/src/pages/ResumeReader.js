import { useState } from "react";

const ResumeReader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState([]); // Store generated questions

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    setUploading(true);
    setQuestions([]); // Reset previous questions
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed!");

      const data = await response.json(); // Get JSON response
      setQuestions(data.questions || []); // Update state with questions

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process the resume. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h2>Upload Your Resume</h2>
      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button onClick={handleSubmit} disabled={uploading}>
        {uploading ? "Processing..." : "Submit"}
      </button>

      {questions.length > 0 && (
        <div className="questions-container">
          <h3>Generated Interview Questions:</h3>
          <ul>
            {questions.map((q, index) => (
              <li key={index}>{q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumeReader;
