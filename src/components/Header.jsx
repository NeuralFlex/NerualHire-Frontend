import { useNavigate } from "react-router-dom";
import { useSidebar } from "./SidebarContext";
import { Menu, X } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  const { 
    toggleMobileSidebar, 
    isMobileOpen,
    isExpanded 
  } = useSidebar(); 

  const desktopMargin = isExpanded ? "lg:ml-64" : "lg:ml-16";

  return (
    <header 
      className={`fixed top-0 right-0 h-16 bg-white border-b z-30 transition-all duration-300 w-full ${desktopMargin}`}
    >
      <div className="px-6 flex justify-between items-center h-full"> {/* Changed justify-end to justify-between */}
        
        <button
            onClick={toggleMobileSidebar}
            className="text-gray-800 focus:outline-none p-2 rounded-md hover:bg-gray-100 lg:hidden"
        >
            {/* Hamburger/Close Icon */}
            {isMobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            )}
        </button>
      </div>
    </header>
  );
};

export default Header;