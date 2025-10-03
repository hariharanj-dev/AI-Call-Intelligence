import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Live from "./pages/Live";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live" element={<Live />} />
        <Route path="/Analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;
