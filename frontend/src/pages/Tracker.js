import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";
import "../styles/Tracker.css";

const InterviewPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [questions, setQuestions] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/jobs/");
      if (!res.ok) throw new Error("Failed to fetch jobs.");
      const data = await res.json();
      setJobPositions(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const addJob = async () => {
    if (!newJobTitle.trim() || !newJobDescription.trim()) {
      alert("Please enter a job title and description.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/jobs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newJobTitle, description: newJobDescription }),
      });

      if (!res.ok) throw new Error("Failed to add job.");
      setNewJobTitle("");
      setNewJobDescription("");
      fetchJobs();
    } catch (err) {
      alert("Error adding job: " + err.message);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (jobId) => {
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }

    setUploading(true);
    setQuestions(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_id", jobId);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const text = await response.text();
      const cleanedText = text.replace(/json|/g, "").trim();

      let data;
      try {
        data = JSON.parse(cleanedText);
      } catch (jsonError) {
        console.error("Invalid JSON response:", cleanedText);
        throw new Error("Invalid JSON response from API");
      }

      if (Array.isArray(data.questions)) {
        const parsedQuestions = JSON.parse(data.questions.join(""));
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

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/interview/jobs/${jobId}/`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete job');
        fetchJobs(); // Refresh the job list
      } catch (error) {
        alert(`Failed to delete job: ${error.message}`);
      }
    }
  };

  return (
    <Container style={{ marginTop: '32px' }}>
      <Paper elevation={3} style={{ padding: '16px', borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom>
          Add jobs
        </Typography>

        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Enter job title"
            variant="outlined"
            fullWidth
            style={{ marginBottom: '16px', borderRadius: '8px' }}
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
          />
          <TextField
            label="Enter job description"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            style={{ 
              marginBottom: '16px', 
              borderRadius: '8px',
              width: '100%', // Added this line
              maxWidth: '100%' // Added this line
            }}
            value={newJobDescription}
            onChange={(e) => setNewJobDescription(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            style={{
              marginTop: '16px',
              borderRadius: '8px',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0px 3px 5px 2px rgba(255, 105, 135, .3)',
            }}
            onClick={addJob}
          >
            Add Job
          </Button>
        </Box>
      </Paper>

      <Typography variant="h5" gutterBottom style={{ marginTop: '32px' }}>
        Available Jobs
      </Typography>
      <Divider style={{ marginBottom: '16px' }} />
      <Grid container spacing={2}>
        {jobPositions.map((job) => (
          <Grid item xs={12} sm={6} md={4} key={job.id}>
            <Card
              style={{
                marginBottom: '16px',
                boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                borderRadius: '12px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0px 6px 12px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0px 3px 6px rgba(0,0,0,0.1)';
              }}
            >
              <CardContent>
                <Typography variant="h6">{job.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {job.description}
                </Typography>
              </CardContent>
              <CardActions style={{ padding: '16px', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  style={{ marginBottom: '8px', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="contained"
                    color="error"
                    style={{
                      flex: '1',
                      borderRadius: '8px',
                      background: 'linear-gradient(45deg, #FF1744 30%, #FF4081 90%)',
                      boxShadow: '0px 3px 5px 2px rgba(255, 23, 68, .3)',
                    }}
                    onClick={() => handleDelete(job.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      flex: '1',
                      borderRadius: '8px',
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0px 3px 5px 2px rgba(33, 203, 243, .3)',
                    }}
                    onClick={() => handleSubmit(job.id)}
                    disabled={uploading}
                  >
                    {uploading ? <CircularProgress size={24} /> : "Submit"}
                  </Button>
                </div>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      
    </Container>
  );
};

export default InterviewPage;
