// src/components/DecisionGraph.jsx
import React, { Suspense } from "react";

// Lazy-load the ForceGraph2D export from the react-force-graph package
const LazyForceGraph = React.lazy(() => import("react-force-graph").then(mod => ({ default: mod.ForceGraph2D })));

const DecisionGraph = ({ data }) => {
  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Suspense fallback={<div>Loading graph...</div>}>
        <LazyForceGraph graphData={data} />
      </Suspense>
    </div>
  );
};

export default DecisionGraph;
