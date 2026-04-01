import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute - Wrapper for routes that require admin authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');

  // If no token exists, redirect to login
  if (!adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  // Token exists, render the protected component
  return children;
}
