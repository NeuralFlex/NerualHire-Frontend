import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/icon.png";

const Header = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <header className="bg-[#D64948] shadow-md h-14 flex items-center">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center w-full">
        {/* Logo inside white background */}
        <div
          className="bg-white p-1 rounded cursor-pointer"
          onClick={() => navigate(isAdmin ? "/dashboard" : "/")}
        >
          <img src={logo} alt="Company Logo" className="h-8" />
        </div>

        {/* Admin Logout */}
        {isAdmin && (
          <button
            onClick={handleLogout}
            className="bg-white text-[#D64948] px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
