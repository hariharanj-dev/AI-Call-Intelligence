// src/components/EmotionalTimeline.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const EmotionalTimeline = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" />
        <YAxis domain={[0, 1]} />
        <Tooltip />
        <Line type="monotone" dataKey="emotion" stroke="#ff5722" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmotionalTimeline;
