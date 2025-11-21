// ============================================
// src/services/archivosOficialesService.js
// ============================================
import api from './api';

const API_PATH = '/archivos-oficiales';

const archivosOficialesService = {
  /**
   * Subir archivo oficial
   * @param {File} file - Archivo a subir
   * @param {Object} data - Datos del archivo
   */
 subirArchivo: async (file, data) => {
  try {
    const formData = new FormData();
    formData.append('archivo', file);
    
    // ✅ SOLO AGREGAR SI TIENE VALOR (no undefined, no "", no null)
    if (data.pacienteId) {
      formData.append('pacienteId', data.pacienteId);
    }
    
    if (data.trabajadorId) {
      formData.append('trabajadorId', data.trabajadorId);
    }
    
    // Campos obligatorios
    formData.append('terapeutaId', data.terapeutaId);
    formData.append('tipoArchivoId', data.tipoArchivoId);
    formData.append('fechaEmision', data.fechaEmision);
    
    // Campos opcionales
    if (data.fechaVigencia) {
      formData.append('fechaVigencia', data.fechaVigencia);
    }
    
    if (data.descripcion) {
      formData.append('descripcion', data.descripcion);
    }
    
    if (data.codigoManual) {
      formData.append('codigoManual', data.codigoManual);
    }

    const response = await api.post(`${API_PATH}/subir`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

  /**
   * Listar archivos oficiales
   * @param {number} pacienteId - ID del paciente (opcional)
   */
  listarArchivos: async (pacienteId = null) => {
    try {
      const params = pacienteId ? { pacienteId } : {};
      const response = await api.get(API_PATH, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Descargar archivo
   * @param {number} id - ID del archivo
   */
  descargarArchivo: async (id) => {
    try {
      const response = await api.get(`${API_PATH}/${id}/descargar`, {
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = 'archivo_descargado';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Error al descargar:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Visualizar archivo en nueva pestaña
   * @param {number} id - ID del archivo
   */
  visualizarArchivo: (id) => {
    const token = localStorage.getItem('access_token');
    const baseURL = api.defaults.baseURL || '';
    window.open(`${baseURL}${API_PATH}/${id}/descargar`, '_blank');
  },

  /**
   * Eliminar archivo (soft delete)
   * @param {number} id - ID del archivo
   */
  eliminarArchivo: async (id) => {
    try {
      const response = await api.delete(`${API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validar documento (público - sin autenticación)
   * @param {string} codigo - Código de validación
   */
  validarDocumento: async (codigo) => {
    try {
      const response = await api.post(`${API_PATH}/validar`, { 
        codigo: codigo.toUpperCase() 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Validar documento por URL (público)
   * @param {string} codigo - Código de validación
   */
  validarDocumentoPorUrl: async (codigo) => {
    try {
      const response = await api.get(`${API_PATH}/validar/${codigo.toUpperCase()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Generar código de validación preview
   */
  generarCodigoPreview: async () => {
    try {
      const response = await api.get(`${API_PATH}/generar-codigo`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default archivosOficialesService;