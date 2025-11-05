import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/api";
import logo from "../assets/icon.png";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await api.post("token/", { username, password });
      const { access, refresh, role } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("role", role);

      setAuthToken(access);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    }finally {
      // 3. Stop the loading state after the try/catch blocks complete
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-[#f9fafb] pt-20">
      <div className="bg-white p-7 rounded-2xl shadow-xl w-full max-w-md">
        {/* Logo + Header */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="h-12 mb-3" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-sm text-gray-500 text-center">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D64948]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D64948]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#D64948] text-white py-2.5 rounded-lg font-medium hover:bg-[#b73837] transition"
          >
            {/* 5. Change button text based on loading state */}
            {isLoading ? "Loging In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
