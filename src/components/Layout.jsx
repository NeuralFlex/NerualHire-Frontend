import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SidebarWidget";
import Header from "./Header";
import { useSidebar } from "../components/SidebarContext";

const Layout = () => {
  const { 
    isExpanded, 
    isMobile, 
    isMobileOpen 
  } = useSidebar();

  const sidebarMarginClass = isExpanded ? "lg:ml-64" : "lg:ml-16";

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Sidebar (Fixed) */}
      <Sidebar />

      <Header />

      {/* 3. Main Content Wrapper: This is the area for the Header + Main Content */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarMarginClass}`}
      >
        <main className="flex-grow pt-16 p-6"> 
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;