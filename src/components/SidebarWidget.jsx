import { Link, useLocation } from "react-router-dom";
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

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Create Job", path: "/create-job" },
    { name: "Job List", path: "/" },
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
        className={`fixed top-0 left-0 h-full bg-gray-50 dark:bg-gray-900 shadow-md z-50 transition-all duration-300
          ${isExpanded ? "w-64" : "w-16"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
          <img src={logo} alt="Logo" className="h-8" />
        </div>

        {/* Menu */}
        <nav className="flex flex-col mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setActiveItem(item.name)}
              className={`flex items-center px-4 py-3 mx-2 my-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800
                ${activeItem === item.name || location.pathname === item.path
                  ? "bg-gray-200 dark:bg-gray-800 font-semibold"
                  : "text-gray-700 dark:text-gray-300"
                }`}
            >
              {isExpanded ? item.name : item.name[0]}
            </Link>
          ))}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          {isExpanded ? "<" : ">"}
        </button>
      </aside>
    </>
  );
}
