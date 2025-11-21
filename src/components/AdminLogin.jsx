import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../api/api";
import logo from "../assets/icon.png";
import { User, Lock, LogIn } from 'lucide-react';

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-7 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Logo + Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="NeuralHire Logo" className="h-14 w-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage Job Postings
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            <p className="font-medium text-center">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 border border-gray-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C23D3D] focus:border-[#C23D3D] transition duration-150"
                required
                disabled={isLoading}
                placeholder="Enter your Username"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 border border-gray-300 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C23D3D] focus:border-[#C23D3D] transition duration-150"
                required
                disabled={isLoading}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-lg transition duration-200 flex items-center justify-center 
                            ${isLoading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#C23D3D] text-white hover:bg-[#a13131] shadow-md hover:shadow-lg"
              }`}
          >
            {isLoading ? (
              <>
                Logging In...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
