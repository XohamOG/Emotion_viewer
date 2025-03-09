import React, { useState, useEffect, useRef } from "react";
import "../styles/TrackerCandid.css";

const TrackerCandidates = () => {
  const [screenStream, setScreenStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const captureIntervalRef = useRef(null);

  const startInterview = async () => {
    alert("Starting interview and screen sharing...");
    await startScreenShare();
  };

  const startScreenShare = async () => {
    try {
      if (screenStream) {
        stopScreenShare();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      stream.getVideoTracks()[0].onended = () => stopScreenShare();
      setScreenStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }

      captureIntervalRef.current = setInterval(() => captureScreenshot(stream), 3000);
      startContinuousAudioRecording(stream);
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    clearInterval(captureIntervalRef.current);
    stopAudioRecording();
  };

  const captureScreenshot = (stream) => {
    const videoTrack = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);
    imageCapture.grabFrame()
      .then((bitmap) => {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(bitmap, 0, 0);
        canvas.toBlob((blob) => uploadFile(blob, "screenshot.png"), "image/png");
      })
      .catch((err) => console.error("Error capturing screenshot:", err));
  };

  const startContinuousAudioRecording = (stream) => {
    const audioStream = new MediaStream(stream.getAudioTracks());
    mediaRecorderRef.current = new MediaRecorder(audioStream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      uploadFile(audioBlob, "audio.wav");
      audioChunks.current = [];
      mediaRecorderRef.current.start();
      setTimeout(() => mediaRecorderRef.current.stop(), 3000);
    };

    mediaRecorderRef.current.start();
    setTimeout(() => mediaRecorderRef.current.stop(), 3000);
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const uploadFile = async (blob, filename) => {
    const formData = new FormData();
    formData.append("file", blob, filename);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/interview/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("File saved:", data.file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="tracker-container">
      <div className="start-interview-container">
        <button className="start-button" onClick={startInterview}>
          Start Interview & Screen Share
        </button>
      </div>

      <video ref={videoRef} autoPlay style={{ display: "none" }}></video>
    </div>
  );
};

export default TrackerCandidates;
