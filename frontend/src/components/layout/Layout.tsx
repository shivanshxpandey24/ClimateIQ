import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useStore } from '../../store/useStore';
import { useAirQuality } from '../../hooks/useAirQuality';
import clsx from 'clsx';

const Layout: React.FC = () => {
  const { sidebarOpen } = useStore();
  
  // Initialize data fetching
  useAirQuality();

  return (
    <div className="min-h-screen bg-aero-dark text-white flex">
      <Sidebar />
      <div className={clsx("flex-1 flex flex-col transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
