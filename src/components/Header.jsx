import { useSidebar } from "./SidebarContext";
import { Menu, X } from "lucide-react";

const Header = () => {

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

        {/* Sidebar Toggle button */}
        <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
            {isMobileOpen ? (
                <X className="w-6 h-6"/>
            ) : (
                
                <Menu className="w-6 h-6"/>
            )}
        </button>
      </div>
    </header>
  );
};

export default Header;