import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  IconButton,
  Collapse,
  CircularProgress,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import { Card, CardContent, CardHeader, CardActions } from '@mui/material';
import {
  Assignment,
  ExpandMore,
  ExpandLess,
  Edit,
  Save,
  
} from '@mui/icons-material';
import {
  guardarEvaluacionTerapia,
  obtenerEvaluacionesTerapia,
  obtenerEvaluacionTerapiaPorId,
  actualizarEvaluacionTerapia
} from '../../../../services/historiaClinicaService';
   const formatearFechaSinZonaHoraria = (fechaStr) => {
    if (!fechaStr) return 'No especificado';
    
    // Si ya es YYYY-MM-DD, extraer y formatear directamente
    if (typeof fechaStr === 'string' && fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = fechaStr.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback para otros formatos
    const fecha = new Date(fechaStr + 'T00:00:00'); // Agregar hora para forzar local
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
     // Función para formatear fecha sin problemas de zona horaria
  
    
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
      observacionaciones_gustativos: obj.observacionesGustativos || '',
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
      objetivos_iniciales: obj.objetivosIniciales || '',
      observaciones_gustativos: obj.observacionesGustativos || ''
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3,
        p: 2,
        backgroundColor: '#e3f2fd',
        borderRadius: 2,
        border: '1px solid #90caf9'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment sx={{ color: '#1976d2', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              EVALUACIÓN DE TERAPIA OCUPACIONAL
            </Typography>
            {evaluacionActual && !modoEdicion && (
              <Typography variant="body2" sx={{ color: '#666' }}>
                Última evaluación: {formatearFechaSinZonaHoraria(evaluacionActual.fechaEvaluacion)}
              </Typography>
            )}
          </Box>
        </Box>
        
        {evaluacionActual && !modoEdicion && (
          <IconButton onClick={handleEditar} sx={{ color: '#1976d2' }}>
            <Edit />
          </IconButton>
        )}
      </Box>

      {/* Vista de resumen cuando existe evaluación y no está en modo edición */}
      {evaluacionActual && !modoEdicion ? (
        <Box sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box 
            onClick={() => setExpandida(!expandida)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              backgroundColor: '#f8f9fa',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#e9ecef' }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Evaluación Registrada
            </Typography>
            {expandida ? <ExpandLess /> : <ExpandMore />}
          </Box>

          <Collapse in={expandida}>
            <Box sx={{ p: 3 }}>
              <VistaResumen evaluacion={evaluacion} />
            </Box>
          </Collapse>
        </Box>
      ) : (
        /* Formulario de edición/creación COMPLETO */
        <FormularioEvaluacionCompleto
          evaluacion={evaluacion}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onGuardar={handleGuardar}
          onCancelar={handleCancelar}
          guardando={guardando}
          esNuevo={!evaluacionActual}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};



// Componente de Checkbox Personalizado
const CheckboxPersonalizado = ({ 
  id, 
  checked, 
  onChange, 
  label,
  name,
  disabled = false
}) => (
  <div style={{ display: 'inline-block', marginRight: '16px', marginBottom: '8px' }}>
    <input 
      className="checkbox-effect"
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      name={name}
      disabled={disabled}
    />
    <label htmlFor={id}>
      {label}
    </label>
  </div>
);
// FORMULARIO COMPLETO CON TODAS LAS SECCIONES Y CHECKBOXES PERSONALIZADOS
const FormularioEvaluacionCompleto = ({ 
  evaluacion, 
  onInputChange, 
  onCheckboxChange, 
  onGuardar, 
  onCancelar,
  guardando,
  esNuevo
}) => (
  <Grid container spacing={3}>
    {/* DATOS DE LA EVALUACIÓN */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1
      }}>
        DATOS DE LA EVALUACIÓN
      </Typography>
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        required
        type="date"
        label="FECHA DE EVALUACIÓN"
        value={evaluacion.fecha_evaluacion}
        onChange={(e) => onInputChange('fecha_evaluacion', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        required
        label="MOTIVO DE CONSULTA"
        multiline
        rows={3}
        value={evaluacion.motivo_consulta}
        onChange={(e) => onInputChange('motivo_consulta', e.target.value)}
      />
    </Grid>

    {/* 1. DATOS GENERALES */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        1. DATOS GENERALES
      </Typography>
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>TIPO DE PARTO</InputLabel>
        <Select
          value={evaluacion.tipo_parto}
          onChange={(e) => onInputChange('tipo_parto', e.target.value)}
          label="TIPO DE PARTO"
        >
          <MenuItem value="Natural">Parto Natural</MenuItem>
          <MenuItem value="Cesárea">Parto por Cesárea</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <CheckboxPersonalizado
          id="estimulacion_temprana"
          checked={evaluacion.estimulacion_temprana || false}
          onChange={() => onCheckboxChange('estimulacion_temprana')}
          label="LLEVÓ ESTIMULACIÓN TEMPRANA"
        />
        <CheckboxPersonalizado
          id="terapias_anteriores"
          checked={evaluacion.terapias_anteriores || false}
          onChange={() => onCheckboxChange('terapias_anteriores')}
          label="LLEVÓ TERAPIAS ANTERIORMENTE"
        />
      </Box>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="OBSERVACIONES"
        multiline
        rows={3}
        value={evaluacion.observaciones_datos_generales || ''}
        onChange={(e) => onInputChange('observaciones_datos_generales', e.target.value)}
      />
    </Grid>

    {/* 2. OBSERVACIONES GENERALES */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        2. OBSERVACIONES GENERALES
      </Typography>
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="NIVEL DE ALERTA"
        value={evaluacion.nivel_alerta || ''}
        onChange={(e) => onInputChange('nivel_alerta', e.target.value)}
      />
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="NIVEL DE ATENCIÓN"
        value={evaluacion.nivel_atencion || ''}
        onChange={(e) => onInputChange('nivel_atencion', e.target.value)}
      />
    </Grid>

    <Grid item xs={12} md={4}>
      <TextField
        fullWidth
        label="NIVEL DE ACTIVIDAD"
        value={evaluacion.nivel_actividad || ''}
        onChange={(e) => onInputChange('nivel_actividad', e.target.value)}
      />
    </Grid>

    {/* 3. COMPONENTE SENSORIAL */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        3. COMPONENTE SENSORIAL
      </Typography>
    </Grid>

    {/* VISUALES - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          VISUALES
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <CheckboxPersonalizado
            id="usa_lentes"
            checked={evaluacion.usa_lentes || false}
            onChange={() => onCheckboxChange('usa_lentes')}
            label="USA LENTES"
          />
          <CheckboxPersonalizado
            id="fijacion_visual"
            checked={evaluacion.fijacion_visual || false}
            onChange={() => onCheckboxChange('fijacion_visual')}
            label="FIJACIÓN VISUAL"
          />
          <CheckboxPersonalizado
            id="contacto_visual"
            checked={evaluacion.contacto_visual || false}
            onChange={() => onCheckboxChange('contacto_visual')}
            label="CONTACTO VISUAL"
          />
          <CheckboxPersonalizado
            id="seguimiento_visual"
            checked={evaluacion.seguimiento_visual || false}
            onChange={() => onCheckboxChange('seguimiento_visual')}
            label="SEGUIMIENTO VISUAL"
          />
        </Box>
        <TextField
          fullWidth
          label="OBSERVACIONES"
          multiline
          rows={2}
          value={evaluacion.observaciones_visuales || ''}
          onChange={(e) => onInputChange('observaciones_visuales', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* AUDITIVAS - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          AUDITIVAS
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <CheckboxPersonalizado
            id="reconoce_fuentes_sonoras"
            checked={evaluacion.reconoce_fuentes_sonoras || false}
            onChange={() => onCheckboxChange('reconoce_fuentes_sonoras')}
            label="RECONOCE FUENTES SONORAS"
          />
          <CheckboxPersonalizado
            id="busca_sonido"
            checked={evaluacion.busca_sonido || false}
            onChange={() => onCheckboxChange('busca_sonido')}
            label="BUSCA EL SONIDO"
          />
        </Box>
        <TextField
          fullWidth
          label="OBSERVACIONES"
          multiline
          rows={2}
          value={evaluacion.observaciones_auditivas || ''}
          onChange={(e) => onInputChange('observaciones_auditivas', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* TÁCTILES - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          TÁCTILES
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <CheckboxPersonalizado
            id="desordenes_modulacion"
            checked={evaluacion.desordenes_modulacion || false}
            onChange={() => onCheckboxChange('desordenes_modulacion')}
            label="DESÓRDENES DE MODULACIÓN"
          />
          <CheckboxPersonalizado
            id="hiperresponsividad_tactil"
            checked={evaluacion.hiperresponsividad_tactil || false}
            onChange={() => onCheckboxChange('hiperresponsividad_tactil')}
            label="HIPERRESPONSIVIDAD"
          />
          <CheckboxPersonalizado
            id="hiporresponsividad_tactil"
            checked={evaluacion.hiporresponsividad_tactil || false}
            onChange={() => onCheckboxChange('hiporresponsividad_tactil')}
            label="HIPORRESPONSIVIDAD"
          />
        </Box>
        <TextField
          fullWidth
          label="OBSERVACIONES"
          multiline
          rows={2}
          value={evaluacion.observaciones_tactiles || ''}
          onChange={(e) => onInputChange('observaciones_tactiles', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* GUSTATIVOS - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          GUSTATIVOS
        </Typography>
        <CheckboxPersonalizado
          id="selectividad_comidas"
          checked={evaluacion.selectividad_comidas || false}
          onChange={() => onCheckboxChange('selectividad_comidas')}
          label="SELECTIVIDAD EN COMIDAS"
        />
        <TextField
          fullWidth
          label="OBSERVACIONES"
          multiline
          rows={2}
          value={evaluacion.observaciones_gustativos || ''}
          onChange={(e) => onInputChange('observaciones_gustativos', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* PROPIOCEPTIVO - SELECCIÓN ÚNICA */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          PROPIOCEPTIVO
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <CheckboxPersonalizado
            id="hiperresponsividad_propioceptivo"
            checked={evaluacion.hiperresponsividad_propioceptivo || false}
            onChange={() => {
              onInputChange('hiperresponsividad_propioceptivo', true);
              onInputChange('hiporresponsividad_propioceptivo', false);
            }}
            label="HIPERRESPONSIVIDAD"
          />
          <CheckboxPersonalizado
            id="hiporresponsividad_propioceptivo"
            checked={evaluacion.hiporresponsividad_propioceptivo || false}
            onChange={() => {
              onInputChange('hiporresponsividad_propioceptivo', true);
              onInputChange('hiperresponsividad_propioceptivo', false);
            }}
            label="HIPORRESPONSIVIDAD"
          />
        </Box>
        <TextField
          fullWidth
          label="OBSERVACIONES"
          multiline
          rows={2}
          value={evaluacion.observaciones_propioceptivo || ''}
          onChange={(e) => onInputChange('observaciones_propioceptivo', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* VESTIBULAR - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          VESTIBULAR
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <CheckboxPersonalizado
            id="inseguridad_gravitacional"
            checked={evaluacion.inseguridad_gravitacional || false}
            onChange={() => onCheckboxChange('inseguridad_gravitacional')}
            label="INSEGURIDAD GRAVITACIONAL"
          />
          <CheckboxPersonalizado
            id="intolerancia_movimiento"
            checked={evaluacion.intolerancia_movimiento || false}
            onChange={() => onCheckboxChange('intolerancia_movimiento')}
            label="INTOLERANCIA AL MOVIMIENTO"
          />
          <CheckboxPersonalizado
            id="hiporrespuesta_movimiento"
            checked={evaluacion.hiporrespuesta_movimiento || false}
            onChange={() => onCheckboxChange('hiporrespuesta_movimiento')}
            label="HIPORRESPUESTA AL MOVIMIENTO"
          />
        </Box>
        <TextField
          fullWidth
          label="OBSERVACIONES"
          multiline
          rows={2}
          value={evaluacion.observaciones_vestibular || ''}
          onChange={(e) => onInputChange('observaciones_vestibular', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* 4. COMPONENTE MOTOR */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        4. COMPONENTE MOTOR
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="FUERZA MUSCULAR"
        value={evaluacion.fuerza_muscular || ''}
        onChange={(e) => onInputChange('fuerza_muscular', e.target.value)}
      />
    </Grid>

    <Grid item xs={12} md={6}>
      <FormControl fullWidth>
        <InputLabel>RANGO ARTICULAR</InputLabel>
        <Select
          value={evaluacion.rango_articular || ''}
          onChange={(e) => onInputChange('rango_articular', e.target.value)}
          label="RANGO ARTICULAR"
        >
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Hiperlaxitud">Hiperlaxitud Articular</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="COORDINACIÓN BIMANUAL"
        value={evaluacion.coordinacion_bimanual || ''}
        onChange={(e) => onInputChange('coordinacion_bimanual', e.target.value)}
      />
    </Grid>

    <Grid item xs={12}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <CheckboxPersonalizado
          id="cruce_linea_media"
          checked={evaluacion.cruce_linea_media || false}
          onChange={() => onCheckboxChange('cruce_linea_media')}
          label="CRUCE DE LÍNEA MEDIA"
        />
        <FormControl fullWidth sx={{ maxWidth: 200 }}>
          <InputLabel>DOMINACIÓN MANUAL</InputLabel>
          <Select
            value={evaluacion.dominacion_manual || ''}
            onChange={(e) => onInputChange('dominacion_manual', e.target.value)}
            label="DOMINACIÓN MANUAL"
          >
            <MenuItem value="Derecha">Derecha</MenuItem>
            <MenuItem value="Izquierda">Izquierda</MenuItem>
            <MenuItem value="Ambidiestro">Ambidiestro</MenuItem>
            <MenuItem value="No definido">No definido</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="OBSERVACIONES"
        multiline
        rows={3}
        value={evaluacion.observaciones_motor || ''}
        onChange={(e) => onInputChange('observaciones_motor', e.target.value)}
      />
    </Grid>

    {/* 5. COMPONENTE PSICOLÓGICO */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        5. COMPONENTE PSICOLÓGICO
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="INTERESES"
        multiline
        rows={3}
        value={evaluacion.intereses || ''}
        onChange={(e) => onInputChange('intereses', e.target.value)}
      />
    </Grid>

    {/* 6. COMPONENTE COGNITIVO */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        6. COMPONENTE COGNITIVO
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="ATENCIÓN-CONCENTRACIÓN"
        value={evaluacion.atencion_concentracion || ''}
        onChange={(e) => onInputChange('atencion_concentracion', e.target.value)}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="SEGUIMIENTO DE ÓRDENES"
        value={evaluacion.seguimiento_ordenes || ''}
        onChange={(e) => onInputChange('seguimiento_ordenes', e.target.value)}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="OTROS"
        value={evaluacion.otros_cognitivo || ''}
        onChange={(e) => onInputChange('otros_cognitivo', e.target.value)}
      />
    </Grid>

    {/* 7. ÁREA DEL DESEMPEÑO OCUPACIONAL - AVD */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        7. ÁREA DEL DESEMPEÑO OCUPACIONAL - ACTIVIDADES DE VIDA DIARIA (AVD)
      </Typography>
    </Grid>

    {/* ALIMENTACIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          ALIMENTACIÓN
        </Typography>
        <FormControl fullWidth>
          <RadioGroup
            row
            value={evaluacion.alimentacion_independiente || ''}
            onChange={(e) => onInputChange('alimentacion_independiente', e.target.value)}
          >
            <FormControlLabel value="Independiente" control={<Radio sx={{ color: '#1B998B', '&.Mui-checked': { color: '#1B998B' } }} />}  label="INDEPENDIENTE" />
            <FormControlLabel value="Dependiente" control={<Radio sx={{ color: '#1B998B', '&.Mui-checked': { color: '#1B998B' } }} />}  label="DEPENDIENTE" />
          </RadioGroup>
        </FormControl>
        <TextField
          fullWidth
          label="OBSERVACIÓN"
          multiline
          rows={2}
          value={evaluacion.observacion_alimentacion || ''}
          onChange={(e) => onInputChange('observacion_alimentacion', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* VESTIDO - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          VESTIDO
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <CheckboxPersonalizado
            id="desvestido_superior"
            checked={evaluacion.desvestido_superior || false}
            onChange={() => onCheckboxChange('desvestido_superior')}
            label="A) DESVESTIDO PRENDA SUPERIOR"
          />
          <CheckboxPersonalizado
            id="desvestido_inferior"
            checked={evaluacion.desvestido_inferior || false}
            onChange={() => onCheckboxChange('desvestido_inferior')}
            label="B) DESVESTIDO PRENDA INFERIOR"
          />
          <CheckboxPersonalizado
            id="vestido_superior"
            checked={evaluacion.vestido_superior || false}
            onChange={() => onCheckboxChange('vestido_superior')}
            label="C) VESTIDO PRENDA SUPERIOR"
          />
          <CheckboxPersonalizado
            id="vestido_inferior"
            checked={evaluacion.vestido_inferior || false}
            onChange={() => onCheckboxChange('vestido_inferior')}
            label="D) VESTIDO PRENDA INFERIOR"
          />
          <CheckboxPersonalizado
            id="manejo_botones"
            checked={evaluacion.manejo_botones || false}
            onChange={() => onCheckboxChange('manejo_botones')}
            label="E) MANEJO DE BOTONES"
          />
          <CheckboxPersonalizado
            id="manejo_cierre"
            checked={evaluacion.manejo_cierre || false}
            onChange={() => onCheckboxChange('manejo_cierre')}
            label="F) MANEJO DE CIERRE"
          />
          <CheckboxPersonalizado
            id="manejo_lazos"
            checked={evaluacion.manejo_lazos || false}
            onChange={() => onCheckboxChange('manejo_lazos')}
            label="G) MANEJO DE LAZOS"
          />
        </Box>
        <TextField
          fullWidth
          label="OBSERVACIÓN"
          multiline
          rows={2}
          value={evaluacion.observacion_vestido || ''}
          onChange={(e) => onInputChange('observacion_vestido', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* HIGIENE - MÚLTIPLE SELECCIÓN */}
    <Grid item xs={12}>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
          HIGIENE
        </Typography>
        
        <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
          A) CONTROL DE ESFÍNTERES:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <CheckboxPersonalizado
            id="esfinter_vesical"
            checked={evaluacion.esfinter_vesical || false}
            onChange={() => onCheckboxChange('esfinter_vesical')}
            label="ESFÍNTER VESICAL"
          />
          <CheckboxPersonalizado
            id="esfinter_anal"
            checked={evaluacion.esfinter_anal || false}
            onChange={() => onCheckboxChange('esfinter_anal')}
            label="ESFÍNTER ANAL"
          />
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
          B) HIGIENE MENOR:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <CheckboxPersonalizado
            id="lavado_manos"
            checked={evaluacion.lavado_manos || false}
            onChange={() => onCheckboxChange('lavado_manos')}
            label="LAVADO DE MANOS"
          />
          <CheckboxPersonalizado
            id="lavado_cara"
            checked={evaluacion.lavado_cara || false}
            onChange={() => onCheckboxChange('lavado_cara')}
            label="LAVADO DE CARA"
          />
          <CheckboxPersonalizado
            id="cepillado_dientes"
            checked={evaluacion.cepillado_dientes || false}
            onChange={() => onCheckboxChange('cepillado_dientes')}
            label="CEPILLADO DE DIENTES"
          />
        </Box>

        <TextField
          fullWidth
          label="OBSERVACIÓN GENERAL"
          multiline
          rows={2}
          value={evaluacion.observacion_higiene || ''}
          onChange={(e) => onInputChange('observacion_higiene', e.target.value)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Grid>

    {/* 8. ÁREA ESCOLAR */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        8. ÁREA DEL DESEMPEÑO OCUPACIONAL - ESCOLAR
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        PRENSIÓN EN LÁPIZ:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <CheckboxPersonalizado
          id="prension_lapiz_imitado"
          checked={evaluacion.prension_lapiz_imitado || false}
          onChange={() => onCheckboxChange('prension_lapiz_imitado')}
          label="IMITADO"
        />
        <CheckboxPersonalizado
          id="prension_lapiz_copiado"
          checked={evaluacion.prension_lapiz_copiado || false}
          onChange={() => onCheckboxChange('prension_lapiz_copiado')}
          label="COPIADO"
        />
        <CheckboxPersonalizado
          id="prension_lapiz_coloreado"
          checked={evaluacion.prension_lapiz_coloreado || false}
          onChange={() => onCheckboxChange('prension_lapiz_coloreado')}
          label="COLOREADO"
        />
        <CheckboxPersonalizado
          id="recortado"
          checked={evaluacion.recortado || false}
          onChange={() => onCheckboxChange('recortado')}
          label="RECORTADO"
        />
      </Box>
    </Grid>

    <Grid item xs={12}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, mt: 2 }}>
        PRENSIÓN EN TIJERAS/PATRÓN DE SUJECIÓN:
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          row
          aria-label="prension-tijeras"
          name="prension-tijeras"
          value={evaluacion.prension_tijeras || ''}
          onChange={(e) => onInputChange('prension_tijeras', e.target.value)}
        >
           <FormControlLabel 
              value="Adecuado" 
              control={<Radio sx={{ color: '#1B998B', '&.Mui-checked': { color: '#1B998B' } }} />} 
              label="ADECUADO" 
            />
            <FormControlLabel 
              value="Inadecuado" 
              control={<Radio sx={{ color: '#1B998B', '&.Mui-checked': { color: '#1B998B' } }} />} 
              label="INADECUADO" 
            />
        </RadioGroup>
      </FormControl>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        multiline
        rows={2}
        label="OBSERVACIÓN"
        value={evaluacion.observacion_escolar || ''}
        onChange={(e) => onInputChange('observacion_escolar', e.target.value)}
      />
    </Grid>

    {/* 9. ÁREA DEL DESEMPEÑO - JUEGO */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        9. ÁREA DEL DESEMPEÑO - JUEGO
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="JUGUETES PREFERIDOS"
        value={evaluacion.juguetes_preferidos || ''}
        onChange={(e) => onInputChange('juguetes_preferidos', e.target.value)}
      />
    </Grid>

    <Grid item xs={12}>
      <Typography variant="body2" sx={{ mb: 1 }}>
        JUEGOS PREFERIDOS:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <CheckboxPersonalizado
          id="tipo_juego_sensoriomotor"
          checked={evaluacion.tipo_juego_sensoriomotor || false}
          onChange={() => onCheckboxChange('tipo_juego_sensoriomotor')}
          label="SENSORIOMOTOR"
        />
        <CheckboxPersonalizado
          id="tipo_juego_simbolico"
          checked={evaluacion.tipo_juego_simbolico || false}
          onChange={() => onCheckboxChange('tipo_juego_simbolico')}
          label="SIMBÓLICO"
        />
        <CheckboxPersonalizado
          id="tipo_juego_otro"
          checked={evaluacion.tipo_juego_otro || false}
          onChange={() => onCheckboxChange('tipo_juego_otro')}
          label="OTRO"
        />
      </Box>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="LUGAR PREFERIDO PARA JUGAR"
        value={evaluacion.lugar_preferido_jugar || ''}
        onChange={(e) => onInputChange('lugar_preferido_jugar', e.target.value)}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="OBSERVACIÓN"
        multiline
        rows={2}
        value={evaluacion.observacion_juego || ''}
        onChange={(e) => onInputChange('observacion_juego', e.target.value)}
      />
    </Grid>

    {/* 10. COMUNICACIÓN */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        10. COMUNICACIÓN
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="LENGUAJE"
        value={evaluacion.lenguaje || ''}
        onChange={(e) => onInputChange('lenguaje', e.target.value)}
        placeholder="Describir lenguaje expresivo y comprensivo"
        multiline
        rows={3}
      />
    </Grid>

    {/* 11. CONCLUSIONES */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        11. CONCLUSIONES
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="CONCLUSIONES"
        multiline
        rows={4}
        value={evaluacion.conclusiones || ''}
        onChange={(e) => onInputChange('conclusiones', e.target.value)}
        placeholder="Escriba las conclusiones de la evaluación..."
      />
    </Grid>

    {/* 12. SUGERENCIAS */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        12. SUGERENCIAS
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="SUGERENCIAS"
        multiline
        rows={4}
        value={evaluacion.sugerencias || ''}
        onChange={(e) => onInputChange('sugerencias', e.target.value)}
        placeholder="Escriba las sugerencias..."
      />
    </Grid>

    {/* 13. OBJETIVOS INICIALES */}
    <Grid item xs={12}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        color: '#1976d2',
        mb: 2,
        borderBottom: '2px solid #1976d2',
        pb: 1,
        mt: 3
      }}>
        13. OBJETIVOS INICIALES
      </Typography>
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        label="OBJETIVOS INICIALES"
        multiline
        rows={4}
        value={evaluacion.objetivos_iniciales || ''}
        onChange={(e) => onInputChange('objetivos_iniciales', e.target.value)}
        placeholder="Escriba los objetivos iniciales..."
      />
    </Grid>

    {/* Botones de acción */}
    <Grid item xs={12}>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={onGuardar}
          disabled={guardando}
          startIcon={guardando ? <CircularProgress size={20} /> : <Save />}
        >
          {guardando ? 'Guardando...' : (esNuevo ? 'Guardar Evaluación' : 'Actualizar Evaluación')}
        </Button>
      </Box>
    </Grid>
  </Grid>
);

// Componente para la vista de resumen MEJORADO Y COMPLETO
const VistaResumen = ({ evaluacion }) => {
  
  const mostrarSiNo = (valor) => valor ? 'Sí' : 'No';
  const mostrarValor = (valor) => valor || 'No especificado';

  const ItemConChip = ({ label, valor, esBooleano = true }) => (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      p: 2,
      backgroundColor: 'white',
      borderRadius: 1,
      border: '1px solid #e0e0e0',
      minHeight: '64px'
    }}>
      <Typography variant="body2" sx={{ fontWeight: 500, pr: 2, flex: 1 }}>
        {label}
      </Typography>
      {esBooleano ? (
        <Chip 
          label={mostrarSiNo(valor)} 
          size="small"
          color={valor ? "success" : "default"}
          variant={valor ? "filled" : "outlined"}
          sx={{ minWidth: '60px' }}
        />
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', textAlign: 'right', flex: '0 0 auto', maxWidth: '200px', wordBreak: 'break-word' }}>
          {mostrarValor(valor)}
        </Typography>
      )}
    </Box>
  );

  const GrupoItems = ({ titulo, children }) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
        {titulo}
      </Typography>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  );

  return ( 
    <Grid container spacing={3}>
      {/* DATOS DE LA EVALUACIÓN */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              DATOS DE LA EVALUACIÓN
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                    Fecha de Evaluación
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    {formatearFechaSinZonaHoraria(evaluacion.fecha_evaluacion)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                    Motivo de Consulta
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                    {evaluacion.motivo_consulta}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 1. DATOS GENERALES */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              1. DATOS GENERALES
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                    Tipo de Parto
                  </Typography>
                  <Typography variant="body1">{mostrarValor(evaluacion.tipo_parto)}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <ItemConChip label="Estimulación Temprana" valor={evaluacion.estimulacion_temprana} />
              </Grid>

              <Grid item xs={12}>
                <ItemConChip label="Terapias Anteriores" valor={evaluacion.terapias_anteriores} />
              </Grid>

              {evaluacion.observaciones_datos_generales && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>
                      Observaciones
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      {evaluacion.observaciones_datos_generales}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 2. OBSERVACIONES GENERALES */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              2. OBSERVACIONES GENERALES
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ItemConChip label="Nivel de Alerta" valor={evaluacion.nivel_alerta} esBooleano={false} />
              </Grid>
              <Grid item xs={12}>
                <ItemConChip label="Nivel de Atención" valor={evaluacion.nivel_atencion} esBooleano={false} />
              </Grid>
              <Grid item xs={12}>
                <ItemConChip label="Nivel de Actividad" valor={evaluacion.nivel_actividad} esBooleano={false} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 3. COMPONENTE SENSORIAL */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              3. COMPONENTE SENSORIAL
            </Typography>

            {/* Visuales */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Visuales</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}><ItemConChip label="Usa Lentes" valor={evaluacion.usa_lentes} /></Grid>
                <Grid item xs={12}><ItemConChip label="Fijación Visual" valor={evaluacion.fijacion_visual} /></Grid>
                <Grid item xs={12}><ItemConChip label="Contacto Visual" valor={evaluacion.contacto_visual} /></Grid>
                <Grid item xs={12}><ItemConChip label="Seguimiento Visual" valor={evaluacion.seguimiento_visual} /></Grid>
              </Grid>

              {evaluacion.observaciones_visuales && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones:</Typography>
                  <Typography variant="body1">{evaluacion.observaciones_visuales}</Typography>
                </Box>
              )}
            </Box>

            {/* Auditivas */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Auditivas</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}><ItemConChip label="Reconoce Fuentes Sonoras" valor={evaluacion.reconoce_fuentes_sonoras} /></Grid>
                <Grid item xs={12}><ItemConChip label="Busca Sonido" valor={evaluacion.busca_sonido} /></Grid>
              </Grid>

              {evaluacion.observaciones_auditivas && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones:</Typography>
                  <Typography variant="body1">{evaluacion.observaciones_auditivas}</Typography>
                </Box>
              )}
            </Box>

            {/* Táctiles */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Táctiles</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}><ItemConChip label="Desórdenes Modulación" valor={evaluacion.desordenes_modulacion} /></Grid>
                <Grid item xs={12}><ItemConChip label="Hiperresponsividad" valor={evaluacion.hiperresponsividad_tactil} /></Grid>
                <Grid item xs={12}><ItemConChip label="Hiporresponsividad" valor={evaluacion.hiporresponsividad_tactil} /></Grid>
              </Grid>

              {evaluacion.observaciones_tactiles && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones:</Typography>
                  <Typography variant="body1">{evaluacion.observaciones_tactiles}</Typography>
                </Box>
              )}
            </Box>

            {/* Gustativos */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Gustativos</Typography>
              <ItemConChip label="Selectividad en Comidas" valor={evaluacion.selectividad_comidas} />

              {evaluacion.observaciones_gustativos && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones:</Typography>
                  <Typography variant="body1">{evaluacion.observaciones_gustativos}</Typography>
                </Box>
              )}
            </Box>

            {/* Propioceptivo */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Propioceptivo</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}><ItemConChip label="Hiperresponsividad" valor={evaluacion.hiperresponsividad_propioceptivo} /></Grid>
                <Grid item xs={12}><ItemConChip label="Hiporresponsividad" valor={evaluacion.hiporresponsividad_propioceptivo} /></Grid>
              </Grid>

              {evaluacion.observaciones_propioceptivo && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones:</Typography>
                  <Typography variant="body1">{evaluacion.observaciones_propioceptivo}</Typography>
                </Box>
              )}
            </Box>

            {/* Vestibular */}
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Vestibular</Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}><ItemConChip label="Inseguridad Gravitacional" valor={evaluacion.inseguridad_gravitacional} /></Grid>
                <Grid item xs={12}><ItemConChip label="Intolerancia Movimiento" valor={evaluacion.intolerancia_movimiento} /></Grid>
                <Grid item xs={12}><ItemConChip label="Hiporrespuesta Movimiento" valor={evaluacion.hiporrespuesta_movimiento} /></Grid>
              </Grid>

              {evaluacion.observaciones_vestibular && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones:</Typography>
                  <Typography variant="body1">{evaluacion.observaciones_vestibular}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 4. COMPONENTE MOTOR */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              4. COMPONENTE MOTOR
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}><ItemConChip label="Fuerza Muscular" valor={evaluacion.fuerza_muscular} esBooleano={false} /></Grid>
              <Grid item xs={12}><ItemConChip label="Rango Articular" valor={evaluacion.rango_articular} esBooleano={false} /></Grid>
              <Grid item xs={12}><ItemConChip label="Dominación Manual" valor={evaluacion.dominacion_manual} esBooleano={false} /></Grid>
              <Grid item xs={12}><ItemConChip label="Coordinación Bimanual" valor={evaluacion.coordinacion_bimanual} esBooleano={false} /></Grid>
              <Grid item xs={12}><ItemConChip label="Cruce Línea Media" valor={evaluacion.cruce_linea_media} /></Grid>

              {evaluacion.observaciones_motor && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observaciones</Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      {evaluacion.observaciones_motor}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 5. COMPONENTE PSICOLÓGICO */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              5. COMPONENTE PSICOLÓGICO
            </Typography>
            
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>Intereses</Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{mostrarValor(evaluacion.intereses)}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 6. COMPONENTE COGNITIVO */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              6. COMPONENTE COGNITIVO
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}><ItemConChip label="Atención-Concentración" valor={evaluacion.atencion_concentracion} esBooleano={false} /></Grid>
              <Grid item xs={12}><ItemConChip label="Seguimiento de Órdenes" valor={evaluacion.seguimiento_ordenes} esBooleano={false} /></Grid>

              {evaluacion.otros_cognitivo && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Otros</Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      {evaluacion.otros_cognitivo}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 7. AVD */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              7. ACTIVIDADES DE VIDA DIARIA
            </Typography>

            {/* Alimentación */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Alimentación</Typography>
              <ItemConChip label="Nivel de Independencia" valor={evaluacion.alimentacion_independiente} esBooleano={false} />

              {evaluacion.observacion_alimentacion && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observación:</Typography>
                  <Typography variant="body1">{evaluacion.observacion_alimentacion}</Typography>
                </Box>
              )}
            </Box>

            {/* Vestido */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Vestido</Typography>
              
              <GrupoItems titulo="Desvestido">
                <Grid item xs={12}><ItemConChip label="Prenda Superior" valor={evaluacion.desvestido_superior} /></Grid>
                <Grid item xs={12}><ItemConChip label="Prenda Inferior" valor={evaluacion.desvestido_inferior} /></Grid>
              </GrupoItems>

              <GrupoItems titulo="Vestido">
                <Grid item xs={12}><ItemConChip label="Prenda Superior" valor={evaluacion.vestido_superior} /></Grid>
                <Grid item xs={12}><ItemConChip label="Prenda Inferior" valor={evaluacion.vestido_inferior} /></Grid>
              </GrupoItems>

              <GrupoItems titulo="Manejo de Accesorios">
                <Grid item xs={12}><ItemConChip label="Botones" valor={evaluacion.manejo_botones} /></Grid>
                <Grid item xs={12}><ItemConChip label="Cierre" valor={evaluacion.manejo_cierre} /></Grid>
                <Grid item xs={12}><ItemConChip label="Lazos" valor={evaluacion.manejo_lazos} /></Grid>
              </GrupoItems>

              {evaluacion.observacion_vestido && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observación:</Typography>
                  <Typography variant="body1">{evaluacion.observacion_vestido}</Typography>
                </Box>
              )}
            </Box>

            {/* Higiene */}
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Higiene</Typography>
              
              <GrupoItems titulo="Control de Esfínteres">
                <Grid item xs={12}><ItemConChip label="Esfínter Vesical" valor={evaluacion.esfinter_vesical} /></Grid>
                <Grid item xs={12}><ItemConChip label="Esfínter Anal" valor={evaluacion.esfinter_anal} /></Grid>
              </GrupoItems>

              <GrupoItems titulo="Higiene Personal">
                <Grid item xs={12}><ItemConChip label="Lavado de Manos" valor={evaluacion.lavado_manos} /></Grid>
                <Grid item xs={12}><ItemConChip label="Lavado de Cara" valor={evaluacion.lavado_cara} /></Grid>
                <Grid item xs={12}><ItemConChip label="Cepillado de Dientes" valor={evaluacion.cepillado_dientes} /></Grid>
              </GrupoItems>

              {evaluacion.observacion_higiene && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observación:</Typography>
                  <Typography variant="body1">{evaluacion.observacion_higiene}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 8. ÁREA ESCOLAR */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              8. ÁREA ESCOLAR
            </Typography>

            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>Prensión en Lápiz</Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}><ItemConChip label="Imitado" valor={evaluacion.prension_lapiz_imitado} /></Grid>
                <Grid item xs={12}><ItemConChip label="Copiado" valor={evaluacion.prension_lapiz_copiado} /></Grid>
                <Grid item xs={12}><ItemConChip label="Coloreado" valor={evaluacion.prension_lapiz_coloreado} /></Grid>
                <Grid item xs={12}><ItemConChip label="Recortado" valor={evaluacion.recortado} /></Grid>
              </Grid>
              
              <ItemConChip label="Prensión Tijeras" valor={evaluacion.prension_tijeras} esBooleano={false} />
              
              {evaluacion.observacion_escolar && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observación:</Typography>
                  <Typography variant="body1">{evaluacion.observacion_escolar}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 9. ÁREA DEL DESEMPEÑO - JUEGO */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              9. ÁREA DEL DESEMPEÑO - JUEGO
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}><ItemConChip label="Juguetes Preferidos" valor={evaluacion.juguetes_preferidos} esBooleano={false} /></Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 2 }}>Tipo de Juego</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {evaluacion.tipo_juego_sensoriomotor && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%', mr: 2 }} />
                        <Typography variant="body1">Sensoriomotor</Typography>
                      </Box>
                    )}
                    {evaluacion.tipo_juego_simbolico && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%', mr: 2 }} />
                        <Typography variant="body1">Simbólico</Typography>
                      </Box>
                    )}
                    {evaluacion.tipo_juego_otro && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, backgroundColor: '#1976d2', borderRadius: '50%', mr: 2 }} />
                        <Typography variant="body1">Otro</Typography>
                      </Box>
                    )}
                    {!evaluacion.tipo_juego_sensoriomotor && !evaluacion.tipo_juego_simbolico && !evaluacion.tipo_juego_otro && (
                      <Typography variant="body1" sx={{ fontStyle: 'italic' }}>No especificado</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}><ItemConChip label="Lugar Preferido para Jugar" valor={evaluacion.lugar_preferido_jugar} esBooleano={false} /></Grid>

              {evaluacion.observacion_juego && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Observación</Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                      {evaluacion.observacion_juego}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* 10. COMUNICACIÓN */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              10. COMUNICACIÓN
            </Typography>
            
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2', mb: 1 }}>Lenguaje</Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>{mostrarValor(evaluacion.lenguaje)}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* 11. CONCLUSIONES */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              11. CONCLUSIONES
            </Typography>
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              {mostrarValor(evaluacion.conclusiones)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 12. SUGERENCIAS */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              12. SUGERENCIAS
            </Typography>
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              {mostrarValor(evaluacion.sugerencias)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 13. OBJETIVOS INICIALES */}
      <Grid item xs={12}>
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', mb: 3, borderBottom: '2px solid #1976d2', pb: 1 }}>
              13. OBJETIVOS INICIALES
            </Typography>
            
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              {mostrarValor(evaluacion.objetivos_iniciales)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
export default EvaluacionTerapiaOcupacional;