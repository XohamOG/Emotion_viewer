import { useState, useEffect } from "react";
import './ResumeReader.css'; // Import the custom CSS file

const ResumeReader = () => {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the JSON data sent by views.py (assuming it's available at a certain endpoint)
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/upload-resume/"); // Adjust the endpoint as needed
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json();
        console.log("Received JSON data:", data); // Log the received JSON data

        // Parse the 'questions' string into a valid JSON object
        const parsedQuestions = JSON.parse(data.questions);
        setQuestions(parsedQuestions); // Set parsed questions into state
      } catch (error) {
        console.error("Error fetching questions:", error);
        alert(`Failed to load questions: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []); // Fetch data once on mount

  return (
    <div className="container">
      <h2 className="title">📂 Resume Information</h2>

      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div className="questions-container">
          <h2 className="generated-questions">📌 Generated Interview Questions</h2>
          
          {questions ? (
            ["Simple", "Medium", "Difficult"].map((category) => (
              <div key={category} className="category">
                <h3 className="category-title">{category} Questions</h3>
                
                <div className="card-grid">
                  {Array.isArray(questions[category]) && questions[category].length > 0 ? (
                    questions[category].map((question, index) => (
                      <div key={index} className="card">
                        <div className="card-content">
                          <input type="checkbox" id={`question-${category}-${index}`} className="checkbox" />
                          <label htmlFor={`question-${category}-${index}`} className="question-text">
                            {question}
                          </label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No questions available for this category.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No questions generated yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeReader;
