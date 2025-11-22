import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaDoorOpen, FaKey, FaClipboardList, FaArchive, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { HiSparkles, HiLogout } from "react-icons/hi";
import { MdDashboard } from "react-icons/md";
import { useSidebar } from "../contexts/SidebarContext";
import logo from "../assets/logo-duoc.svg";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const menuItems = [
    {
      path: "/dashboard/logs",
      icon: FaClipboardList,
      label: "Logs de Acceso",
      description: "Historial de actividad"
    },
    {
      path: "/dashboard/profesores",
      icon: FaUser,
      label: "Profesores",
      description: "Gestión de usuarios"
    },
    {
      path: "/dashboard/casilleros",
      icon: FaArchive,
      label: "Casilleros",
      description: "Control de casilleros"
    },
    {
      path: "/dashboard/change-password",
      icon: FaKey,
      label: "Seguridad",
      description: "Cambiar contraseña"
    }
  ];

  // Añadir items administrativos según rol (obtenido desde token)
  const token = localStorage.getItem('token');
  const parseJwt = (t) => {
    try {
      const payload = t.split('.')[1];
      return JSON.parse(decodeURIComponent(atob(payload).split('').map(function(c){
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')));
    } catch (e) { return null; }
  };
  const user = token ? parseJwt(token.split(' ')[1] || token) : null;
  const role = user?.role || null;

  if (role === 'superadmin') {
    menuItems.push({ path: '/dashboard/sedes', icon: FaBars, label: 'Sedes', description: 'Gestionar sedes' });
    menuItems.push({ path: '/dashboard/admins', icon: FaUser, label: 'Administradores', description: 'Crear / administrar CETCOM' });
  }
  if (role === 'superadmin' || role === 'cetcom') {
    menuItems.push({ path: '/dashboard/escuelas', icon: FaClipboardList, label: 'Escuelas', description: 'Gestionar escuelas' });
    menuItems.push({ path: '/dashboard/jefes', icon: FaUser, label: 'Jefes', description: 'Gestionar jefes de carrera' });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Hamburger Button Clicked:', {
              isMobile,
              isOpen,
              event: e.type,
              target: e.target
            });
            toggleSidebar();
          }}
          className="fixed top-4 left-4 z-[9999] lg:hidden bg-institutional-gold-gradient p-3 rounded-xl shadow-institutional text-white hover:scale-105 transition-all duration-300 cursor-pointer touch-manipulation"
          style={{
            minWidth: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'}
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        w-72 bg-institutional-dark-gradient text-white min-h-screen flex flex-col shadow-institutional-lg border-r z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
      `} style={{borderColor: 'var(--institutional-gold-dark)'}}>
      {/* Header */}
      <div className="p-6 border-b" style={{borderColor: 'var(--institutional-gold-dark)'}}>
        <div className="flex items-center justify-center mb-4">
          <img src={logo} alt="Logo institucional" className="w-20 h-auto object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-center">
          <span style={{color: 'var(--institutional-gold)'}}>Lock</span><span className="text-white">IoT</span>
        </h1>
      {/*
        <p className="text-center text-xs mt-1 flex items-center justify-center gap-1" style={{color: 'var(--institutional-gray-light)'}}>
          <HiSparkles style={{color: 'var(--institutional-gold)'}} />
          Control Inteligente
        </p>
        */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={isMobile ? closeSidebar : undefined}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 hover-lift ${
                  active
                    ? 'glass-gold shadow-institutional border-institutional-gold'
                    : 'hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  active
                    ? 'bg-institutional-gold-gradient shadow-institutional'
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon className={`text-lg ${
                    active ? 'text-white' : 'group-hover:text-white'
                  }`} style={active ? {} : {color: 'var(--institutional-gray-light)'}} />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold transition-colors duration-300 ${
                    active ? 'text-white' : 'group-hover:text-white'
                  }`} style={active ? {} : {color: 'var(--institutional-gray-light)'}}>
                    {item.label}
                  </div>
                  <div className={`text-xs transition-colors duration-300`} style={{
                    color: active ? 'var(--institutional-gold-light)' : 'var(--institutional-gray-medium)'
                  }}>
                    {item.description}
                  </div>
                </div>
                {active && (
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--institutional-gold)'}}></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t" style={{borderColor: 'var(--institutional-gold-dark)'}}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group"
        >
          <HiLogout className="text-lg group-hover:animate-pulse" />
          Cerrar Sesión
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-xs" style={{color: 'var(--institutional-gray-medium)'}}>
            © 2025 LockIoT System
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
