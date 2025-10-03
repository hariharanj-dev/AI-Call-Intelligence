import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Live.css";

const Live = () => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const startRecording = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "live_recording.webm", { type: "audio/webm" });

        // Send to backend
        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", "en"); // or dynamic selection

        try {
          const resp = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          // Redirect to Dashboard/Home with transcript
          navigate("/", { state: { transcriptData: resp.data } });
        } catch (err) {
          setError(err?.response?.data?.error || err.message || "Upload failed");
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      setError("Could not access microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div className="live-app">
      <Sidebar />
      <motion.div
        className="live-main"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="live-title">Live Recording</h1>

        <div className="live-controls">
          {!recording ? (
            <button className="btn start-btn" onClick={startRecording}>
              Start Recording
            </button>
          ) : (
            <button className="btn stop-btn" onClick={stopRecording}>
              Stop Recording
            </button>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}
      </motion.div>
    </div>
  );
};

export default Live;
