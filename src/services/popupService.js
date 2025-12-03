import api from './api';

/**
 * Obtener la configuración actual del popup
 */
export const obtenerConfiguracionPopup = async () => {
  try {
    const response = await api.get('/popup/configuracion');
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración del popup:', error);
    throw error;
  }
};

// Asume que tienes el userId guardado (localStorage, context, etc.)
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.id;
};

export const subirImagenPopup = async (archivo) => {
  try {
    const formData = new FormData();
    formData.append('imagen', archivo);
    formData.append('userId', getUserId()); // ✅ Enviamos userId

    const response = await api.post('/popup/imagen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error al subir imagen del popup:', error);
    throw error;
  }
};

export const actualizarConfiguracionPopup = async (configuracion) => {
  try {
    const response = await api.put('/popup/configuracion', {
      ...configuracion,
      userId: getUserId() // ✅ Enviamos userId
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar configuración del popup:', error);
    throw error;
  }
};
/**
 * Eliminar imagen del popup
 */
export const eliminarImagenPopup = async () => {
  try {
    const response = await api.delete('/popup/imagen');
    return response.data;
  } catch (error) {
    console.error('Error al eliminar imagen del popup:', error);
    throw error;
  }
};
