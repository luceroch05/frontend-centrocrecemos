import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2, Briefcase, User } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { getTrabajadoresByServicio } from '../../services/trabajadorServicioService';

const EditarTerapeutaModal = ({ open, onClose, servicio, nuevoTerapeuta, setNuevoTerapeuta, terapeutas, onGuardar }) => {
  const [saving, setSaving] = useState(false);
  const [terapeutasFiltrados, setTerapeutasFiltrados] = useState([]);
  const [loadingTerapeutas, setLoadingTerapeutas] = useState(false);

  // Cargar terapeutas filtrados cuando se abre el modal
  useEffect(() => {
    const cargarTerapeutasFiltrados = async () => {
      if (open && servicio?.servicio?.id) {
        setLoadingTerapeutas(true);
        try {
          const trabajadoresDelServicio = await getTrabajadoresByServicio(servicio.servicio.id);
          // Filtrar solo los que sean terapeutas activos
          const terapeutasDelServicio = trabajadoresDelServicio.filter(
            t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA
          );
          setTerapeutasFiltrados(terapeutasDelServicio);
        } catch (error) {
          console.error('Error al cargar terapeutas del servicio:', error);
          // Si hay error, mostrar todos los terapeutas
          setTerapeutasFiltrados(terapeutas.filter(t => t.estado === true && t.rol?.id === ROLES.TERAPEUTA));
        } finally {
          setLoadingTerapeutas(false);
        }
      }
    };

    cargarTerapeutasFiltrados();
  }, [open, servicio, terapeutas]);

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await onGuardar();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7B1FA2] to-purple-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Editar Terapeuta Asignado</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Servicio (readonly) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7B1FA2]" />
              Servicio
            </label>
            <div className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600">
              {servicio?.servicio?.nombre || 'Sin nombre'}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              El servicio no se puede cambiar, solo el terapeuta asignado
            </p>
          </div>

          {/* Terapeuta Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#7B1FA2]" />
              Terapeuta
              <span className="text-red-500">*</span>
              {loadingTerapeutas && (
                <Loader2 className="w-3 h-3 animate-spin text-[#7B1FA2]" />
              )}
            </label>
            <select
              value={nuevoTerapeuta}
              onChange={e => setNuevoTerapeuta(e.target.value)}
              disabled={loadingTerapeutas}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] transition-colors bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingTerapeutas
                  ? 'Cargando terapeutas...'
                  : terapeutasFiltrados.length === 0
                  ? 'No hay terapeutas para este servicio'
                  : 'Sin asignar'}
              </option>
              {terapeutasFiltrados.map(t => (
                <option key={t.id} value={`${t.nombres} ${t.apellidos}`}>
                  {t.nombres} {t.apellidos}{t.especialidad ? ` — ${t.especialidad.nombre}` : ''}
                </option>
              ))}
            </select>
            {terapeutasFiltrados.length > 0 && !loadingTerapeutas && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {terapeutasFiltrados.length} terapeuta
                {terapeutasFiltrados.length !== 1 ? 's' : ''} disponible
                {terapeutasFiltrados.length !== 1 ? 's' : ''} para este servicio
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={saving || !nuevoTerapeuta}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-purple-600 rounded-xl hover:from-[#6A1B9A] hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-500/30"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditarTerapeutaModal;
