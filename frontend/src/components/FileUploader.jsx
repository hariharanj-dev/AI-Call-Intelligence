import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import api from "../services/api";
import "./FileUploader.css";

const FileUploader = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "audio/*": [] },
    multiple: false,
    onDrop: async (files) => {
      const file = files[0];
      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("language", language);

        const resp = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
          },
        });

        setUploading(false);
        setProgress(100);
        onUploadSuccess(resp.data); // send transcript back to Dashboard
      } catch (err) {
        setUploading(false);
        setError(err?.response?.data?.error || err.message || "Upload failed");
      }
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="file-uploader-card"
    >
      <div className="file-uploader-select">
        <label>Select Language:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={uploading}>
          <option value="en">English</option>
          <option value="ta">Tamil</option>
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""} ${uploading ? "disabled" : ""}`}
      >
        <input {...getInputProps()} disabled={uploading} />
        {uploading ? (
          <div className="progress-container">
            <LinearProgress variant="determinate" value={progress} />
            <span className="progress-text">{progress}%</span>
          </div>
        ) : (
          <p>Drag & drop your audio here or click to select</p>
        )}
      </div>

      {error && <div className="file-uploader-error">{error}</div>}
    </motion.div>
  );
};

export default FileUploader;
