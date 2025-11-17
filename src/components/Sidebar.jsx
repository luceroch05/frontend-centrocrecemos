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
  ChevronLeftIcon,
  ChevronRightIcon,
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
  const user = JSON.parse(localStorage.getItem('user'));
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Función para filtrar elementos del menú basado en el rol del usuario
  const getFilteredMenuItems = () => {
    if (!user || !user.rol?.id) return menuItems;

    const userRole = user.rol.id;

    // Terapeuta puede ver "Agenda" y "Pacientes"
    if (userRole === ROLES.TERAPEUTA) {
      return menuItems.filter(item =>
        item.text === 'Agenda' ||
        item.text === 'Pacientes'
      );
    }

    // Admisión puede ver "Agenda", "Pacientes" y "Certificaciones"
    if (userRole === ROLES.ADMISION) {
      return menuItems.filter(item =>
        item.text === 'Agenda' ||
        item.text === 'Pacientes' ||
        item.text === 'Certificaciones'
      );
    }

    // Otros roles pueden ver todos los elementos
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
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#7B1FA2] to-[#6A1B9A] text-white transition-all duration-300 z-50 flex flex-col shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Header con Logo */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-center">
            <img
              src="/logo-text-short.png"
              alt="Logo"
              className={`${isCollapsed ? 'h-8' : 'h-10'} w-auto object-contain`}
            />
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className={`p-4 border-b border-white/10 flex-shrink-0 ${isCollapsed ? 'px-3' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#A3C644] flex items-center justify-center font-bold text-white text-lg shadow-lg">
                  {user.nombres?.[0] || ''}{user.apellidos?.[0] || ''}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#7B1FA2]"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user.nombres} {user.apellidos}
                  </p>
                  <p className="text-xs text-white/70 truncate">
                    {ROLES_NAMES[user.rol?.id] || 'Sin rol'}
                  </p>
                  <button
                    onClick={() => navigate('/intranet/mi-perfil')}
                    className="text-xs text-white/60 hover:text-white transition-colors mt-1"
                  >
                    Mi Perfil
                  </button>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-2 rounded-lg text-white/80 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                title="Cerrar sesión"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.text : ''}
                >
                  <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} ${isActive ? 'text-[#A3C644]' : ''} transition-colors`} />
                  {!isCollapsed && (
                    <span className={`font-medium text-sm ${isActive ? 'font-semibold' : ''}`}>
                      {item.text}
                    </span>
                  )}
                  {!isCollapsed && isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#A3C644]"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer con Toggle */}
        <div className="mt-auto border-t border-white/10 flex-shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            title={isCollapsed ? 'Expandir' : 'Contraer'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Spacer para el contenido principal */}
      <div className={`${isCollapsed ? 'ml-20' : 'ml-72'} transition-all duration-300`} />
    </>
  );
};

export default Sidebar;
