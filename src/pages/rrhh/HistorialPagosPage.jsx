import React, { useState, useEffect } from 'react';
import { Clock, Filter, Download, DollarSign, TrendingUp, Calendar, X, CheckCircle, Info, Search, FileText } from 'lucide-react';
import { getPagos } from '../../services/rrhhService';
import * as XLSX from 'xlsx-js-style';

export default function HistorialPagosPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    mes: 'todos',
    anio: new Date().getFullYear()
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const meses = [
    { valor: 'enero', numero: 1 },
    { valor: 'febrero', numero: 2 },
    { valor: 'marzo', numero: 3 },
    { valor: 'abril', numero: 4 },
    { valor: 'mayo', numero: 5 },
    { valor: 'junio', numero: 6 },
    { valor: 'julio', numero: 7 },
    { valor: 'agosto', numero: 8 },
    { valor: 'septiembre', numero: 9 },
    { valor: 'octubre', numero: 10 },
    { valor: 'noviembre', numero: 11 },
    { valor: 'diciembre', numero: 12 }
  ];

  useEffect(() => {
    cargarPagos();
  }, [filtros]);

  const cargarPagos = async () => {
    setLoading(true);
    try {
      const filtrosApi = {
      
      };
      if (filtros.tipo !== 'todos') filtrosApi.tipo = filtros.tipo;
      if (filtros.mes !== 'todos') {
        filtrosApi.mes = filtros.mes;
      }
      filtrosApi.anio = filtros.anio;

      const data = await getPagos(filtrosApi);
      
      const pagosOrdenados = data.sort((a, b) => {
        const fechaA = new Date(a.created_at || a.fechaPago);
        const fechaB = new Date(b.created_at || b.fechaPago);
        return fechaB - fechaA;
      });
      
      setPagos(pagosOrdenados);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setSnackbar({ open: true, message: 'Error al cargar el historial de pagos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    try {
      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();

      // ===============================================
      // HOJA 1: HISTORIAL DE PAGOS
      // ===============================================

      // Preparar datos para la hoja
      const datosArray = [
        ['HISTORIAL DE PAGOS - CENTRO CRECEMOS'],
        [`Año: ${filtros.anio}`, `Fecha de Exportación: ${new Date().toLocaleDateString('es-PE')}`],
        [],
        ['Empleado', 'DNI', 'Cargo', 'Tipo de Pago', 'Mes', 'Año', 'Monto Total', 'Fecha de Pago', 'Sueldo Base', 'Gratificación', 'Banco', 'Cuenta']
      ];

      // Función para formatear fecha correctamente sin problemas de timezone
      const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        // Extraer solo la parte de fecha (YYYY-MM-DD) sin timezone
        const fechaStr = fecha.split('T')[0];
        const [year, month, day] = fechaStr.split('-');
        return `${day}/${month}/${year}`;
      };

      // Agregar datos de pagos
      pagosFiltrados.forEach(pago => {
        datosArray.push([
          `${pago.empleado?.nombres || ''} ${pago.empleado?.apellidos || ''}`,
          pago.empleado?.numeroDocumento || pago.empleado?.dni || 'N/A',
          pago.empleado?.cargo || 'N/A',
          getTipoBadge(pago.tipo).label,
          pago.mes ? pago.mes.charAt(0).toUpperCase() + pago.mes.slice(1) : 'N/A',
          pago.anio || 'N/A',
          `S/ ${parseFloat(pago.monto).toFixed(2)}`,
          formatearFecha(pago.fechaPago),
          pago.tipo === 'sueldo_con_gratificacion' && pago.montoSueldo ? `S/ ${parseFloat(pago.montoSueldo).toFixed(2)}` : '-',
          pago.tipo === 'sueldo_con_gratificacion' && pago.montoGratificacion ? `S/ ${parseFloat(pago.montoGratificacion).toFixed(2)}` : '-',
          pago.empleado?.banco || 'N/A',
          pago.empleado?.numero_cuenta || 'N/A'
        ]);
      });

      const wsPagos = XLSX.utils.aoa_to_sheet(datosArray);

      // Merge del título
      wsPagos['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }
      ];

      // Ajustar ancho de columnas
      wsPagos['!cols'] = [
        { wch: 28 }, { wch: 12 }, { wch: 22 }, { wch: 28 },
        { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 16 },
        { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 20 }
      ];

      // Estilos
      const borderStyle = {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      };

      // Título (A1)
      wsPagos['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "7C3AED" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Info (A2, B2)
      if (wsPagos['A2']) {
        wsPagos['A2'].s = {
          font: { italic: true, sz: 10 },
          fill: { fgColor: { rgb: "F3F4F6" } }
        };
      }
      if (wsPagos['B2']) {
        wsPagos['B2'].s = {
          font: { italic: true, sz: 10 },
          fill: { fgColor: { rgb: "F3F4F6" } }
        };
      }

      // Headers (fila 4 - índice 3)
      const colsHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      colsHeaders.forEach(col => {
        const cell = `${col}4`;
        if (wsPagos[cell]) {
          wsPagos[cell].s = {
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
            fill: { fgColor: { rgb: "3B82F6" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: borderStyle
          };
        }
      });

      // Aplicar bordes a todas las celdas de datos
      for (let row = 4; row < datosArray.length; row++) {
        colsHeaders.forEach(col => {
          const cell = `${col}${row + 1}`;
          if (wsPagos[cell]) {
            wsPagos[cell].s = {
              border: borderStyle,
              alignment: { vertical: "center" }
            };
          }
        });
      }

      // ===============================================
      // HOJA 2: RESUMEN
      // ===============================================

      const resumenArray = [
        ['RESUMEN DE PAGOS - CENTRO CRECEMOS'],
        [`Año: ${filtros.anio}`, `Fecha: ${new Date().toLocaleDateString('es-PE')}`],
        [],
        ['TOTALES GENERALES', ''],
        ['Total Pagado', `S/ ${totalPagado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
        [],
        ['DESGLOSE POR TIPO', ''],
        ['Sueldos Regulares', `S/ ${totalSueldos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
        ['Pagos con Gratificación', `S/ ${totalSueldosConGratificacion.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
        ['Total Gratificaciones Pagadas', `S/ ${totalGratificaciones.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`],
        [],
        ['ESTADÍSTICAS', ''],
        ['Cantidad de Pagos', pagosFiltrados.length],
        ['Empleados Únicos', new Set(pagosFiltrados.map(p => p.empleado?.id)).size],
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenArray);

      // Merges
      wsResumen['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
        { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },
        { s: { r: 11, c: 0 }, e: { r: 11, c: 1 } }
      ];

      wsResumen['!cols'] = [{ wch: 35 }, { wch: 25 }];

      // Título principal (A1)
      wsResumen['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" }
      };

      // Info (A2, B2)
      if (wsResumen['A2']) {
        wsResumen['A2'].s = {
          font: { italic: true, sz: 10 },
          fill: { fgColor: { rgb: "F3F4F6" } }
        };
      }
      if (wsResumen['B2']) {
        wsResumen['B2'].s = {
          font: { italic: true, sz: 10 },
          fill: { fgColor: { rgb: "F3F4F6" } }
        };
      }

      // Subtítulos (A4, A7, A12)
      if (wsResumen['A4']) {
        wsResumen['A4'].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "6366F1" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      if (wsResumen['A7']) {
        wsResumen['A7'].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "6366F1" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
      if (wsResumen['A12']) {
        wsResumen['A12'].s = {
          font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "6366F1" } },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // Total pagado (B5)
      if (wsResumen['B5']) {
        wsResumen['B5'].s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "EF4444" } },
          alignment: { horizontal: "right", vertical: "center" }
        };
      }

      // Labels importantes (A5, A8, A9, A10, A13, A14)
      ['A5', 'A8', 'A9', 'A10', 'A13', 'A14'].forEach(cell => {
        if (wsResumen[cell]) {
          wsResumen[cell].s = {
            font: { bold: true, sz: 11 },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
      });

      // Montos (B8, B9, B10)
      ['B8', 'B9', 'B10'].forEach(cell => {
        if (wsResumen[cell]) {
          wsResumen[cell].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "FEF3C7" } },
            alignment: { horizontal: "right", vertical: "center" }
          };
        }
      });

      // Estadísticas (B13, B14)
      ['B13', 'B14'].forEach(cell => {
        if (wsResumen[cell]) {
          wsResumen[cell].s = {
            font: { bold: true, sz: 11 },
            fill: { fgColor: { rgb: "DBEAFE" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      });

      // Agregar hojas al libro
      XLSX.utils.book_append_sheet(wb, wsPagos, 'Historial de Pagos');
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Generar nombre de archivo
      const fechaActual = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
      const nombreArchivo = `Historial_Pagos_${filtros.anio}_${fechaActual}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      setSnackbar({ open: true, message: '✓ Excel exportado exitosamente con diseño profesional', severity: 'success' });
    } catch (error) {
      console.error('Error al exportar:', error);
      setSnackbar({ open: true, message: 'Error al exportar el archivo', severity: 'error' });
    }
  };

  const pagosFiltrados = pagos.filter(pago => {
    const nombreCompleto = `${pago.empleado?.nombres || ''} ${pago.empleado?.apellidos || ''}`.toLowerCase();
    const cargo = (pago.empleado?.cargo || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return nombreCompleto.includes(search) || cargo.includes(search);
  });

  const totalPagado = pagosFiltrados.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);

  const pagosSueldo = pagosFiltrados.filter(p => p.tipo === 'sueldo');
  const pagosSueldoConGratificacion = pagosFiltrados.filter(p => p.tipo === 'sueldo_con_gratificacion');

  const totalSueldos = pagosSueldo.reduce((sum, p) => sum + parseFloat(p.monto), 0);
  const totalSueldosConGratificacion = pagosSueldoConGratificacion.reduce((sum, p) => sum + parseFloat(p.monto), 0);

  const totalGratificaciones = pagosSueldoConGratificacion.reduce((sum, p) =>
    sum + parseFloat(p.montoGratificacion || 0), 0
  );

  const getTipoBadge = (tipo) => {
    const badges = {
      'sueldo': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Sueldo Regular' },
      'sueldo_con_gratificacion': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Sueldo + Gratificación' }
    };
    return badges[tipo] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: tipo };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 lg:pt-12">
        
        {snackbar.open && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-4 rounded-xl shadow-lg border transform transition-all duration-300 ${
            snackbar.severity === 'success' ? 'bg-white border-green-200' :
            snackbar.severity === 'error' ? 'bg-white border-red-200' :
            'bg-white border-blue-200'
          } flex items-center gap-3 max-w-md`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              snackbar.severity === 'success' ? 'bg-green-50' :
              snackbar.severity === 'error' ? 'bg-red-50' :
              'bg-blue-50'
            }`}>
              {snackbar.severity === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : snackbar.severity === 'error' ? (
                <X className="w-5 h-5 text-red-600" />
              ) : (
                <Info className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <span className="text-sm text-gray-700 flex-1">{snackbar.message}</span>
            <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Historial de Pagos</h1>
              <p className="text-gray-600">Registro completo de sueldos y gratificaciones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Pago</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
              >
                <option value="todos">Todos los tipos</option>
                <option value="sueldo">Sueldo Regular</option>
                <option value="sueldo_con_gratificacion">Sueldo + Gratificación</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mes</label>
              <select
                value={filtros.mes}
                onChange={(e) => setFiltros({...filtros, mes: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1FA2] focus:border-transparent transition-all"
              >
                <option value="todos">Todos los meses</option>
                {meses.map(mes => (
                  <option key={mes.valor} value={mes.valor} className="capitalize">{mes.valor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Año</label>
              <select
                value={filtros.anio}
                onChange={(e) => setFiltros({...filtros, anio: parseInt(e.target.value)})}
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
                onClick={exportarExcel}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A3C644] to-[#8FB933] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Total de Pagos</span>
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{pagosFiltrados.length}</div>
            <div className="text-xs text-gray-500 mt-1">Registros totales</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Total Pagado</span>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">S/ {totalPagado.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
            <div className="text-xs text-gray-500 mt-1">Todos los conceptos</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-600">Gratificaciones</span>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">S/ {totalGratificaciones.toLocaleString('es-PE', {minimumFractionDigits: 2})}</div>
            <div className="text-xs text-gray-500 mt-1">{pagosSueldoConGratificacion.length} pagos jul/dic</div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#7B1FA2] mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Cargando historial...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Periodo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de Pago</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagosFiltrados.map((pago) => {
                    const badge = getTipoBadge(pago.tipo);
                    
                    // Parsear fecha correctamente sin cambio de timezone
                    const [year, month, day] = pago.fechaPago.split('-').map(Number);
                    const fechaLocal = new Date(year, month - 1, day);
                    
                    return (
                      <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {pago.empleado?.nombres?.[0] || 'E'}{pago.empleado?.apellidos?.[0] || 'E'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {pago.empleado?.nombres} {pago.empleado?.apellidos}
                              </div>
                              <div className="text-xs text-gray-500">{pago.empleado?.cargo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-semibold capitalize">
                            {pago.mes || '-'}
                          </div>
                          <div className="text-xs text-gray-500">{pago.anio}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-[#A3C644]">
                            S/ {parseFloat(pago.monto).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                          </div>
                          {pago.tipo === 'sueldo_con_gratificacion' && (
                            <div className="text-xs text-gray-500 mt-2 space-y-1 bg-purple-50 rounded-lg p-2 border border-purple-100">
                              <div className="flex justify-between gap-2">
                                <span>Base:</span>
                                <span className="font-semibold text-gray-700">S/ {parseFloat(pago.montoSueldo || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span>Gratif.:</span>
                                <span className="font-semibold text-[#7B1FA2]">S/ {parseFloat(pago.montoGratificacion || 0).toLocaleString('es-PE', {minimumFractionDigits: 2})}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {fechaLocal.toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pago.registradoPor || 'Sistema'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagosFiltrados.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No se encontraron pagos con los filtros seleccionados</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Información sobre los Tipos de Pago</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="font-bold text-blue-900 text-sm">Sueldo Regular</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pago mensual estándar sin gratificación adicional. Se aplica en 10 meses del año.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                    <span className="font-bold text-purple-900 text-sm">Sueldo + Gratificación</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Un solo pago que incluye sueldo base + 25% de gratificación. Solo en Julio y Diciembre.
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#A3C644] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#7B1FA2] mb-2">Importante para Balance Contable:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Los registros están ordenados por <strong>fecha de creación más reciente primero</strong>. 
                      En Julio y Diciembre se registra UN SOLO PAGO por el monto total, con el desglose 
                      detallado visible en la tabla para facilitar tu control contable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}