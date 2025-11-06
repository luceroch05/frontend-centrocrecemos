import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Stack,
  Badge,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Close,
  CheckCircle,
  ContentCopy,
  PersonSearch,
  CalendarToday,
  AttachFile,
  FilePresent,
  Search,
  FilterList,
  Download,
  Delete,
  Visibility,
  MoreVert,
  FolderOpen,
  Article,
  CheckCircleOutline,
  ErrorOutline,
  TrendingUp,
  InsertDriveFile,
  Person,
  Work,
} from '@mui/icons-material';
import TopMenu from '../components/TopMenu';
import { getPacientesAll } from '../services/pacienteService';
import { getTrabajadores } from '../services/trabajadorService';
import archivosOficialesService from '../services/archivosOficialesService';
import { getTiposDocumento } from '../services/tiposArchivoService';
import { useMemo } from 'react';

const GestionArchivosOficiales = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para Dashboard
  const [documentos, setDocumentos] = useState([]);
  const [documentosFiltrados, setDocumentosFiltrados] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [dialogVer, setDialogVer] = useState(false);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  
  // Estados para Formulario de Subida
  const [tipoDestinatario, setTipoDestinatario] = useState('paciente'); // 'paciente' o 'trabajador'
  const [formData, setFormData] = useState({
    pacienteId: '',
    trabajadorId: '',
    terapeutaId: '',
    tipoArchivoId: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVigencia: '',
    descripcion: '',
    codigoManual: '',
  });
  const [archivo, setArchivo] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [pacientes, setPacientes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [terapeutas, setTerapeutas] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState(null);
  const [terapeutaSeleccionado, setTerapeutaSeleccionado] = useState(null);
  const [dialogExito, setDialogExito] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tiposArchivo, setTiposArchivo] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [codigoGeneradoPreview, setCodigoGeneradoPreview] = useState('');
  const [loadingCodigoPreview, setLoadingCodigoPreview] = useState(false);
  const [errorFechaVigencia, setErrorFechaVigencia] = useState('');

  const [tiposArchivoCompletos, setTiposArchivoCompletos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  const [datosInicializados, setDatosInicializados] = useState(false);


  useEffect(() => {
    if (datosInicializados) return; // ✅ Evitar segunda ejecución
    
    const inicializar = async () => {
      await cargarDatosIniciales();
      await cargarTiposArchivo();
      setDatosInicializados(true); 
    };
    inicializar();
  }, [datosInicializados]);

  useEffect(() => {
    if (tabValue === 0 && documentos.length === 0 && datosInicializados) {
      cargarDocumentos();
    }
  }, [tabValue, datosInicializados]);  // ✅ Solo depende del tab

  useEffect(() => {
    let filtered = [...documentos];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => {
        const pacienteNombre = doc.paciente 
          ? `${doc.paciente.nombres} ${doc.paciente.apellido_paterno} ${doc.paciente.apellido_materno}`.toLowerCase()
          : '';
        const trabajadorNombre = doc.trabajador
          ? `${doc.trabajador.nombres} ${doc.trabajador.apellidos}`.toLowerCase()
          : '';
        
        return doc.codigoValidacion?.toLowerCase().includes(term) ||
              pacienteNombre.includes(term) ||
              trabajadorNombre.includes(term) ||
              doc.tipoArchivo?.nombre?.toLowerCase().includes(term) ||
              doc.nombreArchivo?.toLowerCase().includes(term);
      });
    }

    if (filtroTipo) {
      filtered = filtered.filter(doc => doc.tipoArchivo?.id === filtroTipo);
    }

    setDocumentosFiltrados(filtered);
  }, [searchTerm, filtroTipo, documentos]);
    const cargarDatosIniciales = async () => {
      try {
        setLoadingData(true);
        
        const resPacientes = await getPacientesAll();
        const pacientesData = resPacientes.data || resPacientes;
        setPacientes(pacientesData);

        const resTrabajadores = await getTrabajadores();
        const trabajadoresData = resTrabajadores.data || resTrabajadores;
        
        // Filtrar trabajadores (todos excepto los terapeutas que se usan como responsables)
        const trabajadoresFiltrados = Array.isArray(trabajadoresData)
          ? trabajadoresData.filter(t => t && typeof t === 'object' && t.nombres)
          : [];
        
        setTrabajadores(trabajadoresFiltrados);

        // Filtrar solo terapeutas para el campo de responsable
        const terapeutasFiltrados = Array.isArray(trabajadoresData)
          ? trabajadoresData.filter(
              (t) => t && typeof t === 'object' && t.nombres && t.rol && t.rol.id === 4
            )
          : [];
         

        setTerapeutas(terapeutasFiltrados);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos iniciales');
      } finally {
        setLoadingData(false);
      }
    };

  const tiposArchivoFiltrados = useMemo(() => {
    return tiposArchivoCompletos.filter(tipo => 
      tipo.destinatario_tipo === tipoDestinatario || tipo.destinatario_tipo === 'ambos'
    );
  }, [tiposArchivoCompletos, tipoDestinatario]);


// ✅ 3. Función para calcular vigencia
const calcularFechaVigencia = (fechaEmision, vigenciaMeses) => {
  if (!vigenciaMeses || !fechaEmision) return '';
  
  const fecha = new Date(fechaEmision + 'T00:00:00');
  fecha.setMonth(fecha.getMonth() + vigenciaMeses);
  
  return fecha.toISOString().split('T')[0];
};
  const cargarDocumentos = async () => {
    try {
      setLoadingDocs(true);
      const response = await archivosOficialesService.listarArchivos();
      const docs = response.data || response;
      setDocumentos(Array.isArray(docs) ? docs : []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setError('Error al cargar los documentos');
    } finally {
      setLoadingDocs(false);
    }
  };

  // ✅ 4. Modificar handleTipoArchivoChange
const handleTipoArchivoChange = (e) => {
  const tipoId = e.target.value;
  const tipo = tiposArchivoFiltrados.find(t => t.id == tipoId);
  
  setTipoSeleccionado(tipo);
  
  // Calcular vigencia automáticamente
  const fechaVigenciaCalculada = tipo?.vigencia_meses 
    ? calcularFechaVigencia(formData.fechaEmision, tipo.vigencia_meses)
    : '';
  
  setFormData(prev => ({
    ...prev,
    tipoArchivoId: tipoId,
    fechaVigencia: fechaVigenciaCalculada,
  }));
  
  setError('');
};

// ✅ 5. Modificar cargarTiposArchivo para cargar TODOS los tipos (sin filtrar)
const cargarTiposArchivo = async () => {
  try {
    setLoadingTipos(true);
    const response = await getTiposDocumento();
    const tipos = response || [];
    
    // ✅ Guardar TODOS los tipos para el filtro del dashboard
    setTiposArchivo(tipos);
    
    // ✅ Guardar también para el formulario (se filtrarán después)
    setTiposArchivoCompletos(tipos);
  } catch (error) {
    console.error('Error al cargar tipos de archivo:', error);
    setError('Error al cargar los tipos de documento');
  } finally {
    setLoadingTipos(false);
  }
};
// ✅ 6. Recalcular vigencia al cambiar fecha de emisión
const handleFechaEmisionChange = (e) => {
  const nuevaFechaEmision = e.target.value;
  
  const fechaVigenciaCalculada = tipoSeleccionado?.vigencia_meses
    ? calcularFechaVigencia(nuevaFechaEmision, tipoSeleccionado.vigencia_meses)
    : formData.fechaVigencia;
  
  setFormData(prev => ({
    ...prev,
    fechaEmision: nuevaFechaEmision,
    fechaVigencia: fechaVigenciaCalculada,
  }));
};

  const generarCodigoPreview = async () => {
    try {
      setLoadingCodigoPreview(true);
      setError('');
      
      const response = await archivosOficialesService.generarCodigoPreview();
      const codigo = response.data?.codigo || response.codigo;
      
      setCodigoGeneradoPreview(codigo);
      setFormData(prev => ({ ...prev, codigoManual: codigo }));
      
      setSuccess('Código generado. Añádalo al documento antes de subirlo.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error al generar código:', error);
      setError('Error al generar código preview');
    } finally {
      setLoadingCodigoPreview(false);
    }
  };


  const handleMenuOpen = (event, documento) => {
    setAnchorEl(event.currentTarget);
    setDocumentoSeleccionado(documento);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVerDocumento = () => {
    setDialogVer(true);
    handleMenuClose();
  };

  const handleDescargar = async () => {
    try {
      await archivosOficialesService.descargarArchivo(documentoSeleccionado.id);
      setSuccess('Archivo descargado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error al descargar el archivo');
    }
    handleMenuClose();
  };

  const handleVisualizar = () => {
    archivosOficialesService.visualizarArchivo(documentoSeleccionado.id);
    handleMenuClose();
  };

  const handleEliminarClick = () => {
    setDialogEliminar(true);
    handleMenuClose();
  };

  const handleEliminarConfirmar = async () => {
    try {
      await archivosOficialesService.eliminarArchivo(documentoSeleccionado.id);
      setSuccess('Documento eliminado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      // ✅ Recargar solo si estamos en el tab de documentos
      if (tabValue === 0) {
        cargarDocumentos();
      }
      
      setDialogEliminar(false);
      setDocumentoSeleccionado(null);
    } catch (error) {
      setError('Error al eliminar el documento');
      setDialogEliminar(false);
    }
  };

  // ✅ NUEVO: Manejar cambio de tipo de destinatario
  const handleTipoDestinatarioChange = (event) => {
    const nuevoTipo = event.target.value;
    setTipoDestinatario(nuevoTipo);
    
    // Limpiar campos del tipo anterior
    if (nuevoTipo === 'paciente') {
      setTrabajadorSeleccionado(null);
      setFormData(prev => ({ ...prev, trabajadorId: '', pacienteId: '' }));
    } else {
      setPacienteSeleccionado(null);
      setFormData(prev => ({ ...prev, pacienteId: '', trabajadorId: '' }));
    }
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = { ...prev, [name]: value };
      
      if (name === 'fechaEmision' || name === 'fechaVigencia') {
        validarFechas(
          name === 'fechaEmision' ? value : newFormData.fechaEmision,
          name === 'fechaVigencia' ? value : newFormData.fechaVigencia
        );
      }
      
      return newFormData;
    });
    setError('');
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const tiposPermitidos = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'image/jpeg',
        'image/png',
      ];

      if (!tiposPermitidos.includes(file.type)) {
        setError('Solo se permiten archivos PDF, Word (.doc, .docx), JPG y PNG');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no debe superar los 10 MB');
        return;
      }

      setArchivo(file);
      setError('');
    }
  };

  const handleRemoverArchivo = () => {
    setArchivo(null);
    const input = document.getElementById('file-upload');
    if (input) input.value = '';
  };

  const validarFormulario = () => {
    // ✅ VALIDACIÓN ACTUALIZADA
  if (!formData.pacienteId && !formData.trabajadorId) {
    setError('Debe seleccionar un paciente o un trabajador');
    return false;
  }
  if (formData.pacienteId && formData.trabajadorId) {
    setError('No puede seleccionar paciente y trabajador al mismo tiempo');
    return false;
  }
  
  // ✅ SOLO validar terapeuta si es paciente
  if (tipoDestinatario === 'paciente' && !formData.terapeutaId) {
    setError('Debe seleccionar el terapeuta responsable');
    return false;
  }
    if (!formData.tipoArchivoId) {
      setError('Debe seleccionar el tipo de archivo');
      return false;
    }
    if (!archivo) {
      setError('Debe seleccionar un archivo');
      return false;
    }
    if (!formData.fechaEmision) {
      setError('Debe indicar la fecha de emisión');
      return false;
    }
    if (!validarFechas(formData.fechaEmision, formData.fechaVigencia)) {
      setErrorFechaVigencia('La fecha de vigencia no puede ser anterior a la fecha de emisión');
      return false;
    }
    return true;
  };

    const handleSubmit = async () => {
      if (!validarFormulario()) return;
      
      try {
        setLoadingForm(true);
        setError('');
        
        const resultado = await archivosOficialesService.subirArchivo(archivo, formData);
        
        if (resultado.success) {
          setCodigoGenerado(resultado.data);
          setDialogExito(true);
          
          // Resetear formulario
          setFormData({
            pacienteId: '',
            trabajadorId: '',
            terapeutaId: '',
            tipoArchivoId: '',
            fechaEmision: new Date().toISOString().split('T')[0],
            fechaVigencia: '',
            descripcion: '',
            codigoManual: '',
          });
          setPacienteSeleccionado(null);
          setTrabajadorSeleccionado(null);
          setTerapeutaSeleccionado(null);
          setArchivo(null);
          setCodigoGeneradoPreview('');
          setTipoDestinatario('paciente');
          setTipoSeleccionado(null); // ✅ Agregar
          
          const input = document.getElementById('file-upload');
          if (input) input.value = '';
          
          // ❌ ELIMINAR ESTA LÍNEA:
          // await cargarDocumentos(); 
          // ✅ Ya no es necesario porque se recargará al cambiar al tab 0
        }
      } catch (err) {
        console.error('Error al subir archivo:', err);
        setError(err.message || 'Error al subir el archivo. Intente nuevamente.');
      } finally {
        setLoadingForm(false);
      }
    };

  const copiarCodigo = () => {
    if (codigoGenerado?.codigoValidacion) {
      navigator.clipboard.writeText(codigoGenerado.codigoValidacion);
    }
  };

  const validarFechas = (fechaEmision, fechaVigencia) => {
    if (fechaVigencia && fechaEmision) {
      const fechaEmisionDate = new Date(fechaEmision);
      const fechaVigenciaDate = new Date(fechaVigencia);
      
      if (fechaVigenciaDate < fechaEmisionDate) {
        setErrorFechaVigencia('La fecha de vigencia no puede ser anterior a la fecha de emisión');
        return false;
      }
    }
    setErrorFechaVigencia('');
    return true;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const fechaSolo = fecha.split('T')[0].split(' ')[0];
    const [año, mes, dia] = fechaSolo.split('-');
    const fechaCorrecta = new Date(Date.UTC(parseInt(año), parseInt(mes) - 1, parseInt(dia)));
    
    return fechaCorrecta.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  };

  // ✅ NUEVA FUNCIÓN: Obtener nombre del destinatario
  const obtenerNombreDestinatario = (doc) => {
    if (doc.paciente) {
      return `${doc.paciente.nombres} ${doc.paciente.apellido_paterno} ${doc.paciente.apellido_materno}`;
    }
    if (doc.trabajador) {
      return `${doc.trabajador.nombres} ${doc.trabajador.apellidos}`;
    }
    return '-';
  };

  if (loadingData) {
    return (
      <Box sx={{ pt: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#A3C644' }} size={60} />
      </Box>
    );
  }

  return (
    <><Box sx={{
      pt: 10,
      px: { xs: 2, sm: 3, md: 4 },
      pb: 4,
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh'
    }}>
      <TopMenu/>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Hero Header */}
        <Box sx={{
          mb: 4,
          p: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(163, 198, 68, 0.2), transparent 50%)',
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #A3C644 0%, #8AB030 100%)',
                boxShadow: '0 8px 24px rgba(163, 198, 68, 0.4)'
              }}>
                <InsertDriveFile sx={{ fontSize: 40, color: '#fff' }} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{
                  fontWeight: 800,
                  color: '#fff',
                  mb: 0.5,
                  fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
                }}>
                  Archivos Oficiales
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Sistema de gestión documental para pacientes y trabajadores
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
              <Box sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                background: 'rgba(163, 198, 68, 0.15)',
                border: '1px solid rgba(163, 198, 68, 0.3)'
              }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                  Total Documentos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#A3C644' }}>
                  {documentos.length}
                </Typography>
              </Box>
              <Box sx={{
                px: 3,
                py: 1.5,
                borderRadius: 2,
                background: 'rgba(163, 198, 68, 0.15)',
                border: '1px solid rgba(163, 198, 68, 0.3)'
              }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block' }}>
                  Este Mes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#A3C644' }}>
                  +{Math.floor(documentos.length * 0.3)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 3,
              border: '1px solid #ef4444',
              background: '#fef2f2'
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 3,
              border: '1px solid #22c55e',
              background: '#f0fdf4'
            }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Modern Tabs */}
        <Paper sx={{
          borderRadius: 4,
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          background: '#fff'
        }}>
          <Box sx={{
            borderBottom: '1px solid #e2e8f0',
            background: 'linear-gradient(to right, #fafafa, #f5f5f5)'
          }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                px: 2,
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  minHeight: 64,
                  color: '#64748b',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#A3C644',
                    background: 'rgba(163, 198, 68, 0.05)'
                  }
                },
                '& .Mui-selected': {
                  color: '#A3C644 !important',
                  fontWeight: 700
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  background: 'linear-gradient(90deg, #A3C644 0%, #8AB030 100%)'
                }
              }}
            >
              <Tab
                icon={<FolderOpen />}
                iconPosition="start"
                label="Mis Documentos" />
              <Tab
                icon={<CloudUpload />}
                iconPosition="start"
                label="Subir Nuevo" />
            </Tabs>
          </Box>

          {/* TAB 1: DASHBOARD */}
          {tabValue === 0 && (
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Search & Filters */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Buscar por código, paciente, trabajador, tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f8fafc',
                        '&:hover': {
                          background: '#f1f5f9'
                        },
                        '&.Mui-focused': {
                          background: '#fff',
                          boxShadow: '0 0 0 3px rgba(163, 198, 68, 0.1)'
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#A3C644', fontSize: 24 }} />
                        </InputAdornment>
                      ),
                    }} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de documento"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f8fafc'
                      }
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {tiposArchivo.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm('');
                      setFiltroTipo('');
                    } }
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      borderWidth: 2,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      fontWeight: 600,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#A3C644',
                        background: 'rgba(163, 198, 68, 0.05)'
                      }
                    }}
                  >
                    Limpiar
                  </Button>
                </Grid>
              </Grid>

              {/* Table */}
              {loadingDocs ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress sx={{ color: '#A3C644' }} size={50} />
                </Box>
              ) : documentosFiltrados.length === 0 ? (
                <Paper sx={{
                  p: 8,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                  borderRadius: 3,
                  border: '2px dashed #e2e8f0'
                }}>
                  <Article sx={{ fontSize: 100, color: '#cbd5e1', mb: 3 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>
                    No hay documentos
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {searchTerm || filtroTipo ? 'Intenta ajustar los filtros' : 'Sube tu primer documento oficial'}
                  </Typography>
                </Paper>
              ) : (
                <>
                  <TableContainer sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Código</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Destinatario</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tipo</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Categoría</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Terapeuta</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documentosFiltrados
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((doc) => (
                            <TableRow
                              key={doc.id}
                              hover
                              sx={{
                                '&:hover': {
                                  background: 'rgba(163, 198, 68, 0.03)'
                                }
                              }}
                            >
                              <TableCell>
                                <Chip
                                  label={doc.codigoValidacion}
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    letterSpacing: 1
                                  }} />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {doc.paciente ? (
                                    <Person sx={{ fontSize: 18, color: '#3b82f6' }} />
                                  ) : (
                                    <Work sx={{ fontSize: 18, color: '#f59e0b' }} />
                                  )}
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {obtenerNombreDestinatario(doc)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                      {doc.paciente ? 'Paciente' : 'Trabajador'}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={doc.tipoArchivo?.nombre || '-'}
                                  size="small"
                                  sx={{
                                    background: '#f1f5f9',
                                    fontWeight: 600
                                  }} />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={doc.paciente ? 'Paciente' : 'Trabajador'}
                                  size="small"
                                  sx={{
                                    background: doc.paciente
                                      ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                                      : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                    color: doc.paciente ? '#1e40af' : '#92400e',
                                    fontWeight: 600
                                  }} />
                              </TableCell>
                              <TableCell sx={{ color: '#64748b' }}>
                                {`${doc.terapeuta?.nombres || ''} ${doc.terapeuta?.apellidos || ''}`}
                              </TableCell>
                              <TableCell sx={{ color: '#64748b' }}>
                                {formatearFecha(doc.fechaEmision)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={doc.estado === 'Activo' ? <CheckCircleOutline /> : <ErrorOutline />}
                                  label={doc.estado || 'Activo'}
                                  size="small"
                                  sx={{
                                    background: doc.estado === 'Activo'
                                      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                      : '#f1f5f9',
                                    color: doc.estado === 'Activo' ? '#fff' : '#64748b',
                                    fontWeight: 600
                                  }} />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, doc)}
                                  sx={{
                                    color: '#A3C644',
                                    '&:hover': {
                                      background: 'rgba(163, 198, 68, 0.1)'
                                    }
                                  }}
                                >
                                  <MoreVert />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={documentosFiltrados.length}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    } }
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={{ borderTop: '1px solid #e2e8f0', mt: 2 }} />
                </>
              )}

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    mt: 1
                  }
                }}
              >
                <MenuItem onClick={handleVerDocumento} sx={{ py: 1.5 }}>
                  <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                  <ListItemText>Ver Detalles</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleVisualizar} sx={{ py: 1.5 }}>
                  <ListItemIcon><Article fontSize="small" /></ListItemIcon>
                  <ListItemText>Abrir Archivo</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDescargar} sx={{ py: 1.5 }}>
                  <ListItemIcon><Download fontSize="small" /></ListItemIcon>
                  <ListItemText>Descargar</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleEliminarClick} sx={{ color: 'error.main', py: 1.5 }}>
                  <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                  <ListItemText>Eliminar</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* TAB 2: FORMULARIO SUBIDA */}
          {tabValue === 1 && (
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Grid container spacing={3}>
                {/* Paso 1: Generar Código */}
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 4,
                      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                      border: '2px solid #fbbf24',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      mb: 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent)',
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)'
                      }}>
                        <CheckCircle sx={{ fontSize: 32, color: '#fff' }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#78350f', mb: 0.5 }}>
                          Paso 1: Generar Código de Validación
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#92400e' }}>
                          Genera el código primero, añádelo al documento, luego sube el archivo
                        </Typography>
                      </Box>
                    </Stack>

                    {!codigoGeneradoPreview ? (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={generarCodigoPreview}
                        disabled={loadingCodigoPreview}
                        sx={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          fontWeight: 700,
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)',
                          textTransform: 'none',
                          fontSize: '1rem',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            boxShadow: '0 10px 25px rgba(245, 158, 11, 0.5)',
                          }
                        }}
                        startIcon={loadingCodigoPreview ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Description />}
                      >
                        {loadingCodigoPreview ? 'Generando...' : 'Generar Código Único'}
                      </Button>
                    ) : (
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Paper sx={{
                          p: 4,
                          background: '#fff',
                          border: '3px solid #22c55e',
                          borderRadius: 3,
                          mb: 3,
                          boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)'
                        }}>
                          <Typography variant="caption" sx={{
                            fontWeight: 700,
                            color: '#166534',
                            display: 'block',
                            mb: 2,
                            letterSpacing: 1
                          }}>
                            ✓ CÓDIGO GENERADO
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                fontFamily: 'monospace',
                                color: '#22c55e',
                                letterSpacing: 4,
                                flex: 1,
                              }}
                            >
                              {codigoGeneradoPreview}
                            </Typography>
                            <Tooltip title="Copiar código">
                              <IconButton
                                onClick={() => {
                                  navigator.clipboard.writeText(codigoGeneradoPreview);
                                  setSuccess('Código copiado');
                                  setTimeout(() => setSuccess(''), 3000);
                                } }
                                sx={{
                                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                  color: '#fff',
                                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                    transform: 'scale(1.05)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Paper>

                        <Alert
                          severity="warning"
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            border: '1px solid #f59e0b',
                            background: '#fffbeb',
                            '& .MuiAlert-icon': {
                              color: '#f59e0b'
                            }
                          }}
                        >
                          <strong>IMPORTANTE:</strong> Añada este código al documento antes de subirlo.
                        </Alert>

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setCodigoGeneradoPreview('');
                            setFormData(prev => ({ ...prev, codigoManual: '' }));
                          } }
                          sx={{
                            borderColor: '#f59e0b',
                            color: '#f59e0b',
                            borderRadius: 2,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#d97706',
                              background: 'rgba(245, 158, 11, 0.05)'
                            }
                          }}
                        >
                          Generar Otro Código
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }}>
                    <Chip
                      label="Paso 2: Complete la información"
                      sx={{
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                        px: 2
                      }} />
                  </Divider>
                </Grid>

                {/* ✅ NUEVO: Selector de tipo de destinatario */}
                <Grid item xs={12}>
                  <Paper sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: 3,
                    border: '2px solid #cbd5e1'
                  }}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend" sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 2,
                        fontSize: '1.1rem'
                      }}>
                        ¿Para quién es este documento?
                      </FormLabel>
                      <RadioGroup
                        row
                        value={tipoDestinatario}
                        onChange={handleTipoDestinatarioChange}
                      >
                        <FormControlLabel
                          value="paciente"
                          control={<Radio sx={{ color: '#3b82f6', '&.Mui-checked': { color: '#3b82f6' } }} />}
                          label={<Stack direction="row" alignItems="center" spacing={1}>
                            <Person sx={{ color: '#3b82f6' }} />
                            <Typography sx={{ fontWeight: 600 }}>Paciente</Typography>
                          </Stack>}
                          sx={{
                            mr: 4,
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            border: tipoDestinatario === 'paciente' ? '2px solid #3b82f6' : '2px solid transparent',
                            background: tipoDestinatario === 'paciente' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                            transition: 'all 0.2s ease'
                          }} />
                        <FormControlLabel
                          value="trabajador"
                          control={<Radio sx={{ color: '#f59e0b', '&.Mui-checked': { color: '#f59e0b' } }} />}
                          label={<Stack direction="row" alignItems="center" spacing={1}>
                            <Work sx={{ color: '#f59e0b' }} />
                            <Typography sx={{ fontWeight: 600 }}>Trabajador</Typography>
                          </Stack>}
                          sx={{
                            px: 3,
                            py: 1.5,
                            borderRadius: 2,
                            border: tipoDestinatario === 'trabajador' ? '2px solid #f59e0b' : '2px solid transparent',
                            background: tipoDestinatario === 'trabajador' ? 'rgba(245, 158, 11, 0.05)' : 'transparent',
                            transition: 'all 0.2s ease'
                          }} />
                      </RadioGroup>
                    </FormControl>
                  </Paper>
                </Grid>

                {/* ✅ Selector condicional: Paciente O Trabajador */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      {tipoDestinatario === 'paciente' ? (
                        <>
                          <Person sx={{ fontSize: 22, color: '#3b82f6' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Seleccionar Paciente
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Work sx={{ fontSize: 22, color: '#f59e0b' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            Seleccionar Trabajador
                          </Typography>
                        </>
                      )}
                    </Stack>

                   {tipoDestinatario === 'paciente' ? (
                      <Autocomplete
                        options={pacientes}
                        getOptionLabel={(option) => `${option.nombres} ${option.apellido_paterno} ${option.apellido_materno} - ${option.numero_documento}`}
                        value={pacienteSeleccionado}
                        onChange={(e, newValue) => {
                        
                          setPacienteSeleccionado(newValue);
                          setFormData(prev => ({ 
                            ...prev, 
                            pacienteId: newValue?.id || newValue?.paciente_id || '', 
                            trabajadorId: '' 
                          }));
                          setError(''); // Limpiar error al seleccionar
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Buscar paciente por nombre o DNI..."
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: '#f8fafc',
                                '&:hover': {
                                  background: '#f1f5f9'
                                }
                              }
                            }} />
                        )}
                        noOptionsText="No se encontraron pacientes" />
                    ) : (
                      <Autocomplete
                        options={trabajadores}
                        getOptionLabel={(option) => `${option.nombres} ${option.apellidos}${option.dni ? ` - ${option.dni}` : ''}`}
                        value={trabajadorSeleccionado}
                        onChange={(e, newValue) => {
                         
                          setTrabajadorSeleccionado(newValue);
                          setFormData(prev => ({ 
                            ...prev, 
                            trabajadorId: newValue?.id || newValue?.trabajador_id || '', 
                            pacienteId: '' 
                          }));
                          setError(''); // Limpiar error al seleccionar
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Buscar trabajador por nombre..."
                            fullWidth
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: '#f8fafc',
                                '&:hover': {
                                  background: '#f1f5f9'
                                }
                              }
                            }} />
                        )}
                        noOptionsText="No se encontraron trabajadores" />
                    )}
                  </Box>
                </Grid>

              {/* Terapeuta Responsable - SOLO para pacientes */}
              {tipoDestinatario === 'paciente' && (
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <PersonSearch sx={{ fontSize: 22, color: '#A3C644' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        Terapeuta Responsable
                      </Typography>
                    </Stack>
                    <Autocomplete
                      options={terapeutas}
                      getOptionLabel={(option) => `${option.nombres} ${option.apellidos}${option.dni ? ` - ${option.dni}` : ''}`}
                      value={terapeutaSeleccionado}
                      onChange={(e, newValue) => {
                        setTerapeutaSeleccionado(newValue);
                        setFormData(prev => ({ ...prev, terapeutaId: newValue?.id || '' }));
                      } }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Seleccionar terapeuta..."
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              background: '#f8fafc'
                            }
                          }} />
                      )}
                      noOptionsText="No se encontraron terapeutas" />
                  </Box>
                </Grid>
              )}

                {/* Tipo y Fecha */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Description sx={{ fontSize: 22, color: '#A3C644' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Tipo de Documento
                    </Typography>
                  </Stack>
                  <TextField
                    select
                    fullWidth
                    name="tipoArchivoId"
                    value={formData.tipoArchivoId}
                    onChange={handleTipoArchivoChange}
                    placeholder="Seleccionar tipo..."
                    disabled={loadingTipos}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f8fafc'
                      }
                    }}
                  >
                    {loadingTipos ? (
                      <MenuItem disabled>Cargando...</MenuItem>
                    ) : (
                      tiposArchivoFiltrados.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                            <Typography>{tipo.nombre}</Typography>
                            {tipo.vigencia_meses && (
                              <Chip 
                                label={`${tipo.vigencia_meses} ${tipo.vigencia_meses === 1 ? 'mes' : 'meses'}`}
                                size="small"
                                sx={{ 
                                  ml: 2,
                                  background: '#dcfce7', 
                                  color: '#166534',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>

                {tipoSeleccionado && (
              <Grid item xs={12}>
                <Alert
                  severity={tipoSeleccionado.vigencia_meses ? "success" : "info"}
                  sx={{ borderRadius: 3 }}
                >
                  {tipoSeleccionado.vigencia_meses ? (
                    <>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        ✓ Vigencia: {tipoSeleccionado.vigencia_meses} {tipoSeleccionado.vigencia_meses === 1 ? 'mes' : 'meses'}
                      </Typography>
                      {formData.fechaVigencia && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                          Vence el: <strong>{formatearFecha(formData.fechaVigencia)}</strong>
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2">
                      ∞ Este documento no tiene fecha de vencimiento
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}


                {/* Fecha Emisión */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <CalendarToday sx={{ fontSize: 22, color: '#A3C644' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Fecha de Emisión
                    </Typography>
                  </Stack>
                  <TextField
                    type="date"
                    fullWidth
                    name="fechaEmision"
                    value={formData.fechaEmision}
                    onChange={handleFechaEmisionChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f8fafc'
                      }
                    }}
                  />
                </Grid>
                {/* Fecha Vigencia */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                    Fecha de Vigencia <span style={{ color: '#94a3b8' }}>(Opcional)</span>
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    name="fechaVigencia"
                    value={formData.fechaVigencia}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errorFechaVigencia}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f8fafc',
                        '&.Mui-error': {
                          borderColor: '#dc2626',
                          '&:hover fieldset': {
                            borderColor: '#dc2626',
                          },
                        }
                      }
                    }} />
                  {errorFechaVigencia && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#dc2626',
                        display: 'block',
                        mt: 1,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    >
                      {errorFechaVigencia}
                    </Typography>
                  )}
                </Grid>

                {/* Descripción */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                    Descripción <span style={{ color: '#94a3b8' }}>(Opcional)</span>
                  </Typography>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Detalles adicionales sobre el documento..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: '#f8fafc'
                      }
                    }} />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 3 }} />
                </Grid>

                {/* Subir Archivo */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <AttachFile sx={{ fontSize: 22, color: '#A3C644' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Archivo
                    </Typography>
                    <Chip
                      label="PDF, Word, JPG, PNG - Máx. 10MB"
                      size="small"
                      sx={{ background: '#f1f5f9', fontWeight: 600 }} />
                  </Stack>

                  {!archivo ? (
                    <Paper
                      sx={{
                        p: 6,
                        textAlign: 'center',
                        border: '3px dashed #cbd5e1',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: 4,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                          borderColor: '#A3C644',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(163, 198, 68, 0.2)'
                        },
                      }}
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      <CloudUpload sx={{ fontSize: 80, color: '#A3C644', mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1, color: '#1e293b', fontWeight: 700 }}>
                        Haz clic para seleccionar
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        o arrastra y suelta aquí
                      </Typography>
                      <input
                        id="file-upload"
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleArchivoChange} />
                    </Paper>
                  ) : (
                    <Paper sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      borderRadius: 3,
                      border: '2px solid #22c55e',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)'
                    }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                          }}>
                            <FilePresent sx={{ fontSize: 40, color: '#fff' }} />
                          </Box>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#166534' }}>
                              {archivo.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#15803d' }}>
                              {(archivo.size / 1024 / 1024).toFixed(2)} MB
                            </Typography>
                          </Box>
                        </Stack>
                        <IconButton
                          onClick={handleRemoverArchivo}
                          sx={{
                            color: '#dc2626',
                            '&:hover': {
                              background: 'rgba(220, 38, 38, 0.1)'
                            }
                          }}
                        >
                          <Close />
                        </IconButton>
                      </Stack>
                    </Paper>
                  )}
                </Grid>

                {/* Botón Submit */}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loadingForm}
                    sx={{
                      mt: 3,
                      py: 2,
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      textTransform: 'none',
                      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(163, 198, 68, 0.3), transparent)',
                        transition: 'left 0.5s ease'
                      },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                        boxShadow: '0 15px 40px rgba(15, 23, 42, 0.4)',
                        transform: 'translateY(-2px)',
                        '&::before': {
                          left: '100%'
                        }
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={loadingForm ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : <CloudUpload sx={{ fontSize: 28 }} />}
                  >
                    {loadingForm ? 'Subiendo archivo...' : 'Subir Archivo Oficial'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          )}
        </Paper>
      </Box>

      {/* Dialog Ver Detalles */}
      <Dialog
        open={dialogVer}
        onClose={() => setDialogVer(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          p: 3
        }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(163, 198, 68, 0.2)'
              }}>
                <Article sx={{ fontSize: 28, color: '#A3C644' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Detalles del Documento
              </Typography>
            </Stack>
            <IconButton onClick={() => setDialogVer(false)} sx={{ color: '#fff' }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, p: 4 }}>
          {documentoSeleccionado && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 3,
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.3)'
                }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: 1 }}>
                    CÓDIGO DE VALIDACIÓN
                  </Typography>
                  <Typography variant="h4" sx={{
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: '#A3C644',
                    letterSpacing: 3,
                    mt: 1
                  }}>
                    {documentoSeleccionado.codigoValidacion}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  DESTINATARIO
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  {documentoSeleccionado.paciente ? (
                    <Person sx={{ fontSize: 20, color: '#3b82f6' }} />
                  ) : (
                    <Work sx={{ fontSize: 20, color: '#f59e0b' }} />
                  )}
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {obtenerNombreDestinatario(documentoSeleccionado)}
                    </Typography>
                    <Chip
                      label={documentoSeleccionado.paciente ? 'Paciente' : 'Trabajador'}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: documentoSeleccionado.paciente
                          ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                          : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                        color: documentoSeleccionado.paciente ? '#1e40af' : '#92400e',
                        fontWeight: 600
                      }} />
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  TERAPEUTA RESPONSABLE
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>
                  {`${documentoSeleccionado.terapeuta?.nombres || ''} ${documentoSeleccionado.terapeuta?.apellidos || ''}`}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  TIPO DE DOCUMENTO
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={documentoSeleccionado.tipoArchivo?.nombre || '-'}
                    sx={{
                      background: '#f1f5f9',
                      fontWeight: 600,
                      color: '#1e293b'
                    }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  ESTADO
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    icon={documentoSeleccionado.estado === 'Activo' ? <CheckCircleOutline /> : <ErrorOutline />}
                    label={documentoSeleccionado.estado || 'Activo'}
                    sx={{
                      background: documentoSeleccionado.estado === 'Activo'
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : '#f1f5f9',
                      color: documentoSeleccionado.estado === 'Activo' ? '#fff' : '#64748b',
                      fontWeight: 600
                    }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  FECHA DE EMISIÓN
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>
                  {formatearFecha(documentoSeleccionado.fechaEmision)}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  FECHA DE VIGENCIA
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mt: 0.5 }}>
                  {formatearFecha(documentoSeleccionado.fechaVigencia) !== '-' ? formatearFecha(documentoSeleccionado.fechaVigencia) : 'Sin vigencia'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                  NOMBRE DEL ARCHIVO
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <FilePresent sx={{ color: '#A3C644' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {documentoSeleccionado.nombreArchivo || '-'}
                  </Typography>
                </Stack>
              </Grid>

              {documentoSeleccionado.descripcion && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>
                    DESCRIPCIÓN
                  </Typography>
                  <Paper sx={{ p: 3, mt: 1, background: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: '#475569' }}>
                      {documentoSeleccionado.descripcion}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Alert
                  severity="info"
                  icon={<CheckCircleOutline />}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid #3b82f6',
                    background: '#eff6ff'
                  }}
                >
                  Este documento puede validarse públicamente en: <br />
                  <strong>www.crecemos.com.pe/validar</strong>
                </Alert>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, background: '#f8fafc' }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDescargar}
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#A3C644',
                background: 'rgba(163, 198, 68, 0.05)'
              }
            }}
          >
            Descargar
          </Button>
          <Button
            variant="contained"
            startIcon={<Visibility />}
            onClick={handleVisualizar}
            sx={{
              background: 'linear-gradient(135deg, #A3C644 0%, #8AB030 100%)',
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(163, 198, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8AB030 0%, #7A9F28 100%)',
                boxShadow: '0 6px 16px rgba(163, 198, 68, 0.4)'
              }
            }}
          >
            Abrir Archivo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Eliminar */}
      <Dialog
        open={dialogEliminar}
        onClose={() => setDialogEliminar(false)}
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          color: '#dc2626',
          p: 3
        }}>
          <Box sx={{
            p: 1.5,
            borderRadius: 2,
            background: 'rgba(220, 38, 38, 0.1)'
          }}>
            <ErrorOutline sx={{ fontSize: 32, color: '#dc2626' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Confirmar Eliminación
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#475569' }}>
            ¿Está seguro que desea eliminar este documento?
          </Typography>
          {documentoSeleccionado && (
            <Paper sx={{
              p: 3,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: 2
            }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#78350f', letterSpacing: 1 }}>
                CÓDIGO:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'monospace', mb: 1, color: '#92400e' }}>
                {documentoSeleccionado.codigoValidacion}
              </Typography>
              <Typography variant="body2" sx={{ color: '#92400e' }}>
                Tipo: {documentoSeleccionado.tipoArchivo?.nombre}
              </Typography>
              <Typography variant="body2" sx={{ color: '#92400e', mt: 0.5 }}>
                Para: {obtenerNombreDestinatario(documentoSeleccionado)} ({documentoSeleccionado.paciente ? 'Paciente' : 'Trabajador'})
              </Typography>
            </Paper>
          )}
          <Alert
            severity="warning"
            sx={{
              mt: 3,
              borderRadius: 2,
              border: '1px solid #f59e0b',
              background: '#fffbeb'
            }}
          >
            Esta acción no se puede deshacer. El documento quedará marcado como eliminado.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1, background: '#f8fafc' }}>
          <Button
            variant="outlined"
            onClick={() => setDialogEliminar(false)}
            sx={{
              borderColor: '#cbd5e1',
              color: '#475569',
              borderRadius: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#94a3b8',
                background: '#f1f5f9'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleEliminarConfirmar}
            sx={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
              }
            }}
            startIcon={<Delete />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Éxito */}
      <Dialog
        open={dialogExito}
        onClose={() => setDialogExito(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          p: 2
        }} />
        <DialogTitle sx={{ textAlign: 'center', pt: 5, pb: 2 }}>
          <Box sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
            boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <CheckCircle sx={{ fontSize: 60, color: '#fff' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            ¡Éxito!
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Archivo subido correctamente
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#475569', fontWeight: 500 }}>
            Código de validación generado:
          </Typography>

          <Paper
            sx={{
              p: 4,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 3,
              mb: 3,
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(163, 198, 68, 0.3), transparent)',
              }
            }}
          >
            <Typography variant="h3" sx={{
              fontWeight: 800,
              color: '#A3C644',
              letterSpacing: 4,
              fontFamily: 'monospace',
              position: 'relative',
              zIndex: 1
            }}>
              {codigoGenerado?.codigoValidacion}
            </Typography>
          </Paper>

          <Button
            variant="outlined"
            startIcon={<ContentCopy />}
            onClick={copiarCodigo}
            sx={{
              mb: 3,
              borderColor: '#A3C644',
              color: '#A3C644',
              borderRadius: 3,
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#8AB030',
                background: 'rgba(163, 198, 68, 0.05)',
              },
            }}
          >
            Copiar Código
          </Button>

          <Alert
            severity="info"
            sx={{
              textAlign: 'left',
              borderRadius: 2,
              border: '1px solid #3b82f6',
              background: '#eff6ff'
            }}
          >
            Este código puede validarse públicamente en: <br />
            <strong>www.crecemos.com.pe/validar</strong>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 2, px: 4 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setDialogExito(false);
              setCodigoGenerado(null);
            } }
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              borderColor: '#cbd5e1',
              color: '#475569',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#94a3b8',
                background: '#f1f5f9'
              }
            }}
          >
            Subir Otro
          </Button>
          <Button
              variant="contained"
              onClick={() => {
                setDialogExito(false);
                setCodigoGenerado(null);
                setTabValue(0); // ✅ Esto trigger el useEffect que carga documentos
     
              }}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #A3C644 0%, #8AB030 100%)',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(163, 198, 68, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8AB030 0%, #7A9F28 100%)',
                  boxShadow: '0 6px 16px rgba(163, 198, 68, 0.4)'
                },
              }}
            >
              Ver Documentos
            </Button>
        </DialogActions>
      </Dialog>
    </Box><style>
        {`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}
      </style>
  </>
);
};

export default GestionArchivosOficiales;