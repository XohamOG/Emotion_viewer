import React, { useState, useEffect, useRef } from "react";

const InterviewPage = () => {
  const [jobPositions, setJobPositions] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);
  let captureIntervalRef = useRef(null);

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

  const addJob = async () => {
    if (!newJobTitle.trim() || !newJobDescription.trim()) {
      alert("Please enter a job title and description.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/jobs/", {
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

  const startScreenShare = async () => {
    try {
      if (screenStream) {
        stopCapturing();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
        audio: { echoCancellation: true, noiseSuppression: true }, // Improved audio capture
      });

      stream.getVideoTracks()[0].onended = () => stopCapturing(); // Detect manual stop

      setScreenStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }

      // **Wait for stream to be set before starting capture**
      setTimeout(() => {
        startCapturing();
      }, 1000);
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const startCapturing = () => {
    if (!screenStream) {
      console.error("❌ Screen stream not set.");
      return;
    }

    if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);

    captureIntervalRef.current = setInterval(() => {
      captureScreenshot();
      captureAudioClip();
    }, 3000);
  };

  const stopCapturing = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }

    console.log("❌ Screen sharing stopped. Stopping captures.");
  };

  const captureScreenshot = () => {
    if (!screenStream) {
      console.error("❌ No screen stream available.");
      return;
    }

    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) {
      console.error("❌ No video track found.");
      return;
    }

    const imageCapture = new ImageCapture(videoTrack);
    imageCapture
      .grabFrame()
      .then((bitmap) => {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            uploadCapturedData(blob, "image");
          } else {
            console.error("❌ Screenshot capture failed.");
          }
        }, "image/png");
      })
      .catch((err) => console.error("❌ Error capturing screenshot:", err));
  };

  const captureAudioClip = async () => {
    if (!screenStream) {
      console.error("❌ No screen stream available.");
      return;
    }

    const audioTrack = screenStream.getAudioTracks().find((track) => track.kind === "audio");
    if (!audioTrack) {
      console.error("❌ No system audio track found. Ensure tab has active sound.");
      return;
    }

    const audioStream = new MediaStream([audioTrack]);
    let mimeType = "audio/webm";
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = "audio/mp4";
    }

    try {
      const mediaRecorder = new MediaRecorder(audioStream, { mimeType });
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunks.length === 0) {
          console.error("❌ No audio data captured.");
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: mimeType });
        uploadCapturedData(audioBlob, "audio");
      };

      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000);
    } catch (error) {
      console.error("❌ Error starting MediaRecorder:", error);
    }
  };

  const uploadCapturedData = async (blob, dataType) => {
    if (!blob) {
      console.error("❌ No file data to upload.");
      return;
    }

    const fileName = dataType === "image" ? `screenshot_${Date.now()}.png` : `audio_${Date.now()}.webm`;
    const file = new File([blob], fileName, { type: blob.type });

    const formData = new FormData();
    formData.append("interview_id", selectedJob);
    formData.append("file", file);
    formData.append("data_type", dataType);

    try {
      console.log(`Uploading ${dataType}: ${fileName}`);

      const response = await fetch("http://127.0.0.1:8000/api/interviews/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${dataType}`);
      }

      const result = await response.json();
      console.log(`✅ Uploaded ${dataType}:`, result);
    } catch (err) {
      console.error(`❌ Error uploading ${dataType}:`, err);
      setTimeout(() => uploadCapturedData(blob, dataType), 2000);
    }
  };

  return (
    <div>
      <h2>Start Interview</h2>

      <div>
        <input type="text" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} placeholder="Enter job title" />
        <textarea value={newJobDescription} onChange={(e) => setNewJobDescription(e.target.value)} placeholder="Enter job description" rows="4" />
        <button onClick={addJob}>Add Job</button>
      </div>

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
