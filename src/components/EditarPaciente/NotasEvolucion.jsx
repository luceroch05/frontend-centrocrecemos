import React, { useState } from 'react';
import { Plus, X, Save, FileText, Target, Activity, Stethoscope, ClipboardList, Calendar, User } from 'lucide-react';

const NotasEvolucion = ({ 
  notas, 
  setNotas, 
  openNotaModal, 
  setOpenNotaModal, 
  nota, 
  setNota, 
  paciente_id, 
  user_id_crea, 
  user, 
  setSnackbar 
}) => {
  const [saving, setSaving] = useState(false);

  const formatTextWithLineBreaks = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleAgregarComentario = async (e) => {
    e.preventDefault();
    if (nota.entrevista.trim() || nota.sesionEvaluacion.trim() || nota.sesionTerapias.trim() || nota.objetivosTerapeuticos.trim() || nota.observaciones.trim()) {
      setSaving(true);
      const nuevaNota = {
        paciente_id,
        entrevista: nota.entrevista,
        sesion_evaluacion: nota.sesionEvaluacion,
        sesion_terapias: nota.sesionTerapias,
        objetivos_terapeuticos: nota.objetivosTerapeuticos,
        observaciones: nota.observaciones,
        user_id_crea
      };
      try {
        // await guardarNotaEvolucion(nuevaNota);
        setNotas([
          {
            id: notas.length + 1,
            fecha: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),            
            autor: user ? `${user.nombres} ${user.apellidos}${user.rol ? ' — ' + user.rol.nombre : ''}` : 'Usuario',
            entrevista: nota.entrevista,
            sesionEvaluacion: nota.sesionEvaluacion,
            sesionTerapias: nota.sesionTerapias,
            objetivosTerapeuticos: nota.objetivosTerapeuticos,
            observaciones: nota.observaciones
          },
          ...notas
        ]);
        setNota({ entrevista: '', sesionEvaluacion: '', sesionTerapias: '', objetivosTerapeuticos: '', observaciones: '' });
        setOpenNotaModal(false);
        setSnackbar({ open: true, message: 'Nota guardada correctamente', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al guardar la nota', severity: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {/* Header más grande */}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#7B1FA2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Notas de Evolución</h2>
              <p className="text-sm text-gray-500">Seguimiento del paciente</p>
            </div>
          </div>
          <button
            onClick={() => setOpenNotaModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#7B1FA2] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota
          </button>
        </div>

        {/* Notas List con más espacio */}
        <div className="p-8">
          <style>{`
            .notas-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .notas-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .notas-scroll::-webkit-scrollbar-thumb {
              background: #e5e7eb;
              border-radius: 10px;
            }
            .notas-scroll::-webkit-scrollbar-thumb:hover {
              background: #d1d5db;
            }
          `}</style>
          {notas && notas.length > 0 ? (
            <div className="space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto notas-scroll pr-2">
              {notas.map((n, idx) => {
                const [nombre, especialidad] = n.autor.split(' — ');
                return (
                  <div
                    key={n.id}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white"
                  >
                    {/* Header de la nota más prominente */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-base font-bold shadow-sm">
                            {nombre.split(' ').map(p => p[0]).join('')}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900">{nombre}</p>
                            {especialidad && (
                              <span className="inline-block mt-1.5 px-3 py-1 bg-[#A3C644]/10 text-[#A3C644] text-xs font-medium rounded-lg border border-[#A3C644]/20">
                                {especialidad.trim()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {n.fecha}
                        </div>
                      </div>
                    </div>

                    {/* Contenido con más espacio y mejor tipografía */}
                    <div className="p-6 space-y-5">
                      {n.entrevista && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                              Entrevista
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formatTextWithLineBreaks(n.entrevista)}
                          </p>
                        </div>
                      )}

                      {n.objetivosTerapeuticos && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Target className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                              Objetivos Terapéuticos
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formatTextWithLineBreaks(n.objetivosTerapeuticos)}
                          </p>
                        </div>
                      )}

                      {n.sesionEvaluacion && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                              Sesión de Evaluación
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formatTextWithLineBreaks(n.sesionEvaluacion)}
                          </p>
                        </div>
                      )}

                      {n.sesionTerapias && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="w-5 h-5 text-amber-600" />
                            </div>
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                              Sesión de Terapias
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formatTextWithLineBreaks(n.sesionTerapias)}
                          </p>
                        </div>
                      )}

                      {n.observaciones && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <ClipboardList className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Observaciones
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formatTextWithLineBreaks(n.observaciones)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-900 mb-2">Sin notas registradas</p>
              <p className="text-sm text-gray-500">Agrega la primera nota de evolución del paciente</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {openNotaModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={() => setOpenNotaModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#7B1FA2]/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#7B1FA2]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Nueva Nota de Evolución</h2>
                      <p className="text-sm text-gray-500">Registra el progreso del paciente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenNotaModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <User className="w-4 h-4 text-purple-600" />
                      Entrevista
                    </label>
                    <textarea
                      value={nota.entrevista}
                      onChange={e => setNota({ ...nota, entrevista: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Describe la entrevista con el paciente..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Target className="w-4 h-4 text-emerald-600" />
                      Objetivos Terapéuticos
                    </label>
                    <textarea
                      value={nota.objetivosTerapeuticos}
                      onChange={e => setNota({ ...nota, objetivosTerapeuticos: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Define los objetivos terapéuticos..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Sesión de Evaluación
                    </label>
                    <textarea
                      value={nota.sesionEvaluacion}
                      onChange={e => setNota({ ...nota, sesionEvaluacion: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Resultados de la evaluación..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Stethoscope className="w-4 h-4 text-amber-600" />
                      Sesión de Terapias
                    </label>
                    <textarea
                      value={nota.sesionTerapias}
                      onChange={e => setNota({ ...nota, sesionTerapias: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Detalles de la sesión de terapia..."
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <ClipboardList className="w-4 h-4 text-gray-600" />
                      Observaciones
                    </label>
                    <textarea
                      value={nota.observaciones}
                      onChange={e => setNota({ ...nota, observaciones: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#7B1FA2] focus:ring-2 focus:ring-[#7B1FA2]/10 transition-all bg-white text-gray-900 resize-none"
                      placeholder="Observaciones generales..."
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50/50 px-8 py-5 flex items-center justify-end gap-3 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => setOpenNotaModal(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-white border border-gray-200 rounded-xl transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleAgregarComentario}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Nota
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NotasEvolucion;