import api from './api';

/**
 * Servicio para gestionar las alertas del sistema
 * Solo accesible para usuarios con rol ADMINISTRADOR
 */

/**
 * Obtiene alertas con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @param {boolean} filtros.leida - Filtrar por estado leída
 * @param {boolean} filtros.resuelta - Filtrar por estado resuelta
 * @param {string} filtros.severidad - Filtrar por severidad (BAJA, MEDIA, ALTA, CRITICA)
 * @param {string} filtros.tipo - Filtrar por tipo de alerta
 * @param {number} filtros.page - Página actual
 * @param {number} filtros.limit - Registros por página
 * @returns {Promise} Alertas paginadas
 */
export const obtenerAlertas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/auditoria/alertas?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de alertas no leídas
 * @returns {Promise} { total: number }
 */
export const contarAlertasNoLeidas = async () => {
  try {
    const response = await api.get('/auditoria/alertas/contador/no-leidas');
    return response.data;
  } catch (error) {
    console.error('Error al contar alertas no leídas:', error);
    throw error;
  }
};

/**
 * Marca una alerta como leída
 * @param {number} id - ID de la alerta
 * @returns {Promise} Respuesta del servidor
 */
export const marcarAlertaLeida = async (id) => {
  try {
    const response = await api.put(`/auditoria/alertas/${id}/marcar-leida`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar alerta como leída:', error);
    throw error;
  }
};

/**
 * Marca todas las alertas como leídas
 * @returns {Promise} Respuesta del servidor
 */
export const marcarTodasAlertasLeidas = async () => {
  try {
    const response = await api.put('/auditoria/alertas/marcar-todas-leidas');
    return response.data;
  } catch (error) {
    console.error('Error al marcar todas las alertas como leídas:', error);
    throw error;
  }
};

/**
 * Marca una alerta como resuelta
 * @param {number} id - ID de la alerta
 * @param {string} comentarios - Comentarios de resolución (opcional)
 * @returns {Promise} Respuesta del servidor
 */
export const resolverAlerta = async (id, comentarios = '') => {
  try {
    const response = await api.put(`/auditoria/alertas/${id}/resolver`, {
      comentarios,
    });
    return response.data;
  } catch (error) {
    console.error('Error al resolver alerta:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de alertas
 * @returns {Promise} Estadísticas de alertas
 */
export const obtenerEstadisticasAlertas = async () => {
  try {
    const response = await api.get('/auditoria/alertas/estadisticas');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de alertas:', error);
    throw error;
  }
};

/**
 * Obtiene alertas no leídas (para el badge del navbar)
 * @param {number} limit - Límite de alertas a obtener
 * @returns {Promise} Alertas no leídas
 */
export const obtenerAlertasNoLeidas = async (limit = 5) => {
  try {
    const response = await api.get(`/auditoria/alertas?leida=false&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas no leídas:', error);
    throw error;
  }
};

/**
 * Hook personalizado para polling de alertas
 * Útil para actualizar el badge del navbar en tiempo real
 */
export const iniciarPollingAlertas = (callback, intervalo = 30000) => {
  const interval = setInterval(async () => {
    try {
      const { total } = await contarAlertasNoLeidas();
      callback(total);
    } catch (error) {
      console.error('Error en polling de alertas:', error);
    }
  }, intervalo);

  return () => clearInterval(interval);
};

export default {
  obtenerAlertas,
  contarAlertasNoLeidas,
  marcarAlertaLeida,
  marcarTodasAlertasLeidas,
  resolverAlerta,
  obtenerEstadisticasAlertas,
  obtenerAlertasNoLeidas,
  iniciarPollingAlertas,
};
