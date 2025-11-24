import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getEmpleados } from '../../services/rrhhService';
import { crearTrabajador, updateTrabajador, getTrabajadorById } from '../../services/trabajadorService';
import api from '../../services/api';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cargo: '',
    sueldo_base: '',
    fecha_ingreso: '',
    numero_cuenta: '',
    banco: '',
    dni: '',
    estado: true
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmpleado) {
        await updateTrabajador(editingEmpleado.id, formData);
      } else {
        await crearTrabajador(formData);
      }

      cargarEmpleados();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      alert('Error al guardar empleado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
      await api.delete(`/trabajadores/${id}`);
      cargarEmpleados();
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      alert('Error al eliminar empleado');
    }
  };

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombres: empleado.nombres || '',
      apellidos: empleado.apellidos || '',
      cargo: empleado.cargo || '',
      sueldo_base: empleado.sueldo_base || '',
      fecha_ingreso: empleado.fecha_ingreso || '',
      numero_cuenta: empleado.numero_cuenta || '',
      banco: empleado.banco || '',
      dni: empleado.dni || '',
      estado: empleado.estado
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmpleado(null);
    setFormData({
      nombres: '',
      apellidos: '',
      cargo: '',
      sueldo_base: '',
      fecha_ingreso: '',
      numero_cuenta: '',
      banco: '',
      dni: '',
      estado: true
    });
  };

  const empleadosFiltrados = empleados.filter(emp =>
    (emp.nombres || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.apellidos || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular costo total anual por empleado
  const calcularCostoAnual = (sueldo_base) => {
    if (!sueldo_base) return 0;
    const sueldoMensual = Number(sueldo_base);
    const sueldoAnual = sueldoMensual * 12;
    const gratificaciones = sueldoMensual * 2; // Julio y Diciembre
    const cts = sueldoMensual * 2; // CTS (aproximado)
    const essalud = sueldoAnual * 0.09; // 9% de EsSalud
    return sueldoAnual + gratificaciones + cts + essalud;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Empleados</h1>
        <p className="text-gray-600">Administra la información de tus empleados</p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Empleado
        </button>
      </div>

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
                  <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        empleado.estado === true
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empleado.estado === true ? 'activo' : 'inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(empleado)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(empleado.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                    <input
                      type="text"
                      required
                      value={formData.nombres}
                      onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      required
                      value={formData.apellidos}
                      onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                    <input
                      type="text"
                      required
                      value={formData.cargo}
                      onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sueldo Base (S/)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.sueldo_base}
                      onChange={(e) => setFormData({...formData, sueldo_base: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_ingreso}
                      onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                    <input
                      type="text"
                      required
                      value={formData.dni}
                      onChange={(e) => setFormData({...formData, dni: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                    <input
                      type="text"
                      value={formData.banco}
                      onChange={(e) => setFormData({...formData, banco: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Cuenta</label>
                    <input
                      type="text"
                      value={formData.numero_cuenta}
                      onChange={(e) => setFormData({...formData, numero_cuenta: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingEmpleado ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
