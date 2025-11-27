import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

export default function NotificacionesVacaciones() {
  const [conDerecho, setConDerecho] = useState([]);
  const [proximosACumplir, setProximosACumplir] = useState([]);
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [derechoRes, proximosRes] = await Promise.all([
        api.get('/vacaciones/notificaciones'),
        api.get('/vacaciones/alertas/primer-anio')
      ]);
      setConDerecho(derechoRes.data || []);
      // Filtrar solo los que faltan 7 días o menos (una semana)
      const proximosFiltrados = (proximosRes.data || []).filter(emp => emp.diasHastaPrimerAnio <= 7);
      setProximosACumplir(proximosFiltrados);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    try {
      // Extraer la fecha del string sin convertir a Date (para evitar problemas de zona horaria)
      const fechaSolo = fechaStr.split('T')[0]; // Obtener solo YYYY-MM-DD
      const [anio, mes, dia] = fechaSolo.split('-');
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      // Quitar el 0 adelante del día si lo tiene
      const diaNumero = parseInt(dia, 10);
      return `${diaNumero} ${meses[parseInt(mes, 10) - 1]} ${anio}`;
    } catch (error) {
      console.error('Error formateando fecha:', error, fechaStr);
      return fechaStr;
    }
  };

  const total = proximosACumplir.length; // Solo contar próximos a cumplir

  return (
    <>
      <style>{`
        .notif-panel { animation: slideIn 0.2s ease-out; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .notif-item { transition: all 0.15s; }
        .notif-item:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
        @media (max-width: 1024px) {
          .notif-panel { left: 16px !important; right: 16px !important; width: auto !important; }
        }
      `}</style>

      {/* Botón */}
      <button
        onClick={() => setMostrar(!mostrar)}
        className="relative p-2 text-gray-600 hover:text-[#7B1FA2] hover:bg-gray-50 rounded-lg transition-all"
        title="Alertas de vacaciones"
      >
        <BellIcon className="w-5 h-5" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#A3C644] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {/* Panel */}
      {mostrar && (
        <div className="notif-panel fixed top-4 left-[calc(var(--sidebar-width,256px)+16px)] h-[calc(100vh-32px)] w-72 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col z-[9999]">

          {/* Header */}
          <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellIcon className="w-4 h-4 text-[#7B1FA2]" />
              <div>
                <h3 className="font-bold text-gray-900 text-xs">Vacaciones</h3>
                <p className="text-[9px] text-gray-500">{total} alerta{total !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button onClick={() => setMostrar(false)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-[#7B1FA2] rounded-full animate-spin"></div>
              </div>
            ) : total === 0 ? (
              <div className="flex items-center justify-center h-full px-3 text-center">
                <div>
                  <BellIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium text-xs">Sin alertas</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5">
                {/* PRÓXIMOS a cumplir año */}
                {proximosACumplir.length > 0 ? (
                  <div>
                    <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide mb-2 px-0.5">Próximos a cumplir año</p>
                    {proximosACumplir.map((emp, i) => {
                      const diasFaltan = emp.diasHastaPrimerAnio;
                      const esUrgente = diasFaltan <= 7;
                      const esMuyUrgente = diasFaltan <= 3;

                      return (
                        <div key={i} className={`notif-item bg-white rounded-lg p-2.5 border-2 mb-2 transition-all ${
                          esMuyUrgente ? 'border-red-400 shadow-md' : esUrgente ? 'border-orange-400' : 'border-gray-200'
                        } hover:border-[#7B1FA2]`}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-full flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                              {emp.nombres?.[0]}{emp.apellidos?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-[11px]">{emp.nombres} {emp.apellidos}</p>
                              {emp.fechaPrimerAnio && (
                                <p className="text-[9px] text-gray-400 mt-0.5">{formatearFecha(emp.fechaPrimerAnio)}</p>
                              )}
                            </div>
                            <div className={`px-3 py-1.5 rounded-lg ${
                              esMuyUrgente
                                ? 'bg-red-500 animate-pulse'
                                : esUrgente
                                ? 'bg-orange-500'
                                : 'bg-[#A3C644]'
                            }`}>
                              <p className="text-xl font-bold text-white leading-none">{diasFaltan}</p>
                              <p className="text-[8px] text-white/90 font-medium mt-0.5 text-center">día{diasFaltan !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium text-xs">Sin alertas</p>
                    <p className="text-gray-400 text-[10px] mt-1">Nadie próximo a cumplir año</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {total > 0 && (
            <div className="p-2.5 border-t border-gray-200">
              <a
                href="/intranet/rrhh/vacaciones"
                className="block text-center text-[11px] font-semibold text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] py-2 rounded-lg transition-all"
                onClick={() => setMostrar(false)}
              >
                Ver gestión →
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
