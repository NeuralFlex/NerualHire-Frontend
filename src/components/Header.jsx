import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin");
  };

  return (
    <header className="sticky top-0 w-full bg-white z-40">
      <div className="px-6 flex justify-end items-center h-14">
        {/* Action Buttons */}
        <div>
          {!isAdmin && (
            <button
              onClick={handleLogout}
              className="bg-white text-[#D64948] px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Login
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="bg-white text-[#D64948] px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
