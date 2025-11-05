import api from './api';

export const listarCitas = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Agregar parámetros si existen
  if (params.terapeuta_id) {
    queryParams.append('terapeuta_id', params.terapeuta_id);
  }
  
  const url = queryParams.toString() ? `/citas?${queryParams.toString()}` : '/citas';
  const response = await api.get(url);
  return response.data;
};

export const crearMultiplesCitas = async (citasData) => {
  const response = await api.post('/citas', citasData);
  return response.data;
};

export const actualizarCita = async (id, citaData) => {
  const response = await api.patch(`/citas/${id}`, citaData);
  return response.data;
};

export const eliminarCita = async (id, userId) => {
  const response = await api.delete(`/citas/${id}`, {
    data: { user_id: userId }
  });
  return response.data;
};

export const getCitaById = async (id) => {
  const response = await api.get(`/citas/${id}`);
  return response.data;
};

export const getHistorialCita = async (id) => {
  const response = await api.get(`/citas/${id}/historial`);
  return response.data;
};

