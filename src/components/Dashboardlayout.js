import React, { useState } from "react";
import Sidebar from "./Sidebar";
// import DashboardCards from "./Dashboardlayout";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN WRAPPER */}
      <div className="dashboard-wrapper">

        {/* HEADER */}
        <header className="dashboard-header">

          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <h2>Admin Dashboard</h2>

          <div className="dashboard-actions">

            <Link to="/" className="view-btn">
              View Website
            </Link>

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>

          </div>
        </header>

        {/* CONTENT */}
        <main className="dashboard-main">
          <div className="dashboard-content-shell">
            {/* NESTED ROUTES */}
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
