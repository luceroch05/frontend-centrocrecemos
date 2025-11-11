import api from './api';

export const getCargosPostulacion = async () => {
  const response = await api.get('/cargos-postulacion');
  return response.data;
};
