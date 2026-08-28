import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { CommandPalette } from '../components/CommandPalette';
import { ToastContainer } from '../components/ToastContainer';
import { useAdmin } from '../context/AdminContext';
export const AdminLayout = () => {
    const { isSidebarCollapsed } = useAdmin();
    return (<div className="min-h-screen bg-[#F8F6F3] text-[#1A1A1A] flex font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Sticky Topbar */}
        <Topbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>

      {/* Global Utilities */}
      <CommandPalette />
      <ToastContainer />
    </div>);
};
export default AdminLayout;
