import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  Cog6ToothIcon,
  DocumentPlusIcon
} from '@heroicons/react/24/outline';
import { calcularGratificaciones, getEmpleados, registrarPagoMensual } from '../../services/rrhhService';
import { crearTrabajador, updateTrabajador, getTrabajadorById } from '../../services/trabajadorService';
import api from '../../services/api';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactivos, setShowInactivos] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [empleadoParaPago, setEmpleadoParaPago] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empleadoParaEliminar, setEmpleadoParaEliminar] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('');
  const [pagoData, setPagoData] = useState({
    mes: new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase(),
    anio: new Date().getFullYear(),
    fechaPago: new Date().toISOString().split('T')[0]
  });
  const [formData, setFormData] = useState({
    sueldo_base: '',
    fecha_ingreso: '',
    numero_cuenta: '',
    banco: ''
  });

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const data = await getEmpleados();
      setEmpleados(data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessAlert = (title, message) => {
    setSuccessTitle(title);
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Solo actualizar datos de RRHH
      await updateTrabajador(editingEmpleado.id, formData);
      showSuccessAlert(
        '✓ Éxito',
        `Configuración financiera actualizada exitosamente para ${editingEmpleado.nombres} ${editingEmpleado.apellidos}`
      );
      cargarEmpleados();
      handleCloseModal();
    } catch (error) {
      console.error('Error al actualizar datos de RRHH:', error);
      alert('Error al actualizar la configuración financiera. Por favor, intente nuevamente.');
    }
  };

  const handleDelete = (empleado) => {
    setEmpleadoParaEliminar(empleado);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEmpleadoParaEliminar(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/trabajadores/${empleadoParaEliminar.id}`);
      showSuccessAlert(
        '✓ Eliminado',
        'Empleado eliminado exitosamente'
      );
      handleCloseDeleteModal();
      cargarEmpleados();
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      alert('Error al eliminar el empleado. Por favor, intente nuevamente.');
    }
  };

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      sueldo_base: empleado.sueldo_base || '',
      fecha_ingreso: empleado.fecha_ingreso || '',
      numero_cuenta: empleado.numero_cuenta || '',
      banco: empleado.banco || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmpleado(null);
    setFormData({
      sueldo_base: '',
      fecha_ingreso: '',
      numero_cuenta: '',
      banco: ''
    });
  };

  const handleOpenPagoModal = (empleado) => {
    setEmpleadoParaPago(empleado);
    setPagoData({
      mes: new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase(),
      anio: new Date().getFullYear(),
      fechaPago: new Date().toISOString().split('T')[0]
    });
    setShowPagoModal(true);
  };

  const handleClosePagoModal = () => {
    setShowPagoModal(false);
    setEmpleadoParaPago(null);
  };

  const handleRegistrarPago = async (e) => {
    e.preventDefault();
    try {
      await registrarPagoMensual({
        empleadoId: empleadoParaPago.id,
        mes: pagoData.mes,
        anio: pagoData.anio,
        monto: empleadoParaPago.sueldo_base,
        fechaPago: pagoData.fechaPago
      });
      const mesCapitalizado = pagoData.mes.charAt(0).toUpperCase() + pagoData.mes.slice(1);
      const mensaje = `Empleado: ${empleadoParaPago.nombres} ${empleadoParaPago.apellidos}\nMes: ${mesCapitalizado} ${pagoData.anio}\nMonto: S/ ${Number(empleadoParaPago.sueldo_base).toLocaleString('es-PE', {minimumFractionDigits: 2})}\nFecha de pago: ${new Date(pagoData.fechaPago).toLocaleDateString('es-PE')}`;
      showSuccessAlert('✓ Pago Registrado', mensaje);
      handleClosePagoModal();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert(error.response?.data?.message || 'Error al registrar el pago mensual. Por favor, intente nuevamente.');
    }
  };

  const empleadosFiltrados = empleados.filter(emp => {
    // Filtro por estado (activo/inactivo)
    const cumpleEstado = showInactivos ? true : emp.estado === true;

    // Filtro por búsqueda
    const cumpleBusqueda =
      (emp.nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.cargo || '').toLowerCase().includes(searchTerm.toLowerCase());

    return cumpleEstado && cumpleBusqueda;
  });

const calcularCostoAnual = (sueldo_base) => {
  const sueldoAnual = sueldo_base * 12;           // 12 meses
  const gratificaciones = sueldo_base * 0.25 ; // 25% julio + 25% diciembre
  return sueldoAnual + (gratificaciones * 2);
};

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empleados</h1>
        <p className="text-gray-600">Administra la información financiera de tu personal</p>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Nota:</span> Los empleados se crean desde el módulo de Usuarios.
              Aquí solo asignas datos financieros (sueldo, banco, cuenta).
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cargo o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        {/* Toggle para mostrar inactivos */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${showInactivos ? 'bg-amber-100' : 'bg-green-100'}`}>
              <UserIcon className={`w-6 h-6 ${showInactivos ? 'text-amber-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {showInactivos ? 'Mostrando todos los empleados' : 'Mostrando solo empleados activos'}
              </p>
              <p className="text-xs text-gray-500">
                {showInactivos
                  ? 'Incluye empleados retirados para liquidaciones finales'
                  : 'Activa para ver empleados inactivos'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInactivos(!showInactivos)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showInactivos ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showInactivos ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {!loading && empleados.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
                <p className="text-sm text-gray-500">Total Empleados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{empleados.filter(e => e.estado === true).length}</p>
                <p className="text-sm text-gray-500">Activos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <XMarkIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{empleados.filter(e => e.estado === false).length}</p>
                <p className="text-sm text-gray-500">Inactivos</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Cargando empleados...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sueldo Mensual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Anual</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empleadosFiltrados.map((empleado) => (
                  <tr
                    key={empleado.id}
                    className={`transition-colors ${
                      empleado.estado === false
                        ? 'bg-amber-50 hover:bg-amber-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {empleado.nombres} {empleado.apellidos}
                          </div>
                          <div className="text-sm text-gray-500">{empleado.numeroDocumento}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{empleado.cargo || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        S/ {empleado.sueldo_base ? Number(empleado.sueldo_base).toLocaleString() : '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600">
                        S/ {calcularCostoAnual(empleado.sueldo_base).toLocaleString('es-PE', {minimumFractionDigits: 0})}
                      </div>
                      <div className="text-xs text-gray-500">
                        Incluye beneficios
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empleado.fecha_ingreso ? new Date(empleado.fecha_ingreso).toLocaleDateString('es-PE') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        empleado.estado === true
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {empleado.estado === true ? '✓ Activo' : '⊘ Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(empleado)}
                          className="group relative p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all hover:shadow-sm"
                          title="Configurar datos financieros"
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Configurar
                          </span>
                        </button>
                        <button
                          onClick={() => handleOpenPagoModal(empleado)}
                          className="group relative p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:shadow-sm"
                          title="Registrar pago mensual"
                        >
                          <BanknotesIcon className="w-5 h-5" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Registrar Pago
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(empleado)}
                          className="group relative p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:shadow-sm"
                          title="Eliminar empleado"
                        >
                          <TrashIcon className="w-5 h-5" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Eliminar
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {empleadosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron empleados</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Registro de Pago */}
      {showPagoModal && empleadoParaPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Registrar Pago Mensual</h2>
                  <p className="text-sm text-green-100">Sueldo regular sin gratificación</p>
                </div>
              </div>
              <button
                onClick={handleClosePagoModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Info del Empleado */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Empleado</label>
                    <p className="font-semibold text-gray-900">{empleadoParaPago.nombres} {empleadoParaPago.apellidos}</p>
                  </div>
                  <div className="text-right">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Sueldo Base</label>
                    <p className="text-2xl font-bold text-green-600">
                      S/ {Number(empleadoParaPago.sueldo_base).toLocaleString('es-PE', {minimumFractionDigits: 2})}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegistrarPago}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      Mes de Pago
                    </label>
                    <select
                      value={pagoData.mes}
                      onChange={(e) => setPagoData({...pagoData, mes: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent capitalize"
                      required
                    >
                      <option value="enero">Enero</option>
                      <option value="febrero">Febrero</option>
                      <option value="marzo">Marzo</option>
                      <option value="abril">Abril</option>
                      <option value="mayo">Mayo</option>
                      <option value="junio">Junio</option>
                      <option value="julio">Julio</option>
                      <option value="agosto">Agosto</option>
                      <option value="septiembre">Septiembre</option>
                      <option value="octubre">Octubre</option>
                      <option value="noviembre">Noviembre</option>
                      <option value="diciembre">Diciembre</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                      <select
                        value={pagoData.anio}
                        onChange={(e) => setPagoData({...pagoData, anio: parseInt(e.target.value)})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      >
                        {[...Array(5)].map((_, i) => {
                          const year = new Date().getFullYear() - 2 + i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Pago</label>
                      <input
                        type="date"
                        value={pagoData.fechaPago}
                        onChange={(e) => setPagoData({...pagoData, fechaPago: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  {/* Advertencia para empleados inactivos */}
                  {empleadoParaPago.estado === false && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-900 font-medium mb-1">⚠️ Empleado Inactivo</p>
                          <p className="text-sm text-red-800">
                            Este empleado está marcado como inactivo. Este pago probablemente es para
                            liquidación final, vacaciones truncas, o pagos pendientes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nota Informativa */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <InformationCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-900 font-medium mb-1">Pago Regular</p>
                        <p className="text-sm text-amber-800">
                          Este pago se registrará como sueldo mensual regular. Para meses con gratificación
                          (julio/diciembre), usa el módulo de Gratificaciones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleClosePagoModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Registrar Pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-white">{successTitle}</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-center whitespace-pre-line mb-6">
                {successMessage}
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Datos Financieros */}
      {showModal && editingEmpleado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Cog6ToothIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Configuración Financiera</h2>
                  <p className="text-sm text-purple-100">Datos de nómina y pagos</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Información del Empleado - Solo Lectura */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Información del Empleado</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Nombre Completo</label>
                    <p className="font-medium text-gray-900">{editingEmpleado.nombres} {editingEmpleado.apellidos}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">DNI</label>
                    <p className="font-medium text-gray-900">{editingEmpleado.dni || editingEmpleado.numeroDocumento || 'No registrado'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Cargo</label>
                    <p className="font-medium text-gray-900">
                      {typeof editingEmpleado.cargo === 'object'
                        ? editingEmpleado.cargo?.nombre || 'No asignado'
                        : editingEmpleado.cargo || 'No asignado'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Especialidad</label>
                    <p className="font-medium text-gray-900">
                      {typeof editingEmpleado.especialidad === 'object'
                        ? editingEmpleado.especialidad?.nombre || 'No asignada'
                        : editingEmpleado.especialidad || 'No asignada'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulario de Datos Financieros */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCardIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Datos Financieros</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <BanknotesIcon className="w-4 h-4 text-gray-500" />
                        Sueldo Base Mensual (S/)
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        placeholder="1200.00"
                        value={formData.sueldo_base}
                        onChange={(e) => setFormData({...formData, sueldo_base: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        Fecha de Ingreso
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.fecha_ingreso}
                        onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <BuildingLibraryIcon className="w-4 h-4 text-gray-500" />
                        Banco
                      </label>
                      <select
                        value={formData.banco}
                        onChange={(e) => setFormData({...formData, banco: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar banco...</option>
                        <option value="BCP">BCP - Banco de Crédito del Perú</option>
                        <option value="BBVA">BBVA</option>
                        <option value="INTERBANK">Interbank</option>
                        <option value="SCOTIABANK">Scotiabank</option>
                        <option value="BANBIF">BanBif</option>
                        <option value="PICHINCHA">Banco Pichincha</option>
                        <option value="CAJA HUANCAYO">Caja Huancayo</option>
                        <option value="MI BANCO">Mi Banco</option>
                        <option value="OTROS">Otros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <CreditCardIcon className="w-4 h-4 text-gray-500" />
                        Número de Cuenta
                      </label>
                      <input
                        type="text"
                        placeholder="19123456789"
                        value={formData.numero_cuenta}
                        onChange={(e) => setFormData({...formData, numero_cuenta: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Nota Informativa */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">Información importante</p>
                      <p className="text-sm text-blue-800">
                        El sueldo base y la fecha de ingreso son necesarios para el cálculo de gratificaciones
                        (julio y diciembre). Los datos bancarios se utilizarán para registrar los pagos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Guardar Configuración
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {showDeleteModal && empleadoParaEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <TrashIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirmar Eliminación</h2>
                  <p className="text-sm text-red-100">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Info del Empleado */}
              <div className="bg-red-50 rounded-xl p-4 mb-6 border-2 border-red-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-7 h-7 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium mb-1">Empleado a eliminar:</p>
                    <p className="text-lg font-bold text-gray-900">
                      {empleadoParaEliminar.nombres} {empleadoParaEliminar.apellidos}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      DNI: {empleadoParaEliminar.numeroDocumento || 'No registrado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cargo: {empleadoParaEliminar.cargo || 'No asignado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Advertencia */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Advertencia Importante</p>
                    <p className="text-sm text-amber-800 mb-2">
                      Al eliminar este empleado, también se eliminarán:
                    </p>
                    <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                      <li>Todo el historial de pagos</li>
                      <li>Datos financieros y bancarios</li>
                      <li>Registros de gratificaciones</li>
                      <li>Todos los registros asociados</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-5 h-5" />
                  Eliminar Definitivamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}