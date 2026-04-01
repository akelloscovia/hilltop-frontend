import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminlogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  console.log("AdminLogin component rendered");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // simple test login
    if (email === "admin@hilltop.com" && password === "admin123") {
      localStorage.setItem("adminToken", "dummy-token");

      // ✅ FIXED ROUTE
      navigate("/admin/dashboard/home");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Admin Login</h2>

        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required
        />

        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}