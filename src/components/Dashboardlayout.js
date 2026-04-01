import React from "react";
import Sidebar from "./Sidebar"; // ✅ fixed folder name
import { Outlet } from "react-router-dom";
import "./dashboard.css"; // layout CSS

export default function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <Outlet /> {/* nested page content */}
      </main>
    </div>
  );
}