import React, { useState, useEffect } from 'react';
import { FileText, Save, Edit, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  guardarEvaluacionTerapia,
  obtenerEvaluacionesTerapia,
  obtenerEvaluacionTerapiaPorId,
  actualizarEvaluacionTerapia
} from '../../../../services/historiaClinicaService';

const formatearFechaSinZonaHoraria = (fechaStr) => {
  if (!fechaStr) return 'No especificado';

  if (typeof fechaStr === 'string' && fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = fechaStr.split('-');
    return `${day}/${month}/${year}`;
  }

  const fecha = new Date(fechaStr + 'T00:00:00');
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
};

const EvaluacionTerapiaOcupacional = ({ pacienteId, usuarioId }) => {
  const [evaluacion, setEvaluacion] = useState(getEstadoInicial());
  const [evaluacionActual, setEvaluacionActual] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [expandida, setExpandida] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  function getEstadoInicial() {
    return {
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      motivo_consulta: '',
      tipo_parto: '',
      estimulacion_temprana: false,
      terapias_anteriores: false,
      observaciones_datos_generales: '',
      nivel_alerta: '',
      nivel_atencion: '',
      nivel_actividad: '',
      usa_lentes: false,
      fijacion_visual: false,
      contacto_visual: false,
      seguimiento_visual: false,
      observaciones_visuales: '',
      reconoce_fuentes_sonoras: false,
      busca_sonido: false,
      observaciones_auditivas: '',
      desordenes_modulacion: false,
      hiperresponsividad_tactil: false,
      hiporresponsividad_tactil: false,
      observaciones_tactiles: '',
      selectividad_comidas: false,
      hiperresponsividad_propioceptivo: false,
      hiporresponsividad_propioceptivo: false,
      observaciones_propioceptivo: '',
      inseguridad_gravitacional: false,
      intolerancia_movimiento: false,
      hiporrespuesta_movimiento: false,
      observaciones_vestibular: '',
      fuerza_muscular: '',
      rango_articular: '',
      coordinacion_bimanual: '',
      cruce_linea_media: false,
      dominacion_manual: '',
      observaciones_motor: '',
      intereses: '',
      atencion_concentracion: '',
      seguimiento_ordenes: '',
      otros_cognitivo: '',
      alimentacion_independiente: '',
      observacion_alimentacion: '',
      desvestido_superior: false,
      desvestido_inferior: false,
      vestido_superior: false,
      vestido_inferior: false,
      manejo_botones: false,
      manejo_cierre: false,
      manejo_lazos: false,
      observacion_vestido: '',
      esfinter_vesical: false,
      esfinter_anal: false,
      lavado_manos: false,
      lavado_cara: false,
      cepillado_dientes: false,
      observacion_higiene: '',
      prension_lapiz_imitado: false,
      prension_lapiz_copiado: false,
      prension_lapiz_coloreado: false,
      recortado: false,
      prension_tijeras: '',
      observacion_escolar: '',
      juguetes_preferidos: '',
      tipo_juego_sensoriomotor: false,
      tipo_juego_simbolico: false,
      tipo_juego_otro: false,
      lugar_preferido_jugar: '',
      observacion_juego: '',
      lenguaje: '',
      conclusiones: '',
      sugerencias: '',
      objetivos_iniciales: '',
      observaciones_gustativos: ''
    };
  }

  useEffect(() => {
    if (pacienteId) {
      cargarEvaluacion();
    }
  }, [pacienteId]);

  const cargarEvaluacion = async () => {
    try {
      setCargando(true);
      const evaluaciones = await obtenerEvaluacionesTerapia(pacienteId);

      if (evaluaciones && evaluaciones.length > 0) {
        const ultima = evaluaciones[0];
        const evaluacionFormateada = convertirCamelCaseASnakeCase(ultima);
        setEvaluacionActual(ultima);
        setEvaluacion(evaluacionFormateada);
        setModoEdicion(false);
      } else {
        setEvaluacionActual(null);
        setEvaluacion(getEstadoInicial());
        setModoEdicion(true);
      }
    } catch (error) {
      console.error('Error al cargar evaluación:', error);
      mostrarSnackbar('Error al cargar evaluación', 'error');
      setEvaluacion(getEstadoInicial());
      setModoEdicion(true);
    } finally {
      setCargando(false);
    }
  };

  const convertirCamelCaseASnakeCase = (obj) => {
    if (!obj) return getEstadoInicial();

    return {
      fecha_evaluacion: obj.fechaEvaluacion,
      motivo_consulta: obj.motivoConsulta || '',
      tipo_parto: obj.tipoParto || '',
      estimulacion_temprana: obj.estimulacionTemprana || false,
      terapias_anteriores: obj.terapiasAnteriores || false,
      observaciones_datos_generales: obj.observacionesDatosGenerales || '',
      nivel_alerta: obj.nivelAlerta || '',
      nivel_atencion: obj.nivelAtencion || '',
      nivel_actividad: obj.nivelActividad || '',
      usa_lentes: obj.usaLentes || false,
      fijacion_visual: obj.fijacionVisual || false,
      contacto_visual: obj.contactoVisual || false,
      seguimiento_visual: obj.seguimientoVisual || false,
      observaciones_visuales: obj.observacionesVisuales || '',
      reconoce_fuentes_sonoras: obj.reconoceFuentesSonoras || false,
      busca_sonido: obj.buscaSonido || false,
      observaciones_auditivas: obj.observacionesAuditivas || '',
      desordenes_modulacion: obj.desordenesModulacion || false,
      hiperresponsividad_tactil: obj.hiperresponsividadTactil || false,
      hiporresponsividad_tactil: obj.hiporresponsividadTactil || false,
      observaciones_tactiles: obj.observacionesTactiles || '',
      selectividad_comidas: obj.selectividadComidas || false,
      observaciones_gustativos: obj.observacionesGustativos || '',
      hiperresponsividad_propioceptivo: obj.hiperresponsividadPropioceptivo || false,
      hiporresponsividad_propioceptivo: obj.hiporresponsividadPropioceptivo || false,
      observaciones_propioceptivo: obj.observacionesPropioceptivo || '',
      inseguridad_gravitacional: obj.inseguridadGravitacional || false,
      intolerancia_movimiento: obj.intoleranciaMovimiento || false,
      hiporrespuesta_movimiento: obj.hiporrespuestaMovimiento || false,
      observaciones_vestibular: obj.observacionesVestibular || '',
      fuerza_muscular: obj.fuerzaMuscular || '',
      rango_articular: obj.rangoArticular || '',
      coordinacion_bimanual: obj.coordinacionBimanual || '',
      cruce_linea_media: obj.cruceLineaMedia || false,
      dominacion_manual: obj.dominacionManual || '',
      observaciones_motor: obj.observacionesMotor || '',
      intereses: obj.intereses || '',
      atencion_concentracion: obj.atencionConcentracion || '',
      seguimiento_ordenes: obj.seguimientoOrdenes || '',
      otros_cognitivo: obj.otrosCognitivo || '',
      alimentacion_independiente: obj.alimentacionIndependiente || '',
      observacion_alimentacion: obj.observacionAlimentacion || '',
      desvestido_superior: obj.desvestidoSuperior || false,
      desvestido_inferior: obj.desvestidoInferior || false,
      vestido_superior: obj.vestidoSuperior || false,
      vestido_inferior: obj.vestidoInferior || false,
      manejo_botones: obj.manejoBotones || false,
      manejo_cierre: obj.manejoCierre || false,
      manejo_lazos: obj.manejoLazos || false,
      observacion_vestido: obj.observacionVestido || '',
      esfinter_vesical: obj.esfinterVesical || false,
      esfinter_anal: obj.esfinterAnal || false,
      lavado_manos: obj.lavadoManos || false,
      lavado_cara: obj.lavadoCara || false,
      cepillado_dientes: obj.cepilladoDientes || false,
      observacion_higiene: obj.observacionHigiene || '',
      prension_lapiz_imitado: obj.prensionLapizImitado || false,
      prension_lapiz_copiado: obj.prensionLapizCopiado || false,
      prension_lapiz_coloreado: obj.prensionLapizColoreado || false,
      recortado: obj.recortado || false,
      prension_tijeras: obj.prensionTijeras || '',
      observacion_escolar: obj.observacionEscolar || '',
      juguetes_preferidos: obj.juguetesPreferidos || '',
      tipo_juego_sensoriomotor: obj.tipoJuegoSensoriomotor || false,
      tipo_juego_simbolico: obj.tipoJuegoSimbolico || false,
      tipo_juego_otro: obj.tipoJuegoOtro || false,
      lugar_preferido_jugar: obj.lugarPreferidoJugar || '',
      observacion_juego: obj.observacionJuego || '',
      lenguaje: obj.lenguaje || '',
      conclusiones: obj.conclusiones || '',
      sugerencias: obj.sugerencias || '',
      objetivos_iniciales: obj.objetivosIniciales || ''
    };
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInputChange = (field, value) => {
    setEvaluacion(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setEvaluacion(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);

      if (!pacienteId || !usuarioId) {
        mostrarSnackbar('Error: Faltan datos del paciente o usuario', 'error');
        return;
      }

      const evaluacionData = {
        paciente_id: Number(pacienteId),
        usuario_id: Number(usuarioId),
        ...evaluacion
      };

      if (evaluacionActual) {
        await actualizarEvaluacionTerapia(evaluacionActual.id, evaluacionData);
        mostrarSnackbar('Evaluación actualizada correctamente');
      } else {
        await guardarEvaluacionTerapia(evaluacionData);
        mostrarSnackbar('Evaluación guardada correctamente');
      }

      await cargarEvaluacion();
      setModoEdicion(false);
      setExpandida(true);

    } catch (error) {
      console.error('Error al guardar:', error);
      mostrarSnackbar(
        error.response?.data?.message || 'Error al guardar la evaluación',
        'error'
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = () => {
    setModoEdicion(true);
    setExpandida(true);
  };

  const handleCancelar = () => {
    if (evaluacionActual) {
      const evaluacionFormateada = convertirCamelCaseASnakeCase(evaluacionActual);
      setEvaluacion(evaluacionFormateada);
      setModoEdicion(false);
    } else {
      setEvaluacion(getEstadoInicial());
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-3">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 text-xs font-medium">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Notification */}
      {snackbar.open && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          snackbar.severity === 'success'
            ? 'bg-white border-gray-100'
            : 'bg-white border-red-100'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${snackbar.severity === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{snackbar.message}</span>
          <button onClick={() => setSnackbar({ ...snackbar, open: false })} className="ml-2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 p-4 bg-purple-50 border border-purple-100 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Evaluación de Terapia Ocupacional</h2>
            {evaluacionActual && !modoEdicion && (
              <p className="text-sm text-gray-500">Última evaluación: {formatearFechaSinZonaHoraria(evaluacionActual.fechaEvaluacion)}</p>
            )}
          </div>
        </div>

        {evaluacionActual && !modoEdicion && (
          <button
            onClick={handleEditar}
            className="p-2.5 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Vista de resumen cuando existe evaluación y no está en modo edición */}
      {evaluacionActual && !modoEdicion ? (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setExpandida(!expandida)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-all"
          >
            <span className="font-semibold text-gray-900">Evaluación Registrada</span>
            {expandida ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {expandida && (
            <div className="p-6">
              <VistaResumen evaluacion={evaluacion} />
            </div>
          )}
        </div>
      ) : (
        /* Formulario de edición/creación */
        <FormularioCompleto
          evaluacion={evaluacion}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
          guardando={guardando}
          esNuevo={!evaluacionActual}
        />
      )}
    </div>
  );
};

// Componente de formulario completo con Tailwind
const FormularioCompleto = ({ evaluacion, onInputChange, onCheckboxChange, onGuardar, onCancelar, guardando, esNuevo }) => {
  const CheckboxField = ({ id, checked, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-[#7B1FA2] border-gray-300 rounded focus:ring-[#7B1FA2]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  const Section = ({ title, children }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
      <h3 className="text-sm font-semibold text-[#7B1FA2] uppercase tracking-wide mb-6">{title}</h3>
      {children}
    </div>
  );

  const FormField = ({ label, required, children, className = '' }) => (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <Section title="Datos de la Evaluación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Fecha de Evaluación" required>
            <input
              type="date"
              value={evaluacion.fecha_evaluacion}
              onChange={(e) => onInputChange('fecha_evaluacion', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
            />
          </FormField>

          <FormField label="Motivo de Consulta" required className="md:col-span-2">
            <textarea
              value={evaluacion.motivo_consulta}
              onChange={(e) => onInputChange('motivo_consulta', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      <Section title="1. Datos Generales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Tipo de Parto">
            <select
              value={evaluacion.tipo_parto}
              onChange={(e) => onInputChange('tipo_parto', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
            >
              <option value="">Seleccionar</option>
              <option value="Natural">Parto Natural</option>
              <option value="Cesárea">Parto por Cesárea</option>
            </select>
          </FormField>

          <div className="space-y-3">
            <CheckboxField
              id="estimulacion_temprana"
              checked={evaluacion.estimulacion_temprana}
              onChange={() => onCheckboxChange('estimulacion_temprana')}
              label="Llevó Estimulación Temprana"
            />
            <CheckboxField
              id="terapias_anteriores"
              checked={evaluacion.terapias_anteriores}
              onChange={() => onCheckboxChange('terapias_anteriores')}
              label="Llevó Terapias Anteriormente"
            />
          </div>

          <FormField label="Observaciones" className="md:col-span-2">
            <textarea
              value={evaluacion.observaciones_datos_generales}
              onChange={(e) => onInputChange('observaciones_datos_generales', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all resize-none"
            />
          </FormField>
        </div>
      </Section>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          onClick={onCancelar}
          disabled={guardando}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onGuardar}
          disabled={guardando}
          className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all shadow-sm disabled:opacity-50"
        >
          {guardando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {esNuevo ? 'Guardar Evaluación' : 'Actualizar Evaluación'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Vista de resumen simplificada
const VistaResumen = ({ evaluacion }) => {
  const mostrarValor = (valor) => valor || 'No especificado';

  const ItemResumen = ({ label, valor }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</p>
      <p className="text-sm text-gray-900">{mostrarValor(valor)}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-[#7B1FA2] mb-4">Información General</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ItemResumen label="Fecha de Evaluación" valor={formatearFechaSinZonaHoraria(evaluacion.fecha_evaluacion)} />
          <ItemResumen label="Motivo de Consulta" valor={evaluacion.motivo_consulta} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-[#7B1FA2] mb-4">Datos Generales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ItemResumen label="Tipo de Parto" valor={evaluacion.tipo_parto} />
          <ItemResumen label="Estimulación Temprana" valor={evaluacion.estimulacion_temprana ? 'Sí' : 'No'} />
          <ItemResumen label="Terapias Anteriores" valor={evaluacion.terapias_anteriores ? 'Sí' : 'No'} />
          {evaluacion.observaciones_datos_generales && (
            <ItemResumen label="Observaciones" valor={evaluacion.observaciones_datos_generales} />
          )}
        </div>
      </div>

      {evaluacion.conclusiones && (
        <div>
          <h4 className="text-sm font-bold text-[#7B1FA2] mb-4">Conclusiones</h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{evaluacion.conclusiones}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluacionTerapiaOcupacional;
