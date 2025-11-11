import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, LinearProgress, Card, CardContent, Chip, Stack, CircularProgress, Snackbar, Alert } from '@mui/material';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getTiposArchivo, subirArchivo, getArchivosPorPaciente, eliminarArchivo, descargarArchivo } from '../../services/archivosDigitalesService';

const ArchivosDigitales = ({ paciente }) => {
  const currentUser = useCurrentUser();
  const [openModal, setOpenModal] = useState(false);
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tipoArchivoId: '',
    descripcion: '',
    archivo: null
  });
  const [errors, setErrors] = useState({});
  const [archivos, setArchivos] = useState([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [openVistaPrevia, setOpenVistaPrevia] = useState(false);
  const [archivoVistaPrevia, setArchivoVistaPrevia] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openConfirmacion, setOpenConfirmacion] = useState(false);
  const [archivoAEliminar, setArchivoAEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [requiereVerificacion, setRequiereVerificacion] = useState('TERAPIA');

  // Obtener tipos de archivo del backend
  useEffect(() => {
    const obtenerTiposArchivo = async () => {
      try {
        const data = await getTiposArchivo();
        setTiposArchivo(data);
      } catch (error) {
        console.error('Error al obtener tipos de archivo:', error);
        // En caso de error, usar tipos por defecto
        setTiposArchivo([
          { id: 1, nombre: 'Informe de evaluación' },
          { id: 2, nombre: 'Receta médica' },
          { id: 3, nombre: 'Consentimiento informado' },
          { id: 4, nombre: 'Otro' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    obtenerTiposArchivo();
  }, []);

  // Cargar archivos del paciente
  useEffect(() => {
    const cargarArchivos = async () => {
      if (!paciente?.id || !currentUser?.id) return;
      
      try {
        setLoadingArchivos(true);
        const data = await getArchivosPorPaciente(currentUser.id, paciente.id);
        setArchivos(data || []);
      } catch (error) {
        console.error('Error al cargar archivos:', error);
        setArchivos([]);
      } finally {
        setLoadingArchivos(false);
      }
    };

    cargarArchivos();
  }, [paciente?.id, currentUser?.id]);

  const validarFormulario = () => {
    const nuevosErrores = {};
    
    if (!form.tipoArchivoId || form.tipoArchivoId === '') {
      nuevosErrores.tipoArchivoId = 'Debe seleccionar un tipo de archivo';
    }
    
    if (!form.descripcion || form.descripcion.trim() === '') {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    }
    
    if (!form.archivo) {
      nuevosErrores.archivo = 'Debe seleccionar un archivo';
    }
    
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleCerrarModal = () => {
    setOpenModal(false);
    setForm({
      tipoArchivoId: '',
      descripcion: '',
      archivo: null
    });
    setErrors({});
    setGuardando(false);
  };

  const handleEliminarArchivo = (archivo) => {
    setArchivoAEliminar(archivo);
    setOpenConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!archivoAEliminar) return;

    try {
      await eliminarArchivo(archivoAEliminar.id);
      // Recargar la lista de archivos
      const archivosActualizados = await getArchivosPorPaciente(currentUser.id, paciente.id);
      setArchivos(archivosActualizados || []);
      mostrarNotificacion('Archivo eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      mostrarNotificacion('Error al eliminar el archivo. Por favor, inténtalo de nuevo.', 'error');
    } finally {
      setOpenConfirmacion(false);
      setArchivoAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setOpenConfirmacion(false);
    setArchivoAEliminar(null);
  };

  const formatearTamano = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVistaPrevia = (archivo) => {
    setArchivoVistaPrevia(archivo);
    setOpenVistaPrevia(true);
  };

  const handleCerrarVistaPrevia = () => {
    setOpenVistaPrevia(false);
    setArchivoVistaPrevia(null);
  };

  const esImagen = (tipoMime) => {
    return tipoMime?.startsWith('image/');
  };

  const esPDF = (tipoMime) => {
    return tipoMime === 'application/pdf';
  };

  const esTexto = (tipoMime) => {
    return tipoMime?.startsWith('text/');
  };

  const puedeVistaPrevia = (archivo) => {
    return esImagen(archivo.tipoMime) || esPDF(archivo.tipoMime) || esTexto(archivo.tipoMime);
  };

  const mostrarNotificacion = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const cerrarNotificacion = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatearTexto = (texto) => {
    if (!texto) return '';
    return texto.replace(/\\r\\n|\\n|\\r/g, '\n');
  };

  const handleDescargarArchivo = async (archivo) => {
    try {
      const blob = await descargarArchivo(archivo.id);
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = archivo.nombreOriginal;
      
      // Agregar al DOM, hacer click y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL del blob
      window.URL.revokeObjectURL(url);
      
      mostrarNotificacion('Archivo descargado exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      mostrarNotificacion('Error al descargar el archivo. Por favor, inténtalo de nuevo.', 'error');
    }
  };

  const handleGuardar = async () => {
    // Validar formulario antes de guardar
    if (!validarFormulario()) {
      return;
    }
    
    setGuardando(true);
    
    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      
      // Agregar el archivo
      formData.append('archivo', form.archivo);
      
      // Obtener información básica del archivo
      const nombreOriginal = form.archivo.name;
      const tipoMime = form.archivo.type;
      const tamano = form.archivo.size;
      const requiereVerificacion = (currentUser?.rol?.id === 1 || currentUser?.rol?.id === 2) 
      ? 'OFICIAL'  // Admin y Admisión suben archivos OFICIALES
      : 'TERAPIA';
      
      // Agregar solo los datos básicos - el backend generará nombreArchivo y rutaArchivo
      formData.append('terapeutaId', currentUser?.id);
      formData.append('tipoArchivoId', form.tipoArchivoId);
      formData.append('pacienteId', paciente?.id || null);
      formData.append('descripcion', form.descripcion);
      formData.append('nombreOriginal', nombreOriginal);
      formData.append('tipoMime', tipoMime);
      formData.append('tamano', tamano);
      formData.append('requiereVerificacion', requiereVerificacion);

      console.log('FormData a enviar al backend:', {
        terapeutaId: currentUser?.id,
        tipoArchivoId: parseInt(form.tipoArchivoId),
        pacienteId: paciente?.id || null,
        descripcion: form.descripcion,
        nombreOriginal: nombreOriginal,
        tipoMime: tipoMime,
        tamano: tamano,
        archivo: form.archivo?.name
      });
      
      // Enviar al servidor usando el servicio
      const data = await subirArchivo(formData);
      console.log('Archivo subido exitosamente:', data);
      
      // Recargar la lista de archivos
      const archivosActualizados = await getArchivosPorPaciente(currentUser.id, paciente.id);
      setArchivos(archivosActualizados || []);
      
      // Mostrar notificación de éxito
      mostrarNotificacion('Archivo subido exitosamente', 'success');
      
      // Cerrar modal y limpiar formulario
      setOpenModal(false);
      setForm({
        tipoArchivoId: '',
        descripcion: '',
        archivo: null
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error al subir archivo:', error);
      mostrarNotificacion('Error al subir el archivo. Por favor, inténtalo de nuevo.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box sx={{ background: '#fff', borderRadius: 2, p: 3, boxShadow: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        mb: 2 
      }}>
        <Typography variant="h6" sx={{ color: '#0097a7', fontWeight: 'bold' }}>
          Archivos digitales
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' }
        }}>          
          <Button 
            variant="contained" 
            sx={{ 
              background: '#4dd0e1', 
              color: '#fff', 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 'bold', 
              boxShadow: 'none',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { background: '#26c6da' } 
            }} 
            startIcon={<AddIcon />} 
            onClick={() => setOpenModal(true)}
          >
            Subir archivo
          </Button>
        </Box>
      </Box>
      {/* Lista de archivos */}
      {loadingArchivos ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : archivos.length === 0 ? (
        <Box sx={{ border: '1px solid #cfd8dc', borderRadius: 2, p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
          <CloudQueueIcon sx={{ fontSize: 60, color: '#b2ebf2', mb: 1 }} />
          <Typography variant="body1" sx={{ color: '#90a4ae', mt: 1 }}>No se encontró ningún archivo médico</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {archivos.map((archivo) => (
            <Card key={archivo.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  mb: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1, 
                    flex: 1,
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <DescriptionIcon sx={{ color: '#1976d2', fontSize: { xs: 20, sm: 24 } }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#333',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {archivo.nombreOriginal}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666', 
                          mb: 1,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-line'
                        }}
                      >
                        {formatearTexto(archivo.descripcion)}
                      </Typography>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={1} 
                        sx={{ 
                          mb: 1,
                          flexWrap: 'wrap',
                          gap: 0.5
                        }}
                      >
                        <Chip 
                          label={archivo.tipoArchivo?.nombre || 'Sin tipo'} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                        <Chip 
                          label={formatearTamano(archivo.tamano)} 
                          size="small" 
                          color="default" 
                          variant="outlined"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                        <Chip 
                          label={formatearFecha(archivo.fechaCreacion)} 
                          size="small" 
                          color="default" 
                          variant="outlined"
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            display: { xs: 'none', md: 'flex' }
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 0.5, sm: 1 },
                    alignSelf: { xs: 'flex-end', sm: 'flex-start' },
                    flexWrap: 'wrap'
                  }}>
                    {puedeVistaPrevia(archivo) && (
                      <IconButton 
                        size="small" 
                        color="info"
                        title="Vista previa"
                        onClick={() => handleVistaPrevia(archivo)}
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          p: { xs: 0.5, sm: 1 }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      color="primary"
                      title="Descargar archivo"
                      onClick={() => handleDescargarArchivo(archivo)}
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      title="Eliminar archivo"
                      onClick={() => handleEliminarArchivo(archivo)}
                      sx={{ 
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        p: { xs: 0.5, sm: 1 }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal para subir archivo */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            maxHeight: { xs: '95vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 'bold' }}>
          NUEVO ARCHIVO
          <IconButton onClick={handleCerrarModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Terapeuta"
              value={currentUser?.nombres + ' ' + currentUser?.apellidos || ''}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: '#f5f5f5',
                  color: '#666'
                }
              }}
            />
            <FormControl fullWidth error={!!errors.tipoArchivoId}>
              <InputLabel>Nombre del archivo *</InputLabel>
              <Select
                value={form.tipoArchivoId}
                label="Nombre del archivo *"
                onChange={e => {
                  setForm({ ...form, tipoArchivoId: e.target.value });
                  if (errors.tipoArchivoId) {
                    setErrors({ ...errors, tipoArchivoId: '' });
                  }
                }}
                disabled={loading}
              >
                {tiposArchivo.map((tipo) => (
                  <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                ))}
              </Select>
              {errors.tipoArchivoId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.tipoArchivoId}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              required
              label="Descripción *"
              multiline
              minRows={2}
              value={form.descripcion}
              onChange={e => {
                setForm({ ...form, descripcion: e.target.value });
                if (errors.descripcion) {
                  setErrors({ ...errors, descripcion: '' });
                }
              }}
              error={!!errors.descripcion}
              helperText={errors.descripcion}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                sx={{ 
                  borderStyle: 'dashed', 
                  borderColor: errors.archivo ? '#d32f2f' : '#b2ebf2', 
                  color: errors.archivo ? '#d32f2f' : '#0097a7', 
                  minHeight: 120, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1,
                  width: '100%'
                }}
              >
                {form.archivo ? form.archivo.name : 'Arrastra y suelta uno o más archivos en esta zona o haz click aquí para seleccionarlos...'}
                <input
                  type="file"
                  hidden
                  onChange={e => {
                    setForm({ ...form, archivo: e.target.files[0] });
                    if (errors.archivo) {
                      setErrors({ ...errors, archivo: '' });
                    }
                  }}
                />
              </Button>
              {errors.archivo && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.archivo}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" sx={{ color: '#757575', mt: 1 }}>
              Tamaño de la carga total y tamaño máximo por archivo: 10MB.<br/>                            
            </Typography>
          </Box>
        </DialogContent>
                 <DialogActions>
           <Button 
             onClick={handleCerrarModal} 
             color="secondary"
             disabled={guardando}
           >
             Cancelar
           </Button>
           <Button 
             onClick={handleGuardar} 
             color="primary" 
             variant="contained"
             disabled={guardando}
             startIcon={guardando ? <CircularProgress size={16} color="inherit" /> : null}
           >
             {guardando ? 'Guardando...' : 'Guardar'}
           </Button>
         </DialogActions>
      </Dialog>

      {/* Modal de Vista Previa */}
      <Dialog 
        open={openVistaPrevia} 
        onClose={handleCerrarVistaPrevia} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { 
            height: { xs: '95vh', sm: '90vh' },
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          fontWeight: 'bold',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              wordBreak: 'break-word',
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Vista Previa - {archivoVistaPrevia?.nombreOriginal}
          </Typography>
          <IconButton onClick={handleCerrarVistaPrevia}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '100%' }}>
          {archivoVistaPrevia && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Información del archivo */}
              <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 1, sm: 2 }} 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <DescriptionIcon sx={{ color: '#1976d2', fontSize: { xs: 20, sm: 24 } }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {archivoVistaPrevia.nombreOriginal}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#666',
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {formatearTexto(archivoVistaPrevia.descripcion)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    ml: { xs: 0, sm: 'auto' },
                    width: { xs: '100%', sm: 'auto' }
                  }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={1}
                      sx={{ 
                        flexWrap: 'wrap',
                        gap: 0.5
                      }}
                    >
                      <Chip 
                        label={archivoVistaPrevia.tipoArchivo?.nombre || 'Sin tipo'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                      <Chip 
                        label={formatearTamano(archivoVistaPrevia.tamano)} 
                        size="small" 
                        color="default" 
                        variant="outlined"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Contenido de vista previa */}
              <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                {esImagen(archivoVistaPrevia.tipoMime) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <img 
                      src={`https://www.crecemos.com.pe/backend_api/${archivoVistaPrevia.rutaArchivo}`}
                      alt={archivoVistaPrevia.nombreOriginal}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        display: 'none', 
                        color: '#666', 
                        textAlign: 'center',
                        p: 4
                      }}
                    >
                      No se pudo cargar la imagen
                    </Typography>
                  </Box>
                )}

                {esPDF(archivoVistaPrevia.tipoMime) && (
                  <Box sx={{ height: '100%', width: '100%' }}>
                    <iframe
                      src={`https://www.crecemos.com.pe/backend_api/${archivoVistaPrevia.rutaArchivo}#toolbar=1&navpanes=1&scrollbar=1`}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title={archivoVistaPrevia.nombreOriginal}
                    />
                  </Box>
                )}

                {esTexto(archivoVistaPrevia.tipoMime) && (
                  <Box sx={{ height: '100%', width: '100%' }}>
                    <iframe
                      src={`https://www.crecemos.com.pe/backend_api/${archivoVistaPrevia.rutaArchivo}`}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', borderRadius: '8px' }}
                      title={archivoVistaPrevia.nombreOriginal}
                    />
                  </Box>
                )}

                {!puedeVistaPrevia(archivoVistaPrevia) && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    textAlign: 'center',
                    p: 4
                  }}>
                    <DescriptionIcon sx={{ fontSize: 64, color: '#b2ebf2', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                      Vista previa no disponible
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Este tipo de archivo no se puede previsualizar. 
                      <br />
                      Usa el botón de descarga para abrirlo.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarVistaPrevia} color="secondary">
            Cerrar
          </Button>
          <Button 
            color="primary" 
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleDescargarArchivo(archivoVistaPrevia)}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación para Eliminar */}
      <Dialog
        open={openConfirmacion}
        onClose={cancelarEliminacion}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            m: { xs: 1, sm: 2 }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 2 }, 
          pb: 1,
          borderBottom: '1px solid #e0e0e0',
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <WarningIcon sx={{ color: '#f44336', fontSize: { xs: 24, sm: 28 } }} />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#333',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Confirmar Eliminación
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666', 
                mt: 0.5,
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
              Esta acción no se puede deshacer
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: { xs: 2, sm: 3 }, pb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: { xs: 1, sm: 2 }, 
            p: { xs: 1.5, sm: 2 }, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 2, 
            border: '1px solid #e0e0e0',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <DescriptionIcon sx={{ color: '#1976d2', fontSize: { xs: 24, sm: 32 } }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  color: '#333', 
                  mb: 0.5,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  wordBreak: 'break-word'
                }}
              >
                {archivoAEliminar?.nombreOriginal}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#666', 
                  mb: 1,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line'
                }}
              >
                {formatearTexto(archivoAEliminar?.descripcion)}
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1}
                sx={{ 
                  flexWrap: 'wrap',
                  gap: 0.5
                }}
              >
                <Chip 
                  label={archivoAEliminar?.tipoArchivo?.nombre || 'Sin tipo'} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
                <Chip 
                  label={formatearTamano(archivoAEliminar?.tamano || 0)} 
                  size="small" 
                  color="default" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              </Stack>
            </Box>
          </Box>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mt: { xs: 2, sm: 3 }, 
              textAlign: 'center', 
              color: '#333',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            ¿Estás seguro de que quieres eliminar este archivo?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          pt: 2, 
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button 
            onClick={cancelarEliminacion} 
            color="inherit"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              px: { xs: 2, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmarEliminacion} 
            color="error" 
            variant="contained"
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              px: { xs: 2, sm: 3 },
              width: { xs: '100%', sm: 'auto' },
              boxShadow: 'none',
              order: { xs: 1, sm: 2 },
              '&:hover': {
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)'
              }
            }}
            startIcon={<DeleteIcon />}
          >
            Eliminar Archivo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          mt: { xs: 6, sm: 8 },
          mx: { xs: 1, sm: 0 }
        }}
      >
        <Alert 
          onClose={cerrarNotificacion} 
          severity={snackbar.severity} 
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            minWidth: { xs: 'auto', sm: 300 },
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-message': {
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ArchivosDigitales; 