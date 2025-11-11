import api from './api';

export const getTiposDocumento = async () => {
  const response = await api.get('/tipos-archivo');
  return response.data;
};