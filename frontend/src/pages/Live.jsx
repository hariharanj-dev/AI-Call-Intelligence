import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import "./Live.css";

const Live = () => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  // Draw waveform dynamically
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    if (!canvas || !analyser || !dataArray) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    analyser.getByteTimeDomainData(dataArray);

    // Background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    // Gradient waveform
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#4ade80");
    gradient.addColorStop(0.5, "#facc15");
    gradient.addColorStop(1, "#3b82f6");

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradient;
    ctx.beginPath();

    const sliceWidth = width / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      const y = height / 2 + v * (height / 2 - 10);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.stroke();
    animationRef.current = requestAnimationFrame(drawWaveform);
  };

  // Start recording
  const startRecording = async () => {
    setError("");
    setAudioURL(null);
    setUploadSuccess(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      drawWaveform();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        cancelAnimationFrame(animationRef.current);
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL({ blob, url });
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setError("Could not access microphone: " + err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      audioContextRef.current?.close();
    }
  };

  // Upload audio
  const uploadRecording = async () => {
    if (!audioURL) return;
    const file = new File([audioURL.blob], "live_recording.webm", { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "en");

    try {
      setUploadProgress(0);
      const resp = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setUploadSuccess(resp.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Upload failed");
    }
  };

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth;
      canvas.height = 150;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="live-app">
      <Sidebar />
      <motion.div
        className="live-main"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="live-title">Live Audio Recording</h1>

        {/* Instruction Section */}
        <div className="instructions-box">
          <h2>How It Works</h2>
          <ol>
            <li>Ensure your microphone is connected and working.</li>
            <li>Click <strong>"Start Recording"</strong> to begin your session.</li>
            <li>Speak clearly; you will see a live waveform of your voice.</li>
            <li>Click <strong>"Stop Recording"</strong> when finished.</li>
            <li>Review your recording and click <strong>"Upload Recording"</strong> to get the transcript.</li>
          </ol>
          <p className="tips">
             Tip: Record in a quiet environment for the most accurate transcription. Keep your device close to your mouth.
          </p>
        </div>

        {/* Controls */}
        <div className="live-controls">
          {!recording ? (
            <button className="btn start-btn" onClick={startRecording}>Start Recording</button>
          ) : (
            <button className="btn stop-btn" onClick={stopRecording}>Stop Recording</button>
          )}
        </div>

        {/* Waveform */}
        {recording && (
          <div className="waveform-container">
            <p className="upload-info">Recording in progress...</p>
            <canvas ref={canvasRef} className="waveform-canvas"></canvas>
          </div>
        )}

        {/* Audio Preview & Upload */}
        {audioURL && (
          <div className="audio-preview">
            <h3>Recorded Audio</h3>
            <audio controls src={audioURL.url} />
            <button className="btn upload-btn" onClick={uploadRecording}>Upload Recording</button>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">Uploading: {uploadProgress}%</div>
        )}

        {/* Transcript */}
        {uploadSuccess && (
          <div className="transcript-preview">
            <h3>Transcript</h3>
            <p>{uploadSuccess.transcript}</p>
          </div>
        )}

        {/* Error */}
        {error && <p className="error-text">{error}</p>}
      </motion.div>
    </div>
  );
};

export default Live;
