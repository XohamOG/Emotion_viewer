import React, { useState, useEffect, useRef } from "react";

const InterviewPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [capturedData, setCapturedData] = useState([]);
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/jobs/");
      if (!res.ok) throw new Error("Failed to fetch jobs.");
      const data = await res.json();
      setJobPositions(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 }, // Capture 1 frame per second
        audio: true, // Capture system audio
      });

      setScreenStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setInterval(captureScreenshot, 3000); // Take screenshot every 3 sec
      setInterval(captureAudioClip, 3000); // Capture audio every 3 sec
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const captureScreenshot = () => {
    if (!screenStream) return;
  
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) return;
  
    const imageCapture = new ImageCapture(videoTrack);
    imageCapture.grabFrame().then((bitmap) => {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
  
      canvas.toBlob((blob) => {
        uploadCapturedData(blob, "image");
      }, "image/png");
    }).catch((err) => console.error("Error capturing screenshot:", err));
  };

  const captureAudioClip = async () => {
    if (!screenStream) {
      console.error("No screen stream available.");
      return;
    }
  
    // Extract audio track
    const audioTrack = screenStream.getAudioTracks()[0];
    if (!audioTrack) {
      console.error("No audio track found in shared screen.");
      return;
    }
  
    const audioStream = new MediaStream([audioTrack]);
  
    // Check supported MIME type for recording
    let mimeType = "audio/webm";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/mp4"; // Fallback to MP4
    }
  
    try {
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      let audioChunks = [];
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
  
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        uploadCapturedData(audioBlob, "audio");
      };
  
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000); // Capture for 3 seconds
    } catch (error) {
      console.error("Error starting MediaRecorder:", error);
    }
  };
  

  const uploadCapturedData = async (blob, dataType) => {
    // Assign proper filename and type
    const fileName = dataType === "image" ? `screenshot_${Date.now()}.png` : `audio_${Date.now()}.webm`;
    const file = new File([blob], fileName, { type: blob.type });
  
    const formData = new FormData();
    formData.append("interview_id", selectedJob);
    formData.append("file", file);
    formData.append("data_type", dataType);
  
    try {
      await fetch("http://127.0.0.1:8000/api/interviews/upload/", {
        method: "POST",
        body: formData,
      });
      console.log(`Uploaded ${dataType}: ${fileName}`);
    } catch (err) {
      console.error("Error uploading data:", err);
    }
  };

  return (
    <div>
      <h2>Start Interview</h2>

      <select onChange={(e) => setSelectedJob(e.target.value)}>
        <option value="">Select a Job</option>
        {jobPositions.map((job) => (
          <option key={job.id} value={job.id}>{job.title}</option>
        ))}
      </select>

      <button onClick={startScreenShare} disabled={!selectedJob}>Start Interview & Screen Share</button>

      <video ref={videoRef} autoPlay style={{ display: "none" }}></video>
    </div>
  );
};

export default InterviewPage;