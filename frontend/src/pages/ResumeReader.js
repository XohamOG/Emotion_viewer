import { useState } from "react";

const ResumeReader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }
  
    setUploading(true);
    setQuestions(null);
  
    const formData = new FormData();
    formData.append("resume", file);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-resume/", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
  
      const text = await response.text(); // Get raw response
  
      // 🔥 Remove code block formatting (```json ... ```)
      const cleanedText = text.replace(/```json|```/g, "").trim();
  
      let data;
      try {
        data = JSON.parse(cleanedText); // Parse cleaned JSON
      } catch (jsonError) {
        console.error("Invalid JSON response:", cleanedText);
        throw new Error("Invalid JSON response from API");
      }
  
      // 🔥 Fix response structure issue
      if (Array.isArray(data.questions)) {
        const parsedQuestions = JSON.parse(data.questions.join("")); // Convert array to valid JSON object
        console.log("Parsed API Response:", parsedQuestions);
        if (parsedQuestions.Simple || parsedQuestions.Medium || parsedQuestions.Difficult) {
          setQuestions(parsedQuestions);
        } else {
          throw new Error("API response missing expected keys.");
        }
      } else {
        throw new Error("Unexpected API response format.");
      }
  
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed to process the resume. Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };      

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📂 Upload Your Resume</h2>
      <input type="file" onChange={handleFileChange} accept=".pdf" className="border p-2 mb-4 w-full" />
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        {uploading ? "Processing..." : "Submit"}
      </button>

      {questions && <InterviewQuestions questions={questions} />}
    </div>
  );
};

const InterviewQuestions = ({ questions }) => {
  const [expanded, setExpanded] = useState({
    Simple: true,
    Medium: false,
    Difficult: false,
  });

  const toggleSection = (section) => {
    setExpanded({ ...expanded, [section]: !expanded[section] });
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📌 Generated Interview Questions</h2>

      {["Simple", "Medium", "Difficult"].map((category) => (
        <div key={category} className="mb-4 bg-white shadow-md rounded-lg p-4">
          <button
            onClick={() => toggleSection(category)}
            className="w-full flex justify-between items-center p-3 font-semibold text-lg border-b border-gray-300"
          >
            <span>
              {category === "Simple" ? "🟢" : category === "Medium" ? "🟡" : "🔴"} {category} Questions
            </span>
            <span>{expanded[category] ? "▲" : "▼"}</span>
          </button>

          {expanded[category] && (
            <ul className="list-disc pl-6 mt-3">
              {questions[category]?.length > 0 ? (
                questions[category].map((question, index) => (
                  <li key={index} className="text-gray-700 p-2 border-b">
                    {question}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic p-2">No questions available.</li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResumeReader;
