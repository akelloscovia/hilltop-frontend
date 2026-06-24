import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/admin/home" },
  { label: "About", path: "/admin/about" },
  { label: "Academics", path: "/admin/academics" },
  { label: "Admissions", path: "/admin/admissions" },
  { label: "Gallery", path: "/admin/gallery" },
  { label: "Contact", path: "/admin/contact" },
  { label: "Users", path: "/admin/users" },
  { label: "Footer", path: "/admin/footer" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">ADM</div>
        <div>
          <span className="brand-title">Admin Panel</span>
          <span className="brand-subtitle">Control center</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setSidebarOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <span>Classic layout · modern feel</span>
      </div>
    </aside>
  );
}
