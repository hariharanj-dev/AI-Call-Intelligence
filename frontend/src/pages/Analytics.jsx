import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Analytics.css";

const Analytics = () => {
  const [emotionData, setEmotionData] = useState([]);

  // Mock — Replace with backend data in real use
  useEffect(() => {
    const sampleData = [
      { time: "0s", Happy: 0.2, Sad: 0.1, Angry: 0.0, Neutral: 0.7 },
      { time: "5s", Happy: 0.6, Sad: 0.0, Angry: 0.1, Neutral: 0.3 },
      { time: "10s", Happy: 0.4, Sad: 0.2, Angry: 0.0, Neutral: 0.4 },
      { time: "15s", Happy: 0.1, Sad: 0.0, Angry: 0.6, Neutral: 0.3 },
      { time: "20s", Happy: 0.5, Sad: 0.0, Angry: 0.1, Neutral: 0.4 },
      { time: "25s", Happy: 0.7, Sad: 0.0, Angry: 0.0, Neutral: 0.3 },
    ];
    setEmotionData(sampleData);
  }, []);

  return (
    <div className="analytics-page">
      <Sidebar />

      <motion.div
        className="analytics-main"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="analytics-title">Emotion Timeline Analysis</h1>
        <p className="analytics-subtitle">
          Visual representation of detected emotions throughout the audio.
        </p>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={emotionData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 1]} tickFormatter={(v) => `${v * 100}%`} />
              <Tooltip
                formatter={(value) => `${(value * 100).toFixed(0)}%`}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend verticalAlign="bottom" height={36} />

              <Line type="monotone" dataKey="Happy" stroke="#4ade80" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Sad" stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Angry" stroke="#f87171" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Neutral" stroke="#a3a3a3" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
