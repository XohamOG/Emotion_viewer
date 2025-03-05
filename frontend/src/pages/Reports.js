import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Reports.css";

const HealthReports = ({ analysisId }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Log the URL we're trying to access
        const url = `/api/analysis/${analysisId}/visualization-data/`;
        console.log("Attempting to fetch data from:", url);
        
        const response = await axios.get(url, { 
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` 
          }
        });
        
        setAnalysisData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analysis data:', err);
        // Capture more detailed error information
        setDebugInfo({
          url: `/api/analysis/${analysisId}/visualization-data/`,
          analysisId,
          error: err.response ? {
            status: err.response.status,
            data: err.response.data,
            headers: err.response.headers
          } : err.message
        });
        setError(err.message || 'Failed to load analysis data');
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchData();
    } else {
      setError('No analysis ID provided');
      setLoading(false);
    }
  }, [analysisId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="reports-container">
      <h2>Reports</h2>
      {/* Render analysis data here */}
    </div>
  );
};

export default HealthReports;
