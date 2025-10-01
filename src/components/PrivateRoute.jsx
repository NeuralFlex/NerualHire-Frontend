// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access");

  if (!token || role !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PrivateRoute;
