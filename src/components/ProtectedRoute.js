import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const ADMIN_TOKEN_KEY = process.env.REACT_APP_ADMIN_TOKEN_KEY || "adminToken";
  const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
