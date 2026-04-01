import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Admin Panel</h2>
      <nav>
        <ul>
          <li><NavLink to="/admin/dashboard/home">Home</NavLink></li>
          <li><NavLink to="/admin/dashboard/about">About</NavLink></li>
          <li><NavLink to="/admin/dashboard/academics">Academics</NavLink></li>
          <li><NavLink to="/admin/dashboard/admissions">Admissions</NavLink></li>
          <li><NavLink to="/admin/dashboard/gallery">Gallery</NavLink></li>
          <li><NavLink to="/admin/dashboard/contact">Contact</NavLink></li>
        </ul>
      </nav>
    </aside>
  );
}