import React, { useState, useEffect, useRef } from 'react'; // ✅ Agregado useRef
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  TablePagination
} from '@mui/material';
import {
  Search,
  Visibility,
  Delete,
  Description,
  Close,
  Send,
  FilterList,
  Refresh,
  People,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  NoteAdd,
  PersonOutline,
  WorkOutline,
  LocationOn,
  Email,
  Phone
} from '@mui/icons-material';
import { CONFIGURACION_ESTADOS_POSTULACION } from '../constants/estadosPostulacion';
import TopMenu from '../components/TopMenu';
import {getDistritos} from '../services/catalogoService';
import postulacionesService from '../services/postulacionesService';


const PostulacionesDashboard = () => {
  const [postulaciones, setPostulaciones] = useState([]);
  const [filtros, setFiltros] = useState({
    search: '',
    estado_postulacion: '',
    distrito: '',
    cargo_postulado: ''
  });
  const [modalPerfil, setModalPerfil] = useState(null);
  const [modalCV, setModalCV] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    estados: []
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [cargosDisponibles, setCargosDisponibles] = useState([]);
  const [distritosDisponibles, setDistritosDisponibles] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  
  // ✅ NUEVO: Control de inicialización
  const inicializadoRef = useRef(false);

  const coloresEstado = {
    'Nuevo': 'warning',
    'En revisión': 'info',
    'Contactado': 'primary',
    'Por entrevistar': 'secondary',
    'Rechazado': 'error',
    'Contratado': 'success'
  };

  // ✅ SOLUCIÓN: useEffect con control de duplicados
  useEffect(() => {
    // Evita ejecución duplicada en React Strict Mode
    if (inicializadoRef.current) return;
    inicializadoRef.current = true;

    const inicializar = async () => {
      await cargarCatalogos();
      await Promise.all([
        cargarPostulaciones(),
        cargarEstadisticas()
      ]);
    };
    
    inicializar();
  }, []);

  const cargarCatalogos = async () => {
    try {
      setCargandoCatalogos(true);
      
      const [estadosData, cargosData, distritosData] = await Promise.all([
        postulacionesService.obtenerEstados(),
        postulacionesService.obtenerCargos(),
        getDistritos(),
      ]);

      setEstadosDisponibles(estadosData);
      setCargosDisponibles(cargosData);
      setDistritosDisponibles(distritosData);

    } catch (error) {
      console.error('❌ Error al cargar catálogos:', error);
    } finally {
      setCargandoCatalogos(false);
    }
  };

  const cargarPostulaciones = async () => {
    try {
      setLoading(true);
      const data = await postulacionesService.obtenerPostulaciones(filtros);
      setPostulaciones(data);
    } catch (error) {
      console.error('❌ Error al cargar postulaciones:', error);
      alert('Error al cargar postulaciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const data = await postulacionesService.obtenerEstadisticasPorEstados();
      setEstadisticas(data);
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
    }
  };

  const handleVerPerfil = async (postulacion) => {
    try {
      setModalPerfil(postulacion);
      const comentariosData = await postulacionesService.obtenerComentarios(postulacion.id_postulacion);
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  const handleVerCV = async (postulacion) => {
    try {
      setLoading(true);
      setModalCV(postulacion);
      const url = await postulacionesService.obtenerCV(postulacion.id_postulacion);
      setCvUrl(url);
    } catch (error) {
      console.error('Error al cargar CV:', error);
      setModalCV(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    try {
      await postulacionesService.eliminarPostulacion(modalEliminar.id_postulacion);
      setPostulaciones(postulaciones.filter(p => p.id_postulacion !== modalEliminar.id_postulacion));
      setModalEliminar(null);
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await postulacionesService.actualizarEstado(id, nuevoEstado);
      setPostulaciones(postulaciones.map(p => 
        p.id_postulacion === id ? { ...p, estado_postulacion: nuevoEstado } : p
      ));
      if (modalPerfil?.id_postulacion === id) {
        setModalPerfil({ ...modalPerfil, estado_postulacion: nuevoEstado });
      }
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    
    try {
      const idTrabajador = 1;
      const comentario = await postulacionesService.agregarComentario(
        modalPerfil.id_postulacion,
        idTrabajador,
        nuevoComentario
      );
      setComentarios([comentario, ...comentarios]);
      setNuevoComentario('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };

  const cerrarModalCV = () => {
    if (cvUrl) {
      postulacionesService.limpiarUrlBlob(cvUrl);
      setCvUrl(null);
    }
    setModalCV(null);
  };

  // Configuración de las tarjetas de estadísticas
  const configuracionEstados = CONFIGURACION_ESTADOS_POSTULACION;

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paginatedPostulaciones = postulaciones.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
      <TopMenu/>
      <Box sx={{ maxWidth: 1400, mx: 'auto', paddingTop: 10 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
            Gestión de Postulaciones
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Administra y revisa las postulaciones de candidatos
          </Typography>
        </Box>

        {/* Estadísticas */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Tarjeta Total */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ 
              borderTop: 4, 
              borderColor: '#3b82f6',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              transition: 'all 0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <People sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {estadisticas.total}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tarjetas dinámicas por estado */}
          {configuracionEstados.map((estado, index) => {
            const IconoComponente = estado.icono;
            const cantidad = estadisticas.estados?.find(e => e.nombre === estado.nombre)?.cantidad || 0;
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card sx={{ 
                  borderTop: 4, 
                  borderColor: estado.color,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <IconoComponente sx={{ fontSize: 32, color: estado.color, mb: 1 }} />
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {cantidad}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                      {estado.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Filtros */}
        <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList sx={{ color: '#64748b' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  Filtros
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                sx={{ textTransform: 'none', color: '#64748b' }}
              >
                {showFilters ? 'Ocultar' : 'Mostrar'}
              </Button>
            </Box>

            {showFilters && (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Buscar por nombre, apellido o email..."
                      value={filtros.search}
                      onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Grid>

                  {/* ✅ Select de Estado dinámico */}
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small" disabled={cargandoCatalogos}>
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={filtros.estado_postulacion}
                        label="Estado"
                        onChange={(e) => setFiltros({ ...filtros, estado_postulacion: e.target.value })}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {estadosDisponibles.map(estado => (
                          <MenuItem key={estado.id} value={estado.descripcion}>{estado.descripcion}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* ✅ Select de Distrito dinámico */}
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small" disabled={cargandoCatalogos}>
                      <InputLabel>Distrito</InputLabel>
                      <Select
                        value={filtros.distrito}
                        label="Distrito"
                        onChange={(e) => setFiltros({ ...filtros, distrito: e.target.value })}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {distritosDisponibles.map(distrito => (
                          <MenuItem key={distrito.id} value={distrito.nombre}>{distrito.nombre}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* ✅ Select de Cargo dinámico */}
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small" disabled={cargandoCatalogos}>
                      <InputLabel>Cargo</InputLabel>
                      <Select
                        value={filtros.cargo_postulado}
                        label="Cargo"
                        onChange={(e) => setFiltros({ ...filtros, cargo_postulado: e.target.value })}
                      >
                        <MenuItem value="">Todos</MenuItem>
                        {cargosDisponibles.map(cargo => (
                          <MenuItem key={cargo.id} value={cargo.descripcion}>{cargo.descripcion}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Search />}
                    onClick={cargarPostulaciones}
                    disabled={loading}
                    sx={{ textTransform: 'none', bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                  >
                    Buscar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Close />}
                    onClick={() => {
                      setFiltros({ search: '', estado_postulacion: '', distrito: '', cargo_postulado: '' });
                      setTimeout(cargarPostulaciones, 100);
                    }}
                    sx={{ textTransform: 'none', color: '#64748b', borderColor: '#e2e8f0' }}
                  >
                    Limpiar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => { cargarPostulaciones(); cargarEstadisticas(); }}
                    sx={{ textTransform: 'none', color: '#10b981', borderColor: '#10b981' }}
                  >
                    Actualizar
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Candidato</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Cargo</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Distrito</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Fecha</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography sx={{ mt: 2, color: '#64748b' }}>Cargando postulaciones...</Typography>
                    </TableCell>
                  </TableRow>
                ) : postulaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <Typography sx={{ color: '#64748b' }}>No se encontraron postulaciones</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPostulaciones.map((postulacion) => (
                    <TableRow 
                      key={postulacion.id_postulacion}
                      sx={{ '&:hover': { bgcolor: '#f8fafc' }, transition: '0.2s' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#3b82f6', width: 40, height: 40 }}>
                            {getInitials(postulacion.nombre, postulacion.apellido)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {postulacion.nombre} {postulacion.apellido}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                              {postulacion.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#475569' }}>{postulacion.cargo_postulado}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>{postulacion.distrito}</TableCell>
                      <TableCell>
                        <Chip
                          label={postulacion.estado_postulacion}
                          color={coloresEstado[postulacion.estado_postulacion]}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#475569' }}>
                        {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Ver perfil y notas">
                            <IconButton
                              onClick={() => handleVerPerfil(postulacion)}
                              size="small"
                              sx={{ color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } }}
                            >
                              <Description />
                              
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ver CV">
                            <IconButton
                              onClick={() => handleVerCV(postulacion)}
                              size="small"
                              sx={{ color: '#8b5cf6', '&:hover': { bgcolor: '#ede9fe' } }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              onClick={() => setModalEliminar(postulacion)}
                              size="small"
                              sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación - Siempre visible cuando hay datos */}
          {!loading && postulaciones.length > 0 && (
            <Box sx={{ borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
              <TablePagination
                component="div"
                count={postulaciones.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Registros por página:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
                sx={{
                  '.MuiTablePagination-toolbar': {
                    paddingLeft: 2,
                    paddingRight: 2,
                  },
                  '.MuiTablePagination-selectLabel': {
                    color: '#64748b',
                    fontWeight: 500,
                    margin: 0
                  },
                  '.MuiTablePagination-displayedRows': {
                    color: '#64748b',
                    fontWeight: 500,
                    margin: 0
                  },
                  '.MuiTablePagination-select': {
                    color: '#1e293b',
                    fontWeight: 600
                  },
                  '.MuiTablePagination-actions': {
                    color: '#3b82f6'
                  }
                }}
              />
            </Box>
          )}
        </Card>

      {/* Modal Perfil y Notas */}
        <Dialog
          open={!!modalPerfil}
          onClose={() => setModalPerfil(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          {modalPerfil && (
            <>
              <DialogTitle sx={{ 
                bgcolor: '#3b82f6', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                py: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'white', color: '#3b82f6', width: 48, height: 48 }}>
                    {getInitials(modalPerfil.nombre, modalPerfil.apellido)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {modalPerfil.nombre} {modalPerfil.apellido}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Perfil del Candidato
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setModalPerfil(null)} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ mt: 3 }}>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <PersonOutline sx={{ color: '#64748b', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Nombre Completo
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {modalPerfil.nombre} {modalPerfil.apellido}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WorkOutline sx={{ color: '#64748b', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Cargo Postulado
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {modalPerfil.cargo_postulado}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn sx={{ color: '#64748b', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Distrito
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {modalPerfil.distrito}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, mb: 1, display: 'block' }}>
                      Estado
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={modalPerfil.estado_postulacion}
                        onChange={(e) => handleCambiarEstado(modalPerfil.id_postulacion, e.target.value)}
                      >
                        {/* ✅ CORREGIDO: Ahora usa estado.id como key y estado.descripcion como valor */}
                        {estadosDisponibles.map(estado => (
                          <MenuItem key={estado.id} value={estado.descripcion}>
                            <Chip
                              label={estado.descripcion}
                              color={coloresEstado[estado.descripcion]}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Email sx={{ color: '#64748b', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Email
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#1e293b' }}>
                      {modalPerfil.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone sx={{ color: '#64748b', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Teléfono
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#1e293b' }}>
                      {modalPerfil.telefono}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <NoteAdd sx={{ color: '#3b82f6', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Notas y Comentarios
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Agregar una nota sobre este candidato..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAgregarComentario()}
                    multiline
                    rows={2}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAgregarComentario}
                    disabled={!nuevoComentario.trim()}
                    sx={{ 
                      minWidth: 100,
                      bgcolor: '#3b82f6', 
                      '&:hover': { bgcolor: '#2563eb' },
                      textTransform: 'none'
                    }}
                  >
                    <Send sx={{ fontSize: 20 }} />
                  </Button>
                </Box>

                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {comentarios.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      No hay notas registradas para este candidato
                    </Alert>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {/* ✅ ESTE YA ESTABA BIEN - Tiene key único con id_comentario */}
                      {comentarios.map((comentario) => (
                        <ListItem
                          key={comentario.id_comentario}
                          sx={{
                            bgcolor: '#f8fafc',
                            borderRadius: 2,
                            mb: 1.5,
                            border: '1px solid #e2e8f0',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            p: 2
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            sx={{ color: '#1e293b', mb: 1, lineHeight: 1.6 }}
                          >
                            {comentario.comentario}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ color: '#64748b', fontWeight: 500 }}
                          >
                            {new Date(comentario.fecha_comentario).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc' }}>
                <Button 
                  onClick={() => setModalPerfil(null)}
                  sx={{ textTransform: 'none', color: '#64748b' }}
                >
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal CV */}
        <Dialog
          open={!!modalCV}
          onClose={cerrarModalCV}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2, height: '90vh' }
          }}
        >
          {modalCV && (
            <>
              <DialogTitle sx={{ 
                bgcolor: '#8b5cf6', 
                color: 'white', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                py: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Description sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Currículum Vitae
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {modalCV.nombre} {modalCV.apellido}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={cerrarModalCV} sx={{ color: 'white' }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ p: 0, height: 'calc(90vh - 100px)', bgcolor: '#f8fafc' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={48} />
                      <Typography sx={{ mt: 2, color: '#64748b' }}>
                        Cargando documento...
                      </Typography>
                    </Box>
                  </Box>
                ) : cvUrl ? (
                  <iframe
                    src={cvUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="CV PDF"
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      No se pudo cargar el CV. Verifica que el archivo exista.
                    </Alert>
                  </Box>
                )}
              </DialogContent>
            </>
          )}
        </Dialog>

        {/* Modal Eliminar */}
        <Dialog
          open={!!modalEliminar}
          onClose={() => setModalEliminar(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#fee2e2', 
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2
          }}>
            <Cancel sx={{ fontSize: 32, color: '#ef4444' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Confirmar Eliminación
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Esta acción no se puede deshacer
            </Alert>
            
            {modalEliminar && (
              <Box>
                <Typography variant="body1" sx={{ color: '#1e293b', mb: 2 }}>
                  ¿Estás seguro de que deseas eliminar la postulación de:
                </Typography>
                
                <Box sx={{ 
                  bgcolor: '#f8fafc', 
                  p: 2, 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#ef4444', width: 48, height: 48 }}>
                      {getInitials(modalEliminar.nombre, modalEliminar.apellido)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {modalEliminar.nombre} {modalEliminar.apellido}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {modalEliminar.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Cargo:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {modalEliminar.cargo_postulado}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Distrito:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1e293b' }}>
                        {modalEliminar.distrito}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Typography variant="body2" sx={{ color: '#64748b', mt: 2 }}>
                  Se eliminará toda la información del candidato, incluyendo su CV y comentarios asociados.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', gap: 1 }}>
            <Button 
              onClick={() => setModalEliminar(null)}
              variant="outlined"
              sx={{ 
                textTransform: 'none',
                color: '#64748b',
                borderColor: '#e2e8f0',
                '&:hover': { borderColor: '#cbd5e1', bgcolor: 'white' }
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEliminar}
              variant="contained"
              sx={{ 
                textTransform: 'none',
                bgcolor: '#ef4444',
                '&:hover': { bgcolor: '#dc2626' }
              }}
              startIcon={<Delete />}
            >
              Eliminar Postulación
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PostulacionesDashboard;