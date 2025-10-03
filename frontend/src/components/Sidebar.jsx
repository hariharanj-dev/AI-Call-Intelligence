import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHome, FaHeadset, FaChartLine, FaCog, FaBars } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: <FaHome />, label: "Home", path: "/" },
    { icon: <FaHeadset />, label: "Live", path: "/live" },
    { icon: <FaChartLine />, label: "Analytics", path: "/calls" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 240 }}
      className="sidebar"
    >
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-brand">AI Call Intelligence</h2>}
        <FaBars
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link to={item.path} key={index} className="sidebar-link">
              <motion.div
                whileHover={{ scale: 1.05, backgroundColor: "#1976d2" }}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <span className="icon">{item.icon}</span>
                {!collapsed && <span className="label">{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Sidebar;
