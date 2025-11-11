import api from './api';

export const guardarReporteEvolucion = async (reporteData) => {
  try {
    const response = await api.post('/historia-clinica/reporte-evolucion', reporteData);
    return response.data;
  } catch (error) {
    console.error('Error al guardar reporte de evolución:', error);
    throw error;
  }
};

export const actualizarReporteEvolucion = async (reporteId, reporteData) => {
  try {
    const response = await api.put(`/historia-clinica/reporte-evolucion/${reporteId}`, reporteData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar reporte de evolución:', error);
    throw error;
  }
};

export const obtenerReporteEvolucion = async (pacienteId) => {
  try {
    const response = await api.get(`/historia-clinica/paciente/${pacienteId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener reporte de evolución:', error);
    throw error;
  }};
  // ==================== EVALUACIONES DE TERAPIA OCUPACIONAL ====================
export const guardarEvaluacionTerapia = async (evaluacionData) => {
  try {
    const response = await api.post('/historia-clinica/evaluacion-terapia', evaluacionData);
    console.log('Respuesta al guardar evaluación de terapia:', response);
    return response.data;
  } catch (error) {
    console.error('Error al guardar evaluación de terapia:', error);
    throw error;
  }
};

export const obtenerEvaluacionesTerapia = async (pacienteId) => {
  try {
    const response = await api.get(`/historia-clinica/paciente/${pacienteId}/evaluaciones-terapia`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener evaluaciones de terapia:', error);
    throw error;
  }
};

export const obtenerEvaluacionTerapiaPorId = async (evaluacionId) => {
  try {
    const response = await api.get(`/historia-clinica/evaluacion-terapia/${evaluacionId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener evaluación de terapia:', error);
    throw error;
  }
};

export const actualizarEvaluacionTerapia = async (evaluacionId, evaluacionData) => {
  try {
    const response = await api.put(`/historia-clinica/evaluacion-terapia/${evaluacionId}`, evaluacionData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar evaluación de terapia:', error);
    throw error;
  }

};
