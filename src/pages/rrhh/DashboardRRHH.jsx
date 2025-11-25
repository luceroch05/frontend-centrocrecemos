import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { getEmpleados, getPagos } from '../../services/rrhhService';

export default function DashboardRRHH() {
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    empleadosActivos: 0,
    empleadosInactivos: 0,
    totalPagadoMes: 0,
    totalPagadoAnio: 0,
    proximaGratificacion: null,
    pagosRecientes: [],
    costoMensualPlanilla: 0,
    costoAnualProyectado: 0,
    promedioSueldoPorEmpleado: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      // Cargar estadísticas de empleados
      const empleados = await getEmpleados();
      const activos = empleados.filter(e => e.estado === 'activo' || e.estado === true);
      const inactivos = empleados.filter(e => e.estado === 'inactivo' || e.estado === false);

      // Cargar pagos del año
      const anioActual = new Date().getFullYear();
      const pagos = await getPagos({ anio: anioActual });
      const mesActual = new Date().getMonth();
      const pagosMesActual = pagos.filter(p => {
        const fechaPago = new Date(p.fechaPago);
        return fechaPago.getMonth() === mesActual;
      });

      const totalPagadoMes = pagosMesActual.reduce((sum, p) => sum + parseFloat(p.monto), 0);
      const totalPagadoAnio = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

      // Calcular próxima gratificación
      const mesProximaGratificacion = mesActual < 6 ? 'julio' : 'diciembre';
      const fechaProximaGratificacion = mesActual < 6
        ? new Date(anioActual, 6, 15)
        : new Date(anioActual, 11, 15);

      setStats({
        totalEmpleados: empleados.length,
        empleadosActivos: activos.length,
        empleadosInactivos: inactivos.length,
        totalPagadoMes,
        totalPagadoAnio,
        proximaGratificacion: {
          periodo: mesProximaGratificacion,
          fecha: fechaProximaGratificacion,
          diasRestantes: Math.ceil((fechaProximaGratificacion - new Date()) / (1000 * 60 * 60 * 24))
        },
        pagosRecientes: pagos.slice(0, 5)
      });
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      'sueldo': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Sueldo Regular' },
      'sueldo_con_gratificacion': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Sueldo + Gratificación' },
      'bono': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Bono' },
      'gratificacion': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Gratificación' },
      'aguinaldo': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Aguinaldo' }
    };
    return badges[tipo] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: tipo };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#7B1FA2] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Dashboard de Recursos Humanos</h1>
              <p className="text-gray-600">Resumen general de empleados y pagos</p>
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Empleados */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Total Empleados</span>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalEmpleados}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-green-600 font-semibold">↑ {stats.empleadosActivos}</span> activos
            </div>
          </div>

          {/* Empleados Activos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Empleados Activos</span>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.empleadosActivos}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.empleadosInactivos} inactivos
            </div>
          </div>

          {/* Pagado este mes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Pagado Este Mes</span>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              S/ {stats.totalPagadoMes.toLocaleString('es-PE', {minimumFractionDigits: 0})}
            </div>
            <div className="text-xs text-gray-500 mt-1 capitalize">
              {new Date().toLocaleDateString('es-PE', { month: 'long' })}
            </div>
          </div>

          {/* Pagado este año */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Total Anual</span>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              S/ {stats.totalPagadoAnio.toLocaleString('es-PE', {minimumFractionDigits: 0})}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Próxima Gratificación */}
        {stats.proximaGratificacion && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-[#7B1FA2] p-6 mb-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900">Próxima Gratificación</h3>
                    <SparklesIcon className="w-5 h-5 text-[#A3C644]" />
                  </div>
                  <p className="text-base capitalize text-gray-700 font-semibold">
                    {stats.proximaGratificacion.periodo} {new Date().getFullYear()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.proximaGratificacion.fecha.toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl px-6 py-4 shadow-lg">
                  <p className="text-4xl font-bold text-white">{stats.proximaGratificacion.diasRestantes}</p>
                  <p className="text-sm text-purple-100 font-medium">días</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagos Recientes - Full Width */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Últimos Pagos Registrados</h3>
            </div>
            <a 
              href="/intranet/rrhh/historial"
              className="text-sm text-[#7B1FA2] hover:text-[#9C27B0] font-semibold flex items-center gap-1 transition-colors"
            >
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="space-y-3">
            {stats.pagosRecientes.length > 0 ? (
              stats.pagosRecientes.map((pago) => {
                const badge = getTipoBadge(pago.tipo);
                return (
                  <div key={pago.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {pago.empleado?.nombres?.[0] || 'E'}{pago.empleado?.apellidos?.[0] || 'E'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">
                            {pago.empleado?.nombres} {pago.empleado?.apellidos}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 inline-flex text-xs font-bold rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">{pago.periodo}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#A3C644]">
                          S/ {parseFloat(pago.monto).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(pago.fechaPago).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {pago.tipo === 'sueldo_con_gratificacion' && (
                      <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 rounded-lg p-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sueldo Base:</span>
                            <span className="font-semibold text-gray-700">S/ {parseFloat(pago.montoSueldo || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gratificación (25%):</span>
                            <span className="font-semibold text-[#7B1FA2]">S/ {parseFloat(pago.montoGratificacion || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No hay pagos registrados</p>
                <p className="text-sm text-gray-400 mt-1">Los pagos aparecerán aquí una vez registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/intranet/rrhh/empleados"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Gestionar Empleados</p>
                <p className="text-sm text-gray-500">Ver lista completa</p>
              </div>
            </div>
          </a>

          <a
            href="/intranet/rrhh/gratificaciones"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Calcular Gratificaciones</p>
                <p className="text-sm text-gray-500">Nueva gratificación</p>
              </div>
            </div>
          </a>

          <a
            href="/intranet/rrhh/historial"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">Ver Historial</p>
                <p className="text-sm text-gray-500">Todos los pagos</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}