import React, { useState, useEffect } from 'react';
import { ClockIcon, FunnelIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { getPagos } from '../../services/rrhhService';

export default function HistorialPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    periodo: 'todos',
    anio: new Date().getFullYear()
  });

  useEffect(() => {
    cargarPagos();
  }, [filtros]);

  const cargarPagos = async () => {
    try {
      const filtrosApi = {};
      if (filtros.tipo !== 'todos') filtrosApi.tipo = filtros.tipo;
      if (filtros.periodo !== 'todos') filtrosApi.periodo = filtros.periodo;
      filtrosApi.anio = filtros.anio;

      const data = await getPagos(filtrosApi);
      setPagos(data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    // Aquí puedes implementar la exportación a Excel
    alert('Funcionalidad de exportación próximamente');
  };

  const pagosFiltrados = pagos;
  const totalPagado = pagosFiltrados.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Pagos</h1>
        <p className="text-gray-600">Registro completo de todas las gratificaciones pagadas</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pago</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="gratificacion">Gratificación</option>
              <option value="bono">Bono</option>
              <option value="aguinaldo">Aguinaldo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="julio">Julio</option>
              <option value="diciembre">Diciembre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={filtros.anio}
              onChange={(e) => setFiltros({...filtros, anio: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={exportarExcel}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Total de Pagos</span>
            <ClockIcon className="w-6 h-6 text-purple-200" />
          </div>
          <div className="text-3xl font-bold">{pagosFiltrados.length}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Total Pagado</span>
            <span className="text-2xl">S/</span>
          </div>
          <div className="text-3xl font-bold">
            {totalPagado.toLocaleString('es-PE', {minimumFractionDigits: 2})}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Promedio por Pago</span>
            <span className="text-2xl">S/</span>
          </div>
          <div className="text-3xl font-bold">
            {pagosFiltrados.length > 0
              ? (totalPagado / pagosFiltrados.length).toLocaleString('es-PE', {minimumFractionDigits: 2})
              : '0.00'}
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Cargando historial...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periodo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado por</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{pago.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pago.empleado?.nombres} {pago.empleado?.apellidos}
                      </div>
                      <div className="text-sm text-gray-500">{pago.empleado?.cargo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        pago.tipo === 'gratificacion' ? 'bg-purple-100 text-purple-800' :
                        pago.tipo === 'bono' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pago.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {pago.periodo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        S/ {parseFloat(pago.monto).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pago.fechaPago).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pago.registradoPor || 'Sistema'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron pagos con los filtros seleccionados</p>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 mb-2">📊 Estadísticas del Periodo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Gratificaciones:</span>{' '}
            {pagosFiltrados.filter(p => p.tipo === 'gratificacion').length}
          </div>
          <div>
            <span className="font-medium">Bonos:</span>{' '}
            {pagosFiltrados.filter(p => p.tipo === 'bono').length}
          </div>
          <div>
            <span className="font-medium">Aguinaldos:</span>{' '}
            {pagosFiltrados.filter(p => p.tipo === 'aguinaldo').length}
          </div>
        </div>
      </div>
    </div>
  );
}
