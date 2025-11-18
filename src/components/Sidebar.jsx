import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES_NAMES, ROLES } from '../constants/roles';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  UsersIcon,
  BellAlertIcon,
  BriefcaseIcon,
  DocumentCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { text: 'Agenda', path: '/intranet/agenda', icon: CalendarDaysIcon },
  { text: 'Pacientes', path: '/intranet/lista-pacientes', icon: UserGroupIcon },
  { text: 'Reportes', path: '/intranet/reportes-evaluaciones', icon: DocumentChartBarIcon },
  { text: 'Usuarios', path: '/intranet/usuarios', icon: UsersIcon },
  { text: 'Popup Inicio', path: '/intranet/popup-promocional', icon: BellAlertIcon },
  { text: 'Postulaciones', path: '/intranet/postulaciones', icon: BriefcaseIcon },
  { text: 'Certificaciones', path: '/intranet/archivos-oficiales', icon: DocumentCheckIcon }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getFilteredMenuItems = () => {
    if (!user || !user.rol?.id) return menuItems;
    const userRole = user.rol.id;

    if (userRole === ROLES.TERAPEUTA) {
      return menuItems.filter(item =>
        item.text === 'Agenda' || item.text === 'Pacientes'
      );
    }

    if (userRole === ROLES.ADMISION) {
      return menuItems.filter(item =>
        item.text === 'Agenda' || item.text === 'Pacientes' || item.text === 'Certificaciones'
      );
    }

    return menuItems;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/intranet');
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-screen transition-all duration-300 z-50 flex flex-col shadow-sm ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{ backgroundColor: '#f8f9fa', borderRight: '1px solid #e9ecef' }}
      >
        {/* Logo */}
        <div className="p-3 flex items-center justify-center">
          {isCollapsed ? (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
              <img
                src="/videologo.png"
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
          ) : (
            <img
              src="/logo-text-short.png"
              alt="Logo Crecemos"
              className="h-10 w-auto object-contain"
            />
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-7 -right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all shadow-sm outline-none"
          style={{ border: '1px solid #e5e7eb' }}
        >
          <svg
            className={`w-3 h-3 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <style>{`
            nav::-webkit-scrollbar {
              width: 6px;
            }
            nav::-webkit-scrollbar-track {
              background: transparent;
            }
            nav::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 10px;
            }
            nav::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
            .menu-item {
              background: transparent;
              border: none;
            }
            .menu-item:hover {
              background-color: #e9ecef;
            }
            .menu-item.active {
              background-color: #e9ecef;
            }
          `}</style>
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  className={`menu-item ${isActive ? 'active' : ''} w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-200 group relative outline-none ${
                    isActive
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.text : ''}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    isActive 
                      ? 'bg-[#7B1FA2] text-white shadow-sm' 
                      : 'bg-transparent text-gray-500 group-hover:text-[#7B1FA2]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {!isCollapsed && (
                    <span className="font-semibold text-sm flex-1 text-left">
                      {item.text}
                    </span>
                  )}
                  {!isCollapsed && isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A3C644] flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-3" style={{ borderTop: '1px solid #e9ecef' }}>
          {isCollapsed ? (
            // Vista colapsada - Solo iconos verticales
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/intranet/mi-perfil')}
                className="w-full flex items-center justify-center p-2.5 text-gray-500 rounded-xl transition-all outline-none"
                style={{ border: 'none', background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title={user.nombres ? `${user.nombres} ${user.apellidos}` : 'Mi Perfil'}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                    {user.nombres?.[0] || ''}{user.apellidos?.[0] || ''}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#A3C644] rounded-full" style={{ border: '2px solid white' }}></div>
                </div>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2.5 text-gray-500 rounded-xl transition-all outline-none"
                style={{ border: 'none', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            // Vista expandida - Perfil completo
            <div className="space-y-2">
              <button
                onClick={() => navigate('/intranet/mi-perfil')}
                className="w-full flex items-center gap-3 p-2.5 text-gray-600 rounded-xl transition-all group outline-none"
                style={{ border: 'none', background: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center font-bold text-white text-sm shadow-sm">
                    {user.nombres?.[0] || ''}{user.apellidos?.[0] || ''}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#A3C644] rounded-full" style={{ border: '2px solid white' }}></div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {user.nombres} {user.apellidos}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {ROLES_NAMES[user.rol?.id] || 'Sin rol'}
                  </p>
                </div>
                <UserCircleIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-gray-500 rounded-xl transition-all outline-none"
                style={{ border: 'none', background: 'transparent' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`} />
    </>
  );
};

export default Sidebar;