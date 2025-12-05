import axios from 'axios';
import { API_BASE_URL } from './api';
import { getTrabajadores } from './trabajadorService';

// Obtener token del localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener todos los trabajadores (reutilizando el servicio existente)
export const getEmpleados = getTrabajadores;

// ========== GRATIFICACIONES ==========

// Calcular gratificaciones para todos los empleados
export const calcularGratificaciones = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/pagos/calcular-gratificaciones`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Registrar una gratificación específica
export const registrarGratificacion = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/pagos/registrar-gratificacion`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========== PAGOS GENERALES ==========

// Obtener todos los pagos con filtros opcionales
export const getPagos = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.mes) params.append('periodo', filters.mes);
  if (filters.anio) params.append('anio', filters.anio);

  const response = await axios.get(`${API_BASE_URL}/pagos?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Obtener un pago específico
export const getPagoById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/pagos/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Crear un nuevo pago
export const createPago = async (data) => {
  const response = await axios.post(`${API_BASE_URL}/pagos`, data, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Eliminar un pago
export const deletePago = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/pagos/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// ========== PAGOS MENSUALES REGULARES ==========

// Registrar pago mensual regular (sin gratificación)
export const registrarPagoMensual = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/pagos/registrar-pago-mensual`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========== VACACIONES ==========

// Calcular vacaciones disponibles para todos los empleados
export const calcularVacaciones = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/vacaciones/calcular`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Registrar vacaciones
export const registrarVacacion = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/vacaciones`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Obtener todas las vacaciones con filtros
export const getVacaciones = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.empleadoId) params.append('empleadoId', filters.empleadoId);
  if (filters.anio) params.append('anio', filters.anio);

  const response = await axios.get(
    `${API_BASE_URL}/vacaciones?${params.toString()}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Eliminar una vacación
// DESHABILITADO: No se permite eliminar vacaciones registradas
// export const deleteVacacion = async (id) => {
//   const response = await axios.delete(
//     `${API_BASE_URL}/vacaciones/${id}`,
//     { headers: getAuthHeaders() }
//   );
//   return response.data;
// };

// ========== CUENTAS BANCARIAS ==========

// Obtener cuentas bancarias de un trabajador
export const getCuentasBancarias = async (trabajadorId) => {
  const response = await axios.get(
    `${API_BASE_URL}/cuentas-bancarias/trabajador/${trabajadorId}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Crear una nueva cuenta bancaria
export const crearCuentaBancaria = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/cuentas-bancarias`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Actualizar una cuenta bancaria
export const actualizarCuentaBancaria = async (id, data) => {
  const response = await axios.put(
    `${API_BASE_URL}/cuentas-bancarias/${id}`,
    data,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Marcar cuenta como principal
export const marcarCuentaPrincipal = async (id) => {
  const response = await axios.put(
    `${API_BASE_URL}/cuentas-bancarias/${id}/marcar-principal`,
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// Eliminar una cuenta bancaria
export const eliminarCuentaBancaria = async (id) => {
  const response = await axios.delete(
    `${API_BASE_URL}/cuentas-bancarias/${id}`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

// ========== NOTIFICACIONES Y ALERTAS ==========

// Obtener vacaciones próximas (empleados próximos a cumplir primer año)
export const obtenerVacacionesProximas = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vacaciones/alertas/primer-anio`,
      { headers: getAuthHeaders() }
    );
    // Filtrar solo los que faltan 7 días o menos (una semana)
    const proximosFiltrados = (response.data || []).filter(
      emp => emp.diasHastaPrimerAnio <= 7
    );
    return proximosFiltrados;
  } catch (error) {
    console.error('Error al obtener vacaciones próximas:', error);
    return [];
  }
};