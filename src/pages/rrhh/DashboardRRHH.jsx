import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Recursos Humanos</h1>
        <p className="text-gray-600">Resumen general de empleados y pagos</p>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Empleados */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-100 text-sm">Total Empleados</p>
              <p className="text-3xl font-bold mt-1">{stats.totalEmpleados}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <UserGroupIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="flex items-center text-sm text-blue-100">
            <span className="text-green-300 mr-1">↑</span>
            {stats.empleadosActivos} activos
          </div>
        </div>

        {/* Empleados Activos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Empleados Activos</p>
              <p className="text-3xl font-bold mt-1">{stats.empleadosActivos}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <ArrowTrendingUpIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="text-sm text-green-100">
            {stats.empleadosInactivos} inactivos
          </div>
        </div>

        {/* Pagado este mes */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-purple-100 text-sm">Pagado Este Mes</p>
              <p className="text-3xl font-bold mt-1">
                S/ {stats.totalPagadoMes.toLocaleString('es-PE', {minimumFractionDigits: 0})}
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <CurrencyDollarIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="text-sm text-purple-100">
            {new Date().toLocaleDateString('es-PE', { month: 'long' })}
          </div>
        </div>

        {/* Pagado este año */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm">Total Anual</p>
              <p className="text-3xl font-bold mt-1">
                S/ {stats.totalPagadoAnio.toLocaleString('es-PE', {minimumFractionDigits: 0})}
              </p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <BanknotesIcon className="w-8 h-8" />
            </div>
          </div>
          <div className="text-sm text-orange-100">
            {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Próxima Gratificación */}
      {stats.proximaGratificacion && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">📅 Próxima Gratificación</h3>
              <p className="text-lg capitalize mb-1">
                {stats.proximaGratificacion.periodo} {new Date().getFullYear()}
              </p>
              <p className="text-sm text-indigo-100">
                {stats.proximaGratificacion.fecha.toLocaleDateString('es-PE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-24 h-24 flex items-center justify-center mb-2">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.proximaGratificacion.diasRestantes}</p>
                  <p className="text-xs">días</p>
                </div>
              </div>
              <CalendarIcon className="w-8 h-8 mx-auto" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos Recientes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Pagos Recientes</h3>
            <ChartBarIcon className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-3">
            {stats.pagosRecientes.length > 0 ? (
              stats.pagosRecientes.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {pago.empleado?.nombres} {pago.empleado?.apellidos}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{pago.tipo} - {pago.periodo}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      S/ {parseFloat(pago.monto).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(pago.fechaPago).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay pagos registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen por tipo de pago */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Resumen de Pagos</h3>
            <ChartBarIcon className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Gratificaciones</p>
                  <p className="text-sm text-gray-500">
                    {stats.pagosRecientes.filter(p => p.tipo === 'gratificacion').length} pagos
                  </p>
                </div>
              </div>
              <p className="font-bold text-purple-600">
                S/ {stats.pagosRecientes
                  .filter(p => p.tipo === 'gratificacion')
                  .reduce((sum, p) => sum + parseFloat(p.monto), 0)
                  .toLocaleString('es-PE', {minimumFractionDigits: 0})}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bonos</p>
                  <p className="text-sm text-gray-500">
                    {stats.pagosRecientes.filter(p => p.tipo === 'bono').length} pagos
                  </p>
                </div>
              </div>
              <p className="font-bold text-blue-600">
                S/ {stats.pagosRecientes
                  .filter(p => p.tipo === 'bono')
                  .reduce((sum, p) => sum + parseFloat(p.monto), 0)
                  .toLocaleString('es-PE', {minimumFractionDigits: 0})}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Aguinaldos</p>
                  <p className="text-sm text-gray-500">
                    {stats.pagosRecientes.filter(p => p.tipo === 'aguinaldo').length} pagos
                  </p>
                </div>
              </div>
              <p className="font-bold text-green-600">
                S/ {stats.pagosRecientes
                  .filter(p => p.tipo === 'aguinaldo')
                  .reduce((sum, p) => sum + parseFloat(p.monto), 0)
                  .toLocaleString('es-PE', {minimumFractionDigits: 0})}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/intranet/rrhh/empleados"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Gestionar Empleados</p>
            <p className="text-sm text-gray-500">Ver lista completa</p>
          </div>
        </a>

        <a
          href="/intranet/rrhh/gratificaciones"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Calcular Gratificaciones</p>
            <p className="text-sm text-gray-500">Nueva gratificación</p>
          </div>
        </a>

        <a
          href="/intranet/rrhh/historial"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Ver Historial</p>
            <p className="text-sm text-gray-500">Todos los pagos</p>
          </div>
        </a>
      </div>
    </div>
  );
}
