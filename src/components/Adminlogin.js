import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminlogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;
  const ADMIN_TOKEN_KEY = process.env.REACT_APP_ADMIN_TOKEN_KEY || "adminToken";

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const isAuthorized =
      (ADMIN_EMAIL && ADMIN_PASSWORD)
        ? trimmedEmail === ADMIN_EMAIL && trimmedPassword === ADMIN_PASSWORD
        : trimmedEmail.length > 0 && trimmedPassword.length > 0;

    if (isAuthorized) {
      const tokenValue = btoa(`${trimmedEmail}:${trimmedPassword}`);
      localStorage.setItem(ADMIN_TOKEN_KEY, tokenValue);
      navigate("/admin");
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