import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CalendarIcon, UserIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { getEmpleados, createPago } from '../../services/rrhhService';

export default function GratificacionesPage() {
  const [empleados, setEmpleados] = useState([]);
  const [periodo, setPeriodo] = useState('julio'); // julio o diciembre
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [gratificaciones, setGratificaciones] = useState([]);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (empleados.length > 0) {
      calcularGratificaciones();
    }
  }, [empleados, periodo, anio]);

  const cargarEmpleados = async () => {
    try {
      const data = await getEmpleados();
      // Filtrar solo empleados activos
      const activos = data.filter(e => e.estado === 'activo' || e.estado === true);
      setEmpleados(activos);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    }
  };

  const calcularMesesTrabajados = (fechaIngreso, periodoActual, anioActual) => {
    const fechaInicio = new Date(fechaIngreso);
    let mesInicioPeriodo, mesFinPeriodo;

    if (periodoActual === 'julio') {
      mesInicioPeriodo = new Date(anioActual, 0, 1); // 1 enero
      mesFinPeriodo = new Date(anioActual, 5, 30); // 30 junio
    } else {
      mesInicioPeriodo = new Date(anioActual, 6, 1); // 1 julio
      mesFinPeriodo = new Date(anioActual, 11, 31); // 31 diciembre
    }

    // Si ingresó después del periodo, no tiene derecho
    if (fechaInicio > mesFinPeriodo) {
      return 0;
    }

    // Si ingresó antes del periodo, trabajó los 6 meses completos
    if (fechaInicio <= mesInicioPeriodo) {
      return 6;
    }

    // Si ingresó durante el periodo, calcular meses proporcionales
    const mesesTrabajados = Math.floor(
      (mesFinPeriodo.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ) + 1;

    return Math.min(mesesTrabajados, 6);
  };

  const calcularGratificaciones = () => {
    const resultados = empleados
      .filter(empleado => empleado.sueldo_base && empleado.fecha_ingreso) // Solo empleados con datos completos
      .map(empleado => {
        const mesesTrabajados = calcularMesesTrabajados(empleado.fecha_ingreso, periodo, anio);
        const sueldoBase = Number(empleado.sueldo_base) || 0;
        const gratificacionCompleta = sueldoBase * 0.25;
        const gratificacionProporcional = (gratificacionCompleta * mesesTrabajados) / 6;

        return {
          id: empleado.id,
          nombres: empleado.nombres || '',
          apellidos: empleado.apellidos || '',
          cargo: empleado.cargo || 'N/A',
          sueldoBase,
          fecha_ingreso: empleado.fecha_ingreso,
          mesesTrabajados,
          gratificacionCompleta,
          gratificacionProporcional,
          numero_cuenta: empleado.numero_cuenta || 'N/A',
          banco: empleado.banco || 'N/A'
        };
      })
      .filter(g => g.mesesTrabajados > 0); // Solo empleados con derecho a gratificación

    setGratificaciones(resultados);
  };

  const totalGratificaciones = gratificaciones.reduce((sum, g) => sum + g.gratificacionProporcional, 0);

  const guardarGratificacion = async (gratificacion) => {
    try {
      await createPago({
        empleadoId: gratificacion.id,
        tipo: 'gratificacion',
        monto: gratificacion.gratificacionProporcional,
        periodo: `${periodo}-${anio}`,
        fechaPago: new Date().toISOString().split('T')[0]
      });
      alert('Gratificación registrada exitosamente');
    } catch (error) {
      console.error('Error al registrar gratificación:', error);
      alert('Error al registrar la gratificación');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculadora de Gratificaciones</h1>
        <p className="text-gray-600">Calcula las gratificaciones de tus empleados</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="julio">Julio (Enero - Junio)</option>
              <option value="diciembre">Diciembre (Julio - Diciembre)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
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
              onClick={calcularGratificaciones}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <CalculatorIcon className="w-5 h-5" />
              Calcular
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Empleados con derecho</span>
            <UserIcon className="w-6 h-6 text-blue-200" />
          </div>
          <div className="text-3xl font-bold">{gratificaciones.length}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Total a Pagar</span>
            <CurrencyDollarIcon className="w-6 h-6 text-green-200" />
          </div>
          <div className="text-3xl font-bold">S/ {totalGratificaciones.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-100">Periodo</span>
            <CalendarIcon className="w-6 h-6 text-purple-200" />
          </div>
          <div className="text-xl font-bold capitalize">{periodo} {anio}</div>
        </div>
      </div>

      {/* Tabla de Gratificaciones */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meses Trabajados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gratificación Completa (25%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gratificación a Pagar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banco/Cuenta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {gratificaciones.map((grat) => (
                <tr key={grat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {grat.nombres} {grat.apellidos}
                    </div>
                    <div className="text-sm text-gray-500">
                      Ingreso: {new Date(grat.fecha_ingreso).toLocaleDateString('es-PE')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {grat.cargo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    S/ {grat.sueldoBase.toLocaleString('es-PE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {grat.mesesTrabajados} / 6 meses
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    S/ {grat.gratificacionCompleta.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      S/ {grat.gratificacionProporcional.toLocaleString('es-PE', {minimumFractionDigits: 2})}
                    </div>
                    {grat.mesesTrabajados < 6 && (
                      <div className="text-xs text-gray-500">Proporcional</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{grat.banco}</div>
                    <div className="text-xs">{grat.numero_cuenta}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => guardarGratificacion(grat)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Registrar Pago
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gratificaciones.length === 0 && (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay empleados con derecho a gratificación en este periodo</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información sobre Gratificaciones</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• La gratificación es el 25% del sueldo base</li>
          <li>• Se paga en Julio (periodo Enero-Junio) y Diciembre (periodo Julio-Diciembre)</li>
          <li>• Si el empleado no cumplió los 6 meses completos, se calcula proporcional</li>
          <li>• Solo empleados activos tienen derecho a gratificación</li>
        </ul>
      </div>
    </div>
  );
}
