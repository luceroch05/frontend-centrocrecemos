import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  IconButton,
  Fab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Componentes
import ModalAgendarCita from '../components/Agenda/ModalAgendarCita';
import CalendarioSemanal from '../components/Agenda/CalendarioSemanal';

// Datos y utilidades
import { 
  diasSemana, 
  horas, 
  servicios, 
  duraciones,
  citasEjemplo
} from '../constants/agendaData';
import { getEstadoColor, getEstadoIcon } from '../utils/agendaUtils';
import { useCitas } from '../hooks/useCitas';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useTrabajadores } from '../hooks/useTrabajadores';
import { ROLES } from '../constants/roles';

const Agenda = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [modalAbierto, setModalAbierto] = useState(false);
  const [slotSeleccionado, setSlotSeleccionado] = useState(null);
  const [terapeutaFiltro, setTerapeutaFiltro] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [citaEditando, setCitaEditando] = useState(null); // Para saber si estamos editando
  const [guardando, setGuardando] = useState(false); // Estado para controlar el proceso de guardado
  const [formularioCita, setFormularioCita] = useState({
    paciente: null,
    doctor_id: '',
    servicio_id: '',
    motivo_id: '',
    duracion: '',
    fechasHoras: [],
    nota: ''
  });

  // Obtener usuario actual
  const currentUser = useCurrentUser();
  
  // Hook de trabajadores (para el filtro de terapeutas)
  const { trabajadores } = useTrabajadores();
  
  // Hook de citas (listar + crear + actualizar + eliminar)
  const { citas, loading, error, listarCitas, crearCita, crearMultiplesCitas, actualizarCita, eliminarCita } = useCitas();
  
  // Cargar citas al montar y al cambiar de semana o filtro
  React.useEffect(() => {
    if (!currentUser) return; // Esperar a que se cargue el usuario
    
    // Si el usuario es terapeuta, filtrar por su ID
    if (currentUser.rol?.id === ROLES.TERAPEUTA) {
      listarCitas({ terapeuta_id: currentUser.id });
    } 
    // Si es administrador/admisión y hay un terapeuta seleccionado en el filtro
    else if ((currentUser.rol?.id === ROLES.ADMINISTRADOR || currentUser.rol?.id === ROLES.ADMISION) && terapeutaFiltro) {
      listarCitas({ terapeuta_id: terapeutaFiltro });
    } 
    // Para admisión sin filtro específico
    else if (currentUser.rol?.id === ROLES.ADMISION) {
      listarCitas(); // ADMISION puede ver todas las citas
    }
  }, [currentUser, terapeutaFiltro]);

  // Recargar citas cuando cambie la fecha del calendario
  React.useEffect(() => {
    if (!currentUser) return;
    
    // Recargar citas cuando cambie la semana en el calendario
    if (currentUser.rol?.id === ROLES.TERAPEUTA) {
      listarCitas({ terapeuta_id: currentUser.id });
    } else if ((currentUser.rol?.id === ROLES.ADMINISTRADOR || currentUser.rol?.id === ROLES.ADMISION) && terapeutaFiltro) {
      listarCitas({ terapeuta_id: terapeutaFiltro });
    } else if (currentUser.rol?.id === ROLES.ADMISION) {
      listarCitas();
    }
  }, [fechaActual]);

  // Función para formatear hora a formato HH:mm
  const formatearHora = (hora) => {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  };

  // Handlers para el modal

  // Abrir modal al hacer clic en un slot vacío del calendario
  const abrirModalDesdeSlot = (dia, hora) => {
    setSlotSeleccionado({ 
      dia: dia.nombre, 
      hora,
      fecha: dia.fechaString 
    });

    const doctorId = currentUser?.rol?.id === ROLES.TERAPEUTA 
      ? currentUser.id 
      : terapeutaFiltro;

    setFormularioCita(prev => ({
      ...prev,
      paciente: null,
      doctor_id: doctorId,
      servicio_id: '',
      motivo_id: '',
      duracion: '',
      fechasHoras: [{ fecha: dia.fechaString, horaInicio: formatearHora(hora) }],
      nota: ''
    }));
    setModalAbierto(true);
  };

  // Función para abrir modal desde botón flotante
  const abrirModalNuevaCita = () => {
    // Determinar el doctor_id: si es terapeuta usa su ID, si es admin usa el del filtro
    const doctorId = currentUser?.rol?.id === ROLES.TERAPEUTA 
      ? currentUser.id 
      : terapeutaFiltro;
    
    // Obtener fecha actual formateada (YYYY-MM-DD)
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];
    
    setSlotSeleccionado(null); // No hay slot específico
    setFormularioCita({
      paciente: null,
      doctor_id: doctorId,
      servicio_id: '',
      motivo_id: '',
      duracion: '',
      fechasHoras: [],
      nota: ''
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSlotSeleccionado(null);
    setCitaEditando(null);
    setFormularioCita({
      paciente: null,
      doctor_id: '',
      servicio_id: '',
      motivo_id: '',
      duracion: '',
      fechasHoras: [],
      nota: ''
    });
  };

  const manejarCambioFormulario = (campo, valor) => {
    if (campo === 'agregarFechaHora') {
      setFormularioCita(prev => ({
        ...prev,
        fechasHoras: [...prev.fechasHoras, { fecha: '', horaInicio: '' }]
      }));
    } else if (campo === 'eliminarFechaHora') {
      setFormularioCita(prev => ({
        ...prev,
        fechasHoras: prev.fechasHoras.filter((_, index) => index !== valor)
      }));
    } else if (campo === 'actualizarFechaHora') {
      setFormularioCita(prev => ({
        ...prev,
        fechasHoras: prev.fechasHoras.map((fh, index) => 
          index === valor.index 
            ? { ...fh, [valor.campo]: valor.valor }
            : fh
        )
      }));
    } else {
    setFormularioCita(prev => ({
      ...prev,
      [campo]: valor
    }));
    }
  };

  const guardarCita = async () => {
    setGuardando(true); // Activar estado de guardando
    try {
      // Validar campos requeridos
      const validaciones = [];
      
      if (!formularioCita.paciente?.id) {
        validaciones.push('Debe seleccionar un paciente');
      }
      if (!formularioCita.doctor_id) {
        validaciones.push('Debe seleccionar un terapeuta');
      }
      if (!formularioCita.servicio_id) {
        validaciones.push('Debe seleccionar un servicio');
      }
      if (!formularioCita.motivo_id) {
        validaciones.push('Debe seleccionar un motivo');
      }
      if (!formularioCita.duracion) {
        validaciones.push('Debe seleccionar una duración');
      }
      if (!formularioCita.fechasHoras || formularioCita.fechasHoras.length === 0) {
        validaciones.push('Debe agregar al menos una fecha y hora');
      } else {
        formularioCita.fechasHoras.forEach((fh, index) => {
          if (!fh.fecha) {
            validaciones.push(`Debe seleccionar una fecha para la cita ${index + 1}`);
          }
          if (!fh.horaInicio) {
            validaciones.push(`Debe seleccionar una hora para la cita ${index + 1}`);
          }
        });
      }

      if (validaciones.length > 0) {
        setSnackbar({ 
          open: true, 
          message: `Por favor complete los siguientes campos:\n• ${validaciones.join('\n• ')}`, 
          severity: 'error' 
        });
        setGuardando(false); // Desactivar estado de guardando
        return;
      }

      // Detectar si estamos editando o creando
      if (citaEditando) {
        // Para edición, solo actualizamos la primera cita (mantenemos compatibilidad)
        const primeraCita = {
        paciente_id: formularioCita.paciente?.id,
        doctor_id: formularioCita.doctor_id,
        servicio_id: formularioCita.servicio_id,
        motivo_id: formularioCita.motivo_id,
          fecha: formularioCita.fechasHoras[0].fecha,
          hora_inicio: formularioCita.fechasHoras[0].horaInicio + ':00',
        duracion_minutos: parseInt(formularioCita.duracion),
        nota: formularioCita.nota,
        user_id: currentUser?.id,
        estado_id: 1
      };
        await actualizarCita(citaEditando.id, primeraCita);
        setSnackbar({ open: true, message: 'Cita actualizada correctamente', severity: 'success' });
      } else {
        // Crear múltiples citas - enviar array al backend
        const citasParaCrear = formularioCita.fechasHoras.map(fechaHora => ({
          paciente_id: formularioCita.paciente?.id,
          doctor_id: formularioCita.doctor_id,
          servicio_id: formularioCita.servicio_id,
          motivo_id: formularioCita.motivo_id,
          fecha: fechaHora.fecha,
          hora_inicio: fechaHora.horaInicio + ':00',
          duracion_minutos: parseInt(formularioCita.duracion),
          nota: formularioCita.nota,
          user_id: currentUser?.id,
          estado_id: 1
        }));

        const resultados = await crearMultiplesCitas(citasParaCrear);
        
        const cantidadCitas = resultados.length;
        setSnackbar({ 
          open: true, 
          message: `${cantidadCitas} cita${cantidadCitas > 1 ? 's' : ''} agendada${cantidadCitas > 1 ? 's' : ''} correctamente`, 
          severity: 'success' 
        });
      }
      
      // Esperar 1 segundo para que el usuario vea el mensaje antes de cerrar
      await new Promise(resolve => setTimeout(resolve, 1000));
      cerrarModal();
    } catch (error) {
      // Extraer el mensaje de error del servidor
      let mensajeError = citaEditando ? 'Error al actualizar la cita' : 'Error al agendar la cita';
      
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setSnackbar({ open: true, message: mensajeError, severity: 'error' });
    } finally {
      setGuardando(false); // Siempre desactivar estado de guardando
    }
  };

  const handleEliminarCita = async () => {
    if (!citaEditando?.id) return;
    
    try {
      const resultado = await eliminarCita(citaEditando.id, currentUser?.id);
      
      // Mostrar mensaje de éxito con información de la cita eliminada
      const mensaje = resultado.message || 'Cita eliminada exitosamente';
      setSnackbar({ 
        open: true, 
        message: mensaje,
        severity: 'success' 
      });
      
      cerrarModal();
    } catch (error) {
      // Extraer el mensaje de error del servidor
      let mensajeError = 'Error al eliminar la cita';
      
      if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setSnackbar({ open: true, message: mensajeError, severity: 'error' });
    }
  };

  // Verificar si debe mostrar la agenda
  const debeSeleccionarTerapeuta = (currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && !terapeutaFiltro;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh', mt: { xs: 6, md: 7 } }}>
      {/* Título de la página */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#424242', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <CalendarIcon sx={{ color: '#A3C644', fontSize: 40 }} />
          Agenda de Citas
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#757575', 
            mt: 1,
            fontSize: '1.1rem'
          }}
        >
          Gestiona y organiza las citas de tus pacientes
        </Typography>
      </Box>

      {/* Header con filtros y acciones */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        p: 3,
        backgroundColor: '#ffffff',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid rgba(163,198,68,0.1)'
      }}>
        {/* Lado izquierdo - Filtros */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ color: '#424242', fontWeight: 'bold', mr: 2 }}>
            Filtros
          </Typography>
          
          {/* Filtro de Terapeuta - Para Administrador y Admisión */}
          {(currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && (
            <FormControl 
              sx={{ 
                minWidth: 220,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { 
                    borderColor: '#A3C644',
                    borderRadius: 2
                  },
                  '&:hover fieldset': { 
                    borderColor: '#8fb23a',
                    boxShadow: '0 0 0 2px rgba(163,198,68,0.1)'
                  },
                  '&.Mui-focused fieldset': { 
                    borderColor: '#A3C644',
                    boxShadow: '0 0 0 3px rgba(163,198,68,0.15)'
                  }
                },
                '& .MuiInputLabel-root.Mui-focused': { 
                  color: '#A3C644',
                  fontWeight: 'bold'
                }
              }}
            >
              <InputLabel>Terapeuta *</InputLabel>
              <Select
                value={terapeutaFiltro}
                label="Terapeuta *"
                onChange={(e) => setTerapeutaFiltro(e.target.value)}
                sx={{ 
                  backgroundColor: '#fafafa',
                  '& .MuiSelect-select': {
                    py: 1.5
                  }
                }}
              >
                <MenuItem value="">
                  <em>Seleccione un terapeuta</em>
                </MenuItem>
                {trabajadores && trabajadores.length > 0 ? (
                  trabajadores
                    .filter(t => {
                      // Manejar diferentes estructuras: rol_id o rol.id
                      const rolId = t.rol_id || t.rol?.id;
                      return rolId === ROLES.TERAPEUTA;
                    })
                    .map((terapeuta) => (
                      <MenuItem key={terapeuta.id} value={terapeuta.id}>
                        {terapeuta.nombres} {terapeuta.apellidos}
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>
                    <em>Cargando terapeutas...</em>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* Lado derecho - Acciones */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#A3C644',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(163,198,68,0.3)',
              '&:hover': { 
                backgroundColor: '#8fb23a',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(163,198,68,0.4)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            Nueva Cita
          </Button> */}
        </Box>
      </Box>

      {/* Mensaje para seleccionar terapeuta */}
      {debeSeleccionarTerapeuta ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '400px',
          backgroundColor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          p: 4
        }}>
          <CalendarIcon sx={{ fontSize: 80, color: '#A3C644', mb: 3, opacity: 0.6 }} />
          <Typography variant="h5" sx={{ color: '#424242', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
            Seleccione un terapeuta para ver su agenda
          </Typography>
          <Typography variant="body1" sx={{ color: '#757575', textAlign: 'center', maxWidth: 500 }}>
            Por favor, utilice el filtro de terapeuta en la parte superior para seleccionar al profesional cuya agenda desea visualizar.
          </Typography>
        </Box>
      ) : (
        /* Calendario semanal */
        <CalendarioSemanal
        horas={horas}
        citas={citas}
          onSlotClick={abrirModalDesdeSlot}
        onCitaClick={({ fecha, hora, cita }) => {
            // Solo permitir ver/editar citas existentes
            const horaInicioCita = cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : hora;
            setSlotSeleccionado({ dia: '', hora: horaInicioCita, fecha });
            setCitaEditando(cita); // Guardar la cita completa que se está editando
          setFormularioCita({
              fechasHoras: [{ fecha, horaInicio: formatearHora(horaInicioCita) }],
            // Crear objeto paciente con la estructura que espera el Autocomplete
            paciente: cita.paciente_id ? {
              id: cita.paciente_id,
              nombre_completo: cita.paciente_nombre
            } : null,
            doctor_id: cita.doctor_id || '',
            servicio_id: cita.servicio_id || '',
            motivo_id: cita.motivo_id || '',
            duracion: String(cita.duracion_minutos || ''),
            nota: cita.nota || ''
          });
          setModalAbierto(true);
        }}
        getEstadoColor={getEstadoColor}
        getEstadoIcon={getEstadoIcon}
        fechaActual={fechaActual}
        onFechaChange={setFechaActual}
          currentUser={currentUser}
      />
      )}

      {/* Botón flotante para nueva cita - Solo para ADMINISTRADOR y ADMISION */}
      {(currentUser?.rol?.id === ROLES.ADMINISTRADOR || currentUser?.rol?.id === ROLES.ADMISION) && (
        <Fab
        color="primary"
        aria-label="add"
          onClick={abrirModalNuevaCita}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          backgroundColor: '#A3C644',
          width: 64,
          height: 64,
          boxShadow: '0 8px 24px rgba(163,198,68,0.4)',
          '&:hover': { 
            backgroundColor: '#8fb23a',
            transform: 'scale(1.1)',
            boxShadow: '0 12px 32px rgba(163,198,68,0.5)'
          },
          '&:active': {
            transform: 'scale(0.95)'
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
        </Fab>
      )}

      {/* Modal para agendar cita */}
      <ModalAgendarCita
        open={modalAbierto}
        onClose={cerrarModal}
        slotSeleccionado={slotSeleccionado}
        formularioCita={formularioCita}
        onFormularioChange={manejarCambioFormulario}
        onGuardar={guardarCita}
        onEliminar={handleEliminarCita}
        servicios={servicios}
        duraciones={duraciones}
        terapeutaSeleccionado={
          currentUser?.rol?.id === ROLES.TERAPEUTA 
            ? currentUser 
            : trabajadores.find(t => t.id === terapeutaFiltro)
        }
        modoEdicion={!!citaEditando}
        citaEditando={citaEditando}
        currentUser={currentUser}
        guardando={guardando}
      />

      {/* Snackbar para mensajes de éxito/error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'error' ? 8000 : 6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            maxWidth: '600px',
            '& .MuiAlert-message': {
              width: '100%',
              whiteSpace: 'pre-line'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Agenda;
