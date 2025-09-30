import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/icon.png";

const Header = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-14">
        {/* Logo */}
        <div
          className="bg-white p-1 rounded cursor-pointer"
          onClick={() => navigate(isAdmin ? "/dashboard" : "/")}
        >
          <img src={logo} alt="Logo" className="h-8" />
        </div>

        {/* Right side: dark mode + menu */}
        <div className="flex items-center gap-3">
          <ThemeToggleButton />

          {/* Menu toggle for mobile */}
          <button
            className="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Buttons */}
          <div className={`flex gap-2 ${isMenuOpen ? "flex" : "hidden"} lg:flex`}>
            {!isAdmin && (
              <button
                onClick={handleLogout}
                className="bg-[#D64948] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-red-600 transition"
              >
                Login
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="bg-[#D64948] text-white px-4 py-1.5 rounded-lg font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
