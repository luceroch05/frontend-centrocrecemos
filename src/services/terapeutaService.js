import api from './api';

export const asignarTerapeuta = async ({ paciente_servicio_id, terapeuta_id, user_id_actua }) => {
  const response = await api.post('/asignacion-terapeuta/asignar', {
    paciente_servicio_id,
    terapeuta_id,
    user_id_actua
  });
  return response.data;
}; 