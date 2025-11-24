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

// Obtener todos los pagos con filtros opcionales
export const getPagos = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.periodo) params.append('periodo', filters.periodo);
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
