import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarTodayIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import { ROLES } from '../../constants/roles';

const CalendarioSemanal = ({
  horas,
  citas,
  onSlotClick,
  onCitaClick,
  getEstadoColor,
  getEstadoIcon,
  fechaActual,
  onFechaChange,
  currentUser = null
}) => {
  const [diasSemana, setDiasSemana] = useState([]);

  // Calcular los días de la semana basado en la fecha actual
  useEffect(() => {
    const calcularDiasSemana = (fecha) => {
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - fecha.getDay() + 1);
      
      const dias = Array.from({length: 7}, (_, i) => {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + i);
        return {
          nombre: dia.toLocaleDateString('es-ES', { weekday: 'long' }),
          numero: dia.getDate(),
          fecha: new Date(dia),
          fechaString: dia.toISOString().split('T')[0]
        };
      });
      return dias;
    };

    setDiasSemana(calcularDiasSemana(fechaActual));
  }, [fechaActual]);

  // Helpers de tiempo
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
    return h * 60 + (m || 0);
  };
  const getSlotMinutes = () => {
    if (!horas || horas.length < 2) return 60;
    return Math.abs(toMinutes(horas[1].padStart(5, '0')) - toMinutes(horas[0].padStart(5, '0')));
  };
  const slotDurationMin = getSlotMinutes();

  const getCitasEnSlot = (dia, hora) => {
    // Obtener todas las citas para este día y hora
    const citasEnSlot = citas.filter(c => {
      // Verificar fecha
      if (c.fecha !== dia.fechaString) return false;
      
      const start = c.hora_inicio ? c.hora_inicio.substring(0,5) : (c.hora || null);
      if (!start) return false;
      
      const startMin = toMinutes(start.padStart(5, '0'));
      const endMin = c.hora_fin ? toMinutes(c.hora_fin.substring(0,5)) : (c.duracion_minutos ? startMin + parseInt(c.duracion_minutos,10) : startMin + slotDurationMin);
      const slotStart = toMinutes(hora.padStart(5, '0'));
      const slotEnd = slotStart + slotDurationMin;
      
      // Mejorada: Una cita aparece en un slot si hay intersección entre rangos
      // La cita se superpone con el slot si:
      // - La cita empieza antes de que termine el slot Y
      // - La cita termina después de que empieza el slot
      const cumple = startMin < slotEnd && endMin > slotStart;
      
      return cumple;
    });

    if (citasEnSlot.length === 0) return null;

    // Para cada cita, calcular si es la primera (isTop) y su altura
    return citasEnSlot.map(cita => {
      const start = cita.hora_inicio ? cita.hora_inicio.substring(0,5) : (cita.hora || '00:00');
      const startMin = toMinutes(start.padStart(5, '0'));
      const endMin = cita.hora_fin ? toMinutes(cita.hora_fin.substring(0,5)) : (cita.duracion_minutos ? startMin + parseInt(cita.duracion_minutos,10) : startMin + slotDurationMin);
      const slotStart = toMinutes(hora.padStart(5, '0'));
      const slotEnd = slotStart + slotDurationMin;
      
      // isTop: Este es el primer slot donde se dibuja la cita
      // Debe ser el slot que contiene el inicio de la cita O el primer slot si la cita empezó antes
      const isTop = startMin >= slotStart && startMin < slotEnd;
      const isBottom = endMin <= slotEnd;
      
      // Calcular altura total basada en duración
      const duracionMinutos = cita.duracion_minutos || (endMin - startMin);
      const alturaPorSlot = 60; // altura de cada fila en px
      const alturaTotal = (duracionMinutos / slotDurationMin) * alturaPorSlot;
      
      return { cita, isTop, isBottom, alturaTotal };
    });
  };

  const navegarSemana = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setDate(fechaActual.getDate() + (direccion * 7));
    onFechaChange(nuevaFecha);
  };

  const irAHoy = () => {
    onFechaChange(new Date());
  };

  const formatearRangoSemana = () => {
    if (diasSemana.length === 0) return '';
    const inicio = diasSemana[0];
    const fin = diasSemana[6];
    
    const mesInicio = inicio.fecha.toLocaleDateString('es-ES', { month: 'short' });
    const mesFin = fin.fecha.toLocaleDateString('es-ES', { month: 'short' });
    
    // Si es el mismo mes, mostrar solo una vez
    if (inicio.fecha.getMonth() === fin.fecha.getMonth()) {
      return `${inicio.numero} - ${fin.numero} ${mesInicio} ${fin.fecha.getFullYear()}`;
    } else {
      return `${inicio.numero} ${mesInicio} - ${fin.numero} ${mesFin} ${fin.fecha.getFullYear()}`;
    }
  };

  const formatearHora = (hhmm) => {
    if (!hhmm) return '';
    const [h, m] = hhmm.split(':');
    const numH = parseInt(h, 10);
    // Mostrar sin cero a la izquierda: 9:00 en vez de 09:00
    return `${numH}:${m}`;
  };

  const obtenerHoraFin = (cita) => {
    if (cita.hora_fin) return formatearHora(cita.hora_fin.substring(0, 5));
    if (cita.hora_inicio && cita.duracion_minutos) {
      const [h, m] = cita.hora_inicio.substring(0,5).split(':').map(x => parseInt(x, 10));
      const total = h * 60 + m + parseInt(cita.duracion_minutos, 10);
      const hh = Math.floor(total / 60) % 24;
      const mm = total % 60;
      return formatearHora(`${hh.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}`);
    }
    return '';
  };

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Header de navegación */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => navegarSemana(-1)}
            sx={{ 
              backgroundColor: '#A3C644', 
              color: 'white',
              '&:hover': { backgroundColor: '#8fb23a' }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton 
            onClick={() => navegarSemana(1)}
            sx={{ 
              backgroundColor: '#A3C644', 
              color: 'white',
              '&:hover': { backgroundColor: '#8fb23a' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<CalendarTodayIcon />}
            onClick={irAHoy}
            sx={{
              backgroundColor: '#A3C644',
              '&:hover': { backgroundColor: '#8fb23a' },
              ml: 1,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Hoy
          </Button>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#424242' }}>
          {formatearRangoSemana()}
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ width: '120px', fontWeight: 'bold', color: '#424242' }}>
                Hora
              </TableCell>
              {diasSemana.map((dia) => {
                const esHoy = dia.fechaString === new Date().toISOString().split('T')[0];
                return (
                <TableCell 
                    key={dia.fechaString} 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#424242',
                    textAlign: 'center',
                      backgroundColor: esHoy ? '#e8f5e8' : 'transparent',
                      border: esHoy ? '2px solid #A3C644' : '1px solid #e0e0e0'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {dia.nombre}
                      </Typography>
                      <Typography variant="h6" sx={{ color: esHoy ? '#A3C644' : '#666' }}>
                        {dia.numero}
                      </Typography>
                    </Box>
                </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {horas.map((hora) => (
              <TableRow key={hora} sx={{ height: '60px' }}>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#666',
                    backgroundColor: '#f8f9fa',
                    borderRight: '1px solid #e0e0e0'
                  }}
                >
                  {hora}
                </TableCell>
                {diasSemana.map((dia) => {
                  const citasInfo = getCitasEnSlot(dia, hora);
                  const esHoy = dia.fechaString === new Date().toISOString().split('T')[0];
                  const hayCitas = citasInfo && citasInfo.length > 0;
                  const esTerapeuta = currentUser?.rol?.id === ROLES.TERAPEUTA;
                  const puedeHacerClic = !hayCitas && !esTerapeuta; // Solo admin/admisión pueden hacer clic en slots vacíos
                  
                  return (
                    <TableCell 
                      key={`${dia.fechaString}-${hora}`} 
                      onClick={() => puedeHacerClic && onSlotClick(dia, hora)}
                      sx={{ 
                        position: 'relative',
                        backgroundColor: 'transparent',
                        border: '1px solid #e0e0e0',
                        cursor: puedeHacerClic ? 'pointer' : 'default',
                        '&:hover': {
                          backgroundColor: puedeHacerClic ? '#f5f5f5' : 'transparent'
                        }
                      }}
                    >
                      {citasInfo && citasInfo.map((slotInfo, index) => {
                        const cita = slotInfo.cita;
                        if (!slotInfo.isTop) return null;
                        
                        // Calcular posición y ancho para múltiples citas
                        const totalCitas = citasInfo.filter(c => c.isTop).length;
                        const anchoCita = totalCitas === 1 ? 'calc(100% - 4px)' : `calc(${100 / totalCitas}% - 2px)`;
                        const indiceCitaVisible = citasInfo.filter(c => c.isTop).findIndex(c => c.cita.id === cita.id);
                        const leftOffset = totalCitas === 1 ? 2 : (100 / totalCitas) * indiceCitaVisible;
                        
                        return (
                          <Box
                            key={`${cita.id}-${index}`}
                            onClick={() => onCitaClick && onCitaClick({
                              id: cita.id,
                              fecha: dia.fechaString,
                              hora: hora,
                              cita
                            })}
                            sx={{
                              position: 'absolute',
                              top: 2,
                              left: `${leftOffset}%`,
                              width: anchoCita,
                              height: `${slotInfo.alturaTotal}px`,
                              backgroundColor: '#e3f2fd',
                              border: '1px solid #e0e0e0',
                              borderLeft: `4px solid ${getEstadoColor(cita.estado)}`,
                              borderRadius: 1,
                              p: 0.8,
                              display: 'flex',
                              flexDirection: 'column',
                              cursor: 'pointer',
                              zIndex: 1 + index,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              overflow: 'hidden', // Evitar que el contenido se salga
                              '&:hover': {
                                backgroundColor: '#dbeeff',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            {/* Nombre del paciente - más compacto */}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                fontWeight: 'bold', 
                                color: '#1976d2',
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {(cita.paciente_nombre || cita.paciente || 'Paciente').substring(0, 20)}
                              {(cita.paciente_nombre || cita.paciente || 'Paciente').length > 20 ? '...' : ''}
                            </Typography>
                            
                            {/* Servicio - más compacto */}
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#666', 
                                fontSize: '0.65rem',
                                lineHeight: 1.1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {(cita.servicio_nombre || 'Servicio').substring(0, 15)}
                              {(cita.servicio_nombre || 'Servicio').length > 15 ? '...' : ''}
                            </Typography>
                            
                            {/* Hora y duración en una línea */}
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mt: 0.3
                            }}>
                              <Typography variant="caption" sx={{ 
                                color: '#666', 
                                fontSize: '0.6rem',
                                fontWeight: 'bold'
                              }}>
                                {formatearHora(cita.hora_inicio ? cita.hora_inicio.substring(0, 5) : hora)}-{obtenerHoraFin(cita)}
                              </Typography>
                              <Chip
                                label={`${cita.duracion_minutos || 60}m`}
                                size="small"
                                sx={{ 
                                  height: 14, 
                                  fontSize: '0.55rem',
                                  backgroundColor: '#bdbdbd',
                                  color: 'white',
                                  '& .MuiChip-label': { px: 0.5 }
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CalendarioSemanal;
