import React, { useState, useEffect } from 'react';
import {
  Image,
  Upload,
  Eye,
  Trash2,
  X,
  Check,
  AlertCircle,
  Settings,
  Save
} from 'lucide-react';
import * as popupService from '../services/popupService';
import { API_BASE_URL } from '../services/api';

const GestionPopup = () => {
  const [popupConfig, setPopupConfig] = useState({
    activo: false,
    imagenUrl: ''
  });

  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [dialogoSubir, setDialogoSubir] = useState(false);
  const [imagenTemporal, setImagenTemporal] = useState(null);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar configuración al montar
  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setCargando(true);
      const config = await popupService.obtenerConfiguracionPopup();
      setPopupConfig(config);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      showNotification('Error al cargar la configuración', 'error');
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracion = async (config) => {
    try {
      await popupService.actualizarConfiguracionPopup(config);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      throw error;
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggleActivo = async () => {
    try {
      const nuevoEstado = !popupConfig.activo;
      const nuevaConfig = {
        ...popupConfig,
        activo: nuevoEstado
      };
      setPopupConfig(nuevaConfig);
      await guardarConfiguracion(nuevaConfig);
      showNotification(nuevoEstado ? 'Popup activado' : 'Popup desactivado', 'success');
    } catch (error) {
      showNotification('Error al cambiar el estado', 'error');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size > 2 * 1024 * 1024) {
          showNotification('La imagen debe pesar menos de 2MB', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagenTemporal(reader.result);
          setArchivoImagen(file);
        };
        reader.readAsDataURL(file);
      } else {
        showNotification('Por favor seleccione un archivo de imagen válido', 'error');
      }
    }
  };

 const handleSubirImagen = async () => {
  if (archivoImagen) {
    setGuardando(true);
    try {
      // Subir imagen al servidor
      const response = await popupService.subirImagenPopup(archivoImagen);

      const nuevaConfig = {
        ...popupConfig,
        imagenUrl: response.imagenUrl
      };
      setPopupConfig(nuevaConfig);

      setDialogoSubir(false);
      setImagenTemporal(null);
      setArchivoImagen(null);
      showNotification('Imagen actualizada correctamente', 'success');
      
      // Forzar recarga de la configuración desde el servidor
      await cargarConfiguracion();
    } catch (error) {
      showNotification('Error al subir la imagen', 'error');
    } finally {
      setGuardando(false);
    }
  }
};

  const handleEliminarImagen = async () => {
    try {
      await popupService.eliminarImagenPopup();
      const nuevaConfig = {
        ...popupConfig,
        imagenUrl: ''
      };
      setPopupConfig(nuevaConfig);
      showNotification('Imagen eliminada', 'info');
    } catch (error) {
      showNotification('Error al eliminar la imagen', 'error');
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7B1FA2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pt-24">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
            notification.type === 'error'
              ? 'bg-red-500 text-white'
              : notification.type === 'info'
              ? 'bg-blue-500 text-white'
              : 'bg-green-500 text-white'
          }`}>
            {notification.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B1FA2] to-[#9C27B0] rounded-2xl flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Popup Promocional</h1>
              <p className="text-gray-600 mt-1">
                Administra la imagen promocional que se muestra al cargar la página de inicio
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuración */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-[#7B1FA2]" />
                <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
              </div>

              {/* Toggle Estado */}
              <div className="mb-6">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">Estado del Popup</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {popupConfig.activo ? '✅ Activo - Visible para usuarios' : '❌ Desactivado - Oculto'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleActivo}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      popupConfig.activo ? 'bg-[#7B1FA2]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        popupConfig.activo ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={() => setDialogoSubir(true)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Cambiar Imagen
                </button>

                <button
                  onClick={() => setVistaPrevia(true)}
                  disabled={!popupConfig.imagenUrl}
                  className="w-full px-4 py-3 border-2 border-[#7B1FA2] text-[#7B1FA2] rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-5 h-5" />
                  Vista Previa
                </button>

                {popupConfig.imagenUrl && (
                  <button
                    onClick={handleEliminarImagen}
                    className="w-full px-4 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar Imagen
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Vista previa de la imagen */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Image className="w-5 h-5 text-[#7B1FA2]" />
                Imagen Actual
              </h2>

              {popupConfig.imagenUrl ? (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={`${API_BASE_URL}/popup/imagen/${popupConfig.imagenUrl}`}
                      alt="Imagen promocional"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong className="text-gray-900">Estado:</strong>{' '}
                      {popupConfig.activo ? (
                        <span className="text-green-600 font-semibold">✅ Activo</span>
                      ) : (
                        <span className="text-red-600 font-semibold">❌ Desactivado</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-80 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Image className="w-20 h-20 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No hay imagen configurada
                  </h3>
                  <p className="text-gray-500 mb-4">Sube una imagen para comenzar</p>
                  <button
                    onClick={() => setDialogoSubir(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Subir Primera Imagen
                  </button>
                </div>
              )}
            </div>

            {/* Recomendaciones */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                💡 Recomendaciones:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 ml-7">
                <li>• Usa imágenes en formato PNG o JPG</li>
                <li>• Tamaño recomendado: 800x600 px o similar</li>
                <li>• Peso máximo: 2MB para carga rápida</li>
                <li>• Asegúrate que el texto sea legible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo para subir imagen */}
      {dialogoSubir && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Upload className="w-6 h-6" />
                Subir Nueva Imagen
              </h3>
            </div>

            <div className="p-6">
              <div className="text-center py-8">
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-image-input"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-image-input">
                  <div className="cursor-pointer border-2 border-dashed border-[#7B1FA2] rounded-xl p-8 hover:bg-purple-50 transition-colors">
                    <Upload className="w-12 h-12 text-[#7B1FA2] mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      Seleccionar Imagen
                    </p>
                    <p className="text-sm text-gray-600">
                      PNG, JPG - Máx 2MB
                    </p>
                  </div>
                </label>

                {imagenTemporal && (
                  <div className="mt-6">
                    <p className="font-semibold text-gray-900 mb-3">Vista Previa:</p>
                    <img
                      src={imagenTemporal}
                      alt="Vista previa"
                      className="max-w-full max-h-64 mx-auto rounded-xl border border-gray-200 shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDialogoSubir(false);
                  setImagenTemporal(null);
                  setArchivoImagen(null);
                }}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubirImagen}
                disabled={!imagenTemporal || guardando}
                className="px-5 py-2.5 bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Imagen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de vista previa */}
      {vistaPrevia && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-[#7B1FA2] to-[#9C27B0] text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa del Popup
              </h3>
              <button
                onClick={() => setVistaPrevia(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-auto flex-1">
              {popupConfig.imagenUrl ? (
                <img
                  src={`${API_BASE_URL}/popup/imagen/${popupConfig.imagenUrl}`}
                  alt="Imagen promocional"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: 'calc(90vh - 80px)' }}
                />
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No hay imagen para previsualizar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPopup;
