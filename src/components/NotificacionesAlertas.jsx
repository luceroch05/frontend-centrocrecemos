import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import {
  contarAlertasNoLeidas,
  obtenerAlertasNoLeidas,
  marcarAlertaLeida,
  marcarTodasAlertasLeidas,
} from '../services/alertasService';

const NotificacionesAlertas = () => {
  const [totalNoLeidas, setTotalNoLeidas] = useState(0);
  const [alertas, setAlertas] = useState([]);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  // Cargar conteo de alertas al montar
  useEffect(() => {
    cargarConteoAlertas();

    // Polling cada 30 segundos
    const interval = setInterval(cargarConteoAlertas, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cargar alertas cuando se abre el panel
  useEffect(() => {
    if (mostrarPanel) {
      cargarAlertas();
    }
  }, [mostrarPanel]);

  const cargarConteoAlertas = async () => {
    try {
      const { total } = await contarAlertasNoLeidas();
      setTotalNoLeidas(total);
    } catch (error) {
      console.error('Error al cargar conteo de alertas:', error);
    }
  };

  const cargarAlertas = async () => {
    setCargando(true);
    try {
      const resultado = await obtenerAlertasNoLeidas(10);
      setAlertas(resultado.alertas || []);
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarAlertaLeida(id);
      setAlertas(prev => prev.filter(a => a.id !== id));
      setTotalNoLeidas(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar alerta como leída:', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await marcarTodasAlertasLeidas();
      setAlertas([]);
      setTotalNoLeidas(0);
      setMostrarPanel(false);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const handleVerTodas = () => {
    setMostrarPanel(false);
    navigate('/intranet/alertas');
  };

  const getIconoSeveridad = (severidad) => {
    const iconos = {
      CRITICA: <ShieldExclamationIcon className="w-5 h-5 text-red-600" />,
      ALTA: <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />,
      MEDIA: <InformationCircleIcon className="w-5 h-5 text-yellow-600" />,
      BAJA: <InformationCircleIcon className="w-5 h-5 text-blue-600" />,
    };
    return iconos[severidad] || iconos.MEDIA;
  };

  const getColorSeveridad = (severidad) => {
    const colores = {
      CRITICA: 'bg-red-100 border-red-300',
      ALTA: 'bg-orange-100 border-orange-300',
      MEDIA: 'bg-yellow-100 border-yellow-300',
      BAJA: 'bg-blue-100 border-blue-300',
    };
    return colores[severidad] || colores.MEDIA;
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaAlerta = new Date(fecha);
    const diff = Math.floor((ahora - fechaAlerta) / 1000); // segundos

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  };

  // Si no hay alertas, no mostrar nada
  if (totalNoLeidas === 0 && !mostrarPanel) {
    return null;
  }

  return (
    <div className="relative">
      {/* Badge de notificaciones */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className="relative p-2 rounded-lg hover:bg-red-50 transition-colors"
        title={`${totalNoLeidas} alerta${totalNoLeidas !== 1 ? 's' : ''} sin leer`}
      >
        {totalNoLeidas > 0 ? (
          <BellSolidIcon className="w-6 h-6 text-red-600 animate-pulse" />
        ) : (
          <BellIcon className="w-6 h-6 text-gray-600" />
        )}

        {totalNoLeidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {totalNoLeidas > 99 ? '99+' : totalNoLeidas}
          </span>
        )}
      </button>

      {/* Panel de alertas */}
      {mostrarPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMostrarPanel(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl z-50 border border-gray-200 max-h-96 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-2">
                <BellSolidIcon className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-800">
                  Alertas de Seguridad
                </h3>
              </div>
              <button
                onClick={() => setMostrarPanel(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto">
              {cargando ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                  Cargando alertas...
                </div>
              ) : alertas.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay alertas nuevas</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {alertas.map((alerta) => (
                    <div
                      key={alerta.id}
                      className={`p-4 hover:bg-gray-50 transition-colors relative ${getColorSeveridad(alerta.severidad)} border-l-4`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 pt-1">
                          {getIconoSeveridad(alerta.severidad)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-800 line-clamp-1">
                              {alerta.titulo}
                            </h4>
                            <button
                              onClick={() => handleMarcarLeida(alerta.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Marcar como leída"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {alerta.mensaje}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatearTiempo(alerta.fechaCreacion)}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              alerta.severidad === 'CRITICA' ? 'bg-red-200 text-red-800' :
                              alerta.severidad === 'ALTA' ? 'bg-orange-200 text-orange-800' :
                              alerta.severidad === 'MEDIA' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {alerta.severidad}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {alertas.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2">
                <button
                  onClick={handleMarcarTodasLeidas}
                  className="flex-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Marcar todas como leídas
                </button>
                <button
                  onClick={handleVerTodas}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium"
                >
                  Ver todas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificacionesAlertas;
