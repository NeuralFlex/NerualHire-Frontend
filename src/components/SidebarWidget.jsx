import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import logo from "../assets/icon.png";

export default function Sidebar() {
  const {
    isExpanded,
    isMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    activeItem,
    setActiveItem,
  } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/admin");
  };

  const menuItems = isAdmin
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Create Job", path: "/create-job" },
        { name: "Job List", path: "/" },
        { name: "Log out", action: handleLogout }, 
      ]
    : [
        { name: "Job List", path: "/" },
        { name: "Login", path: "/admin" },
      ];

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-md z-50 transition-all duration-300
          ${isExpanded ? "w-64" : "w-16"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo + Company Name */}
        <div
          className="flex items-center h-16 border-b border-gray-300 px-4 cursor-pointer"
          onClick={() => {
            if (isAdmin) {
              navigate("/dashboard");
            } else {
              window.location.reload();
            }
          }}
        >
          <img src={logo} alt="Logo" className="h-9 w-22" />
          {isExpanded && (
            <span className="ml-3 text-xl font-bold text-gray-800 whitespace-nowrap">
              NeuralHire
            </span>
          )}
        </div>


        {/* Menu */}
        <nav className="flex flex-col mt-4">
          {menuItems.map((item) =>
            item.action ? ( 
              <button
                key={item.name}
                onClick={item.action}
                className={`flex items-center w-full text-left px-4 py-3 mx-2 my-1 rounded-lg transition-colors
                  ${
                    activeItem === item.name
                      ? "bg-[#D64948] text-white font-semibold"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {isExpanded ? item.name : item.name[0]}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setActiveItem(item.name)}
                className={`flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-colors
                  ${
                    activeItem === item.name || location.pathname === item.path
                      ? "bg-[#D64948] text-white font-semibold"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {isExpanded ? item.name : item.name[0]}
              </Link>
            )
          )}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          {isExpanded ? "<" : ">"}
        </button>
      </aside>
    </>
  );
}
