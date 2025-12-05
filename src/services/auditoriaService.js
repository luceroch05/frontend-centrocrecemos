import api from './api';

/**
 * Servicio para gestionar la auditoría del sistema
 * Solo accesible para usuarios con rol ADMINISTRADOR
 */

/**
 * Obtiene el historial de auditoría con filtros
 * @param {Object} filtros - Filtros de búsqueda
 * @param {number} filtros.trabajadorId - ID del trabajador
 * @param {string} filtros.modulo - Módulo del sistema
 * @param {string} filtros.accion - Acción realizada
 * @param {string} filtros.fechaInicio - Fecha de inicio (ISO string)
 * @param {string} filtros.fechaFin - Fecha de fin (ISO string)
 * @param {string} filtros.busqueda - Búsqueda general
 * @param {number} filtros.page - Página actual
 * @param {number} filtros.limit - Registros por página
 * @returns {Promise} Historial de auditoría paginado
 */
export const obtenerHistorial = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
        params.append(key, filtros[key]);
      }
    });

    const response = await api.get(`/auditoria/historial?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de auditoría:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de auditoría
 * @param {string} fechaInicio - Fecha de inicio (opcional)
 * @param {string} fechaFin - Fecha de fin (opcional)
 * @returns {Promise} Estadísticas de auditoría
 */
export const obtenerEstadisticas = async (fechaInicio = null, fechaFin = null) => {
  try {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);

    const response = await api.get(`/auditoria/estadisticas?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de auditoría:', error);
    throw error;
  }
};

/**
 * Obtiene la actividad reciente de un usuario
 * @param {number} trabajadorId - ID del trabajador
 * @param {number} limite - Número de registros a obtener (default: 20)
 * @returns {Promise} Actividad del usuario
 */
export const obtenerActividadUsuario = async (trabajadorId, limite = 20) => {
  try {
    const response = await api.get(`/auditoria/actividad-usuario/${trabajadorId}?limite=${limite}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad de usuario:', error);
    throw error;
  }
};

/**
 * Obtiene las últimas acciones del sistema
 * @param {number} limite - Número de registros a obtener (default: 10)
 * @returns {Promise} Últimas acciones
 */
export const obtenerUltimasAcciones = async (limite = 10) => {
  try {
    const response = await api.get(`/auditoria/ultimas-acciones?limite=${limite}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener últimas acciones:', error);
    throw error;
  }
};

/**
 * Exporta el historial de auditoría a Excel
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Blob} Archivo Excel
 */
export const exportarHistorial = async (filtros = {}) => {
  try {
    const datos = await obtenerHistorial({ ...filtros, limit: 10000 });

    // Aquí puedes usar una librería como xlsx-js-style para generar el Excel
    // Por ahora retornamos los datos
    return datos;
  } catch (error) {
    console.error('Error al exportar historial:', error);
    throw error;
  }
};

export default {
  obtenerHistorial,
  obtenerEstadisticas,
  obtenerActividadUsuario,
  obtenerUltimasAcciones,
  exportarHistorial,
};
