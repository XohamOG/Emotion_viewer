import React, { useState, useEffect } from "react";
import { Container, Typography, TextField, Button, Card, CardContent, CardActions, Grid, Box, Paper, Divider, CircularProgress } from "@mui/material";
import "../styles/Tracker.css";

const ResumeUploadPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

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

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleJobChange = (event) => {
    setSelectedJobId(event.target.value);
  };

  const handleUpload = async () => {
    if (!file || !selectedJobId) {
      alert("Please select a job and upload a file.");
      return;
    }

    setUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_id", selectedJobId);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upload-resume/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload resume.");

      const result = await response.json();
      setUploadStatus(result.message || "Resume uploaded successfully.");
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container style={{ marginTop: '32px' }}>
      <Paper elevation={3} style={{ padding: '16px', borderRadius: '12px' }}>
        <Typography variant="h4" gutterBottom>
          Upload Resume
        </Typography>

        <Box component="form" noValidate autoComplete="off">
          <TextField
            select
            label="Select Job"
            fullWidth
            variant="outlined"
            value={selectedJobId}
            onChange={handleJobChange}
            style={{ marginBottom: '16px', borderRadius: '8px' }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a Job</option>
            {jobPositions.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </TextField>

          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            style={{ marginBottom: '16px', width: '100%' }}
          />

          <Button
            variant="contained"
            color="primary"
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              boxShadow: '0px 3px 5px 2px rgba(255, 105, 135, .3)',
            }}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : "Upload Resume"}
          </Button>

          {uploadStatus && (
            <Typography variant="body2" color="textSecondary" style={{ marginTop: '16px' }}>
              {uploadStatus}
            </Typography>
          )}
        </Box>
      </Paper>

    </Container>
  );
};

export default ResumeUploadPage;
