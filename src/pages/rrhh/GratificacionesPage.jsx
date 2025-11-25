import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, User, Calculator, TrendingUp, CheckCircle, Clock, Info, X, Search, Sparkles } from 'lucide-react';
import { calcularGratificaciones, registrarGratificacion } from '../../services/rrhhService';

export default function GratificacionesPage() {
  const [periodo, setPeriodo] = useState('julio');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [gratificaciones, setGratificaciones] = useState([]);
  const [resumen, setResumen] = useState({
    totalGratificaciones: 0,
    totalSueldos: 0,
    empleadosConDerecho: 0
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarGratificaciones();
  }, [periodo, anio]);

  const cargarGratificaciones = async () => {
    setLoading(true);
    try {
      const data = await calcularGratificaciones({ periodo, anio });
      setGratificaciones(data.gratificaciones);
      setResumen({
        totalGratificaciones: data.totalGratificaciones,
        totalSueldos: data.totalSueldos,
        empleadosConDerecho: data.empleadosConDerecho
      });
    } catch (error) {
      console.error('Error al calcular gratificaciones:', error);
      setSnackbar({ open: true, message: 'Error al cargar gratificaciones', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const guardarGratificacion = async (gratificacion) => {
    try {
      const response = await registrarGratificacion({
        empleadoId: gratificacion.id,
        monto: gratificacion.gratificacionProporcional,
        periodo: `${periodo}-${anio}`
      });
      setSnackbar({
        open: true,
        message: {
          title: 'Pago registrado exitosamente',
          empleado: `${gratificacion.nombres} ${gratificacion.apellidos}`,
          periodo: `${periodo.charAt(0).toUpperCase() + periodo.slice(1)} ${anio}`,
          sueldoBase: gratificacion.sueldoBase,
          gratificacion: gratificacion.gratificacionProporcional,
          total: gratificacion.sueldoTotal
        },
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al registrar gratificación:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error al registrar la gratificación',
        severity: 'error'
      });
    }
  };

  const filteredGratificaciones = gratificaciones.filter(grat =>
    `${grat.nombres} ${grat.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grat.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">
        
        {/* Notificación */}
        {snackbar.open && (
          <div className="fixed top-6 right-6 z-50 max-w-md">
            {snackbar.severity === 'success' && typeof snackbar.message === 'object' ? (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-300">
                <div className="bg-gradient-to-r from-[#A3C644] to-[#8FB933] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg">{snackbar.message.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSnackbar({ ...snackbar, open: false })} 
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold">
                      {snackbar.message.empleado.split(' ')[0][0]}{snackbar.message.empleado.split(' ')[1]?.[0] || ''}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{snackbar.message.empleado}</p>
                      <p className="text-sm text-gray-500">{snackbar.message.periodo}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sueldo Base</span>
                      <span className="font-semibold text-gray-900">S/ {snackbar.message.sueldoBase.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gratificación (25%)</span>
                      <span className="font-semibold text-[#A3C644]">S/ {snackbar.message.gratificacion.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total a Pagar</span>
                        <span className="text-xl font-bold text-[#7B1FA2]">S/ {snackbar.message.total.toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-3 mt-4">
                    <p className="text-xs text-gray-600 text-center">
                      El pago ha sido registrado en el historial con el desglose completo
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`px-5 py-4 rounded-xl shadow-lg border transform transition-all duration-300 ${
                snackbar.severity === 'success'
                  ? 'bg-white border-green-200'
                  : 'bg-white border-red-200'
              } flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  snackbar.severity === 'success' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {snackbar.severity === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <span className="text-sm text-gray-700 flex-1">{snackbar.message}</span>
                <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Calculadora de Gratificaciones</h1>
              <p className="text-gray-600">Calcula las gratificaciones de tus empleados</p>
            </div>
          </div>
        </div>

        {/* Filtros y Buscador */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Periodo</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
              >
                <option value="julio">Julio (Enero - Junio)</option>
                <option value="diciembre">Diciembre (Julio - Diciembre)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
              <select
                value={anio}
                onChange={(e) => setAnio(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar empleado</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nombre o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={cargarGratificaciones}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
              >
                <Calculator className="w-5 h-5" />
                {loading ? 'Calculando...' : 'Calcular'}
              </button>
            </div>
          </div>
        </div>

        {/* Resumen - Cards estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Empleados</span>
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{resumen.empleadosConDerecho}</div>
            <div className="text-xs text-gray-500 mt-1">Con derecho</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Gratificaciones</span>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">S/ {resumen.totalGratificaciones.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
            <div className="text-xs text-gray-500 mt-1">Total a pagar</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Sueldos Totales</span>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">S/ {resumen.totalSueldos.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
            <div className="text-xs text-gray-500 mt-1">Base + Gratificación</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Periodo</span>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 capitalize">{periodo} {anio}</div>
          </div>
        </div>

        {/* Tabla de Gratificaciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sueldo Base</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Meses</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gratificación</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sueldo Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Banco/Cuenta</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGratificaciones.map((grat, index) => (
                  <tr key={grat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {grat.nombres[0]}{grat.apellidos[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {grat.nombres} {grat.apellidos}
                          </div>
                          <div className="text-xs text-gray-500">
                            Ingreso: {new Date(grat.fecha_ingreso).toLocaleDateString('es-PE')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {grat.cargo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      S/ {grat.sueldoBase.toLocaleString('es-PE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {grat.mesesTrabajados} / 6
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#A3C644]">
                        S/ {grat.gratificacionProporcional.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                      </div>
                      {grat.mesesTrabajados < 6 && (
                        <div className="text-xs text-gray-500 font-medium">Proporcional</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#7B1FA2]">
                        S/ {grat.sueldoTotal.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Base + Gratificación</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="font-semibold">{grat.banco}</div>
                      <div className="text-xs text-gray-500">{grat.numero_cuenta}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => guardarGratificacion(grat)}
                        className="px-4 py-2 bg-gradient-to-r from-[#A3C644] to-[#8FB933] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        Registrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGratificaciones.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No hay empleados con derecho a gratificación en este periodo</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#7B1FA2] mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Calculando gratificaciones...</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Información sobre Gratificaciones</h3>
              <div className="space-y-2.5 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#A3C644] flex-shrink-0 mt-0.5" />
                  <p>La gratificación es el <strong>25% del sueldo base</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#A3C644] flex-shrink-0 mt-0.5" />
                  <p>Se paga en <strong>Julio</strong> (periodo Enero-Junio) y <strong>Diciembre</strong> (periodo Julio-Diciembre)</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#A3C644] flex-shrink-0 mt-0.5" />
                  <p>Si el empleado no cumplió los 6 meses completos, <strong>se calcula proporcional</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#A3C644] flex-shrink-0 mt-0.5" />
                  <p>Solo empleados activos tienen derecho a gratificación</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm font-bold text-[#7B1FA2] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Importante:
                </p>
                <p className="text-sm text-gray-700">
                  Al hacer clic en "Registrar" se creará <strong>UN SOLO PAGO</strong> que incluye el sueldo base
                  más la gratificación. El desglose se mostrará automáticamente en el Historial de Pagos
                  para tu control contable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}