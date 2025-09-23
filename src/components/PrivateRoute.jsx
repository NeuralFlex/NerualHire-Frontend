import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  // Only allow admin
  if (role !== "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PrivateRoute;
