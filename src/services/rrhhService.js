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