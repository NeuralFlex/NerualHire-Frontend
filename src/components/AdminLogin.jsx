import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/api";
import logo from "../assets/icon.png";

const AdminLogin = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await api.post("token/", { username, password });
    const { access, refresh } = response.data;

    // Store tokens
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    // Set Axios auth header
    setAuthToken(access);

    localStorage.setItem("role", "admin");
    navigate("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    setError("Invalid credentials. Please try again.");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-12 mb-3" />
          <h2 className="text-2xl font-bold mb-1">Login</h2>
          <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D64948]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#D64948]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D64948] text-white py-2.5 rounded-lg font-medium hover:bg-[#b73837]"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
