import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../components/SidebarContext";
import logo from "../assets/icon.png";

export default function Sidebar() {
  const {
    isExpanded,
    isMobileOpen,
    isMobile, 
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

  //  New function to handle navigation clicks
  const handleNavClick = (item) => {
    setActiveItem(item.name);
    // Automatically close the sidebar on mobile when navigating
    if (isMobile) {
      toggleMobileSidebar();
    }
  };

  const menuItems = isAdmin
    ? [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Create Job", path: "/create-job" },
        { name: "Log out", action: handleLogout }, 
      ]
    : [
        { name: "Job List", path: "/" },
      ];

  return (
    <>
      {/* Overlay for mobile (Correctly closes sidebar) */}
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

          {/* 👇 NEW: Mobile Close Button (Visible when sidebar is open on mobile) */}
          {isMobile && isMobileOpen && (
              <button 
                  onClick={toggleMobileSidebar}
                  className="p-2 ml-auto text-gray-600 hover:text-gray-900 lg:hidden"
                  aria-label="Close menu"
              >
                  {/* 'X' Close Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
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
                {isExpanded ? item.name : item.name.slice(0, 1)}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.path}
                // 👇 Use the new handler here
                onClick={() => handleNavClick(item)} 
                className={`flex items-center px-4 py-3 mx-2 my-1 rounded-lg transition-colors
                  ${
                    activeItem === item.name || location.pathname === item.path
                      ? "bg-[#D64948] text-white font-semibold"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {isExpanded ? item.name : item.name.slice(0, 1)}
              </Link>
            )
          )}
        </nav>

        {/* Collapse Button - Hides on mobile/small screens for a cleaner look */}
        <button
          onClick={toggleSidebar}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 lg:block hidden"
        >
          {isExpanded ? "<" : ">"}
        </button>
      </aside>
    </>
  );
}