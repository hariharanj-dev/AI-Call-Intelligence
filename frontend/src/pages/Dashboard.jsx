import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FileUploader from "../components/FileUploader";
import { motion } from "framer-motion";
import "./Dashboard.css";

const Dashboard = () => {
  const [transcriptData, setTranscriptData] = useState(null); // full response
  const transcriptRef = useRef(null);

  const handleUploadSuccess = (data) => {
    setTranscriptData(data);
  };

  // Auto scroll to transcript when new data arrives
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptData]);

  return (
    <div className="dashboard-app">
      <Sidebar />

      <motion.div
        className="dashboard-main"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="dashboard-title">AI Call Intelligence</h1>

        {/* Upload Card */}
        <motion.div
          className="card upload-card"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h2>Upload Audio File</h2>
          <FileUploader onUploadSuccess={handleUploadSuccess} />
        </motion.div>

        {/* Transcript Card */}
        {transcriptData && (
          <motion.div
            className="card transcript-card"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            ref={transcriptRef}
          >
            <h2>Transcribed Text</h2>
            <div className="transcript-box">
              {transcriptData.words && transcriptData.words.length > 0 ? (
                transcriptData.words.map((word, idx) => (
                  <span
                    key={idx}
                    className={`speaker-${word.speaker.replace(" ", "")}`}
                  >
                    {word.text + " "}
                  </span>
                ))
              ) : (
                <p>{transcriptData.transcript}</p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
