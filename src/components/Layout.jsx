import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SidebarWidget";
import Header from "./Header";
import { useSidebar } from "../components/SidebarContext";

const Layout = () => {
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={`flex flex-col transition-all duration-300
          ${isExpanded ? "ml-64" : "ml-16"}`}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
