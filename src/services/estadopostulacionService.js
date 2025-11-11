import api from './api';

export const getEstadosPostulacion = async () => {
  const response = await api.get('/estado_postulacion');
  return response.data;
};
