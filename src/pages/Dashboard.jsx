import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../contexts/SidebarContext";

export default function Dashboard() {
  const { isMobile } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-institutional-gradient">
      <Sidebar />
      <div className={`flex-1 overflow-auto ${
        isMobile ? 'p-4 pt-20' : 'p-8'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className={isMobile ? 'mb-6' : 'mb-8'}>
            <div className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 ${
              isMobile ? 'p-4' : 'p-6'
            }`}>
              <h1 className={`font-bold bg-institutional-gold-gradient bg-clip-text text-white ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>
                Panel de Control
              </h1>
              <p className={`text-gray-600 mt-2 ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                Sistema de gestión inteligente de casilleros
              </p>
            </div>
          </div>
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
