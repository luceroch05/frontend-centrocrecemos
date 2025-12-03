import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Grid,
  MenuItem,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { obtenerHistorial, obtenerEstadisticas } from '../../services/auditoriaService';

const MODULOS = [
  { value: '', label: 'Todos los módulos' },
  { value: 'PACIENTES', label: 'Pacientes' },
  { value: 'CITAS', label: 'Citas' },
  { value: 'ARCHIVOS', label: 'Archivos' },
  { value: 'RRHH', label: 'Recursos Humanos' },
  { value: 'POSTULACIONES', label: 'Postulaciones' },
  { value: 'AUDITORIA', label: 'Auditoría' },
];

const ACCIONES = [
  { value: '', label: 'Todas las acciones' },
  { value: 'VER_PACIENTE', label: 'Ver Paciente' },
  { value: 'CREAR_PACIENTE', label: 'Crear Paciente' },
  { value: 'EDITAR_PACIENTE', label: 'Editar Paciente' },
  { value: 'CREAR_CITA', label: 'Crear Cita' },
  { value: 'EDITAR_CITA', label: 'Editar Cita' },
  { value: 'ELIMINAR_CITA', label: 'Eliminar Cita' },
  { value: 'SUBIR_ARCHIVO_DIGITAL', label: 'Subir Archivo' },
  { value: 'DESCARGAR_ARCHIVO', label: 'Descargar Archivo' },
  { value: 'CREAR_CERTIFICADO', label: 'Crear Certificado' },
  { value: 'EDITAR_EMPLEADO', label: 'Editar Empleado' },
  { value: 'REGISTRAR_PAGO', label: 'Registrar Pago' },
];

const HistorialAuditoria = () => {
  const [registros, setRegistros] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Ref para evitar llamadas duplicadas en desarrollo (React.StrictMode)
  const isLoadingRef = useRef(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    modulo: '',
    accion: '',
    fechaInicio: '',
    fechaFin: '',
    busqueda: '',
  });

  const cargarHistorial = useCallback(async () => {
    // Evitar llamadas duplicadas
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setLoading(true);
    try {
      const resultado = await obtenerHistorial({
        ...filtros,
        page: page + 1,
        limit: rowsPerPage,
      });

      setRegistros(resultado.registros || []);
      setTotalRegistros(resultado.total || 0);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [filtros, page, rowsPerPage]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await obtenerEstadisticas(
        filtros.fechaInicio || null,
        filtros.fechaFin || null
      );
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros = () => {
    // Solo resetear la página, el useEffect se encargará de recargar los datos
    setPage(0);
    // Los useEffect se dispararán automáticamente porque filtros cambió
  };

  const limpiarFiltros = () => {
    // Resetear filtros y página, el useEffect recargará los datos
    setFiltros({
      modulo: '',
      accion: '',
      fechaInicio: '',
      fechaFin: '',
      busqueda: '',
    });
    setPage(0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  };

  const getColorModulo = (modulo) => {
    const colores = {
      PACIENTES: 'primary',
      CITAS: 'secondary',
      ARCHIVOS: 'info',
      RRHH: 'warning',
      POSTULACIONES: 'success',
      AUDITORIA: 'error',
    };
    return colores[modulo] || 'default';
  };

  const getColorMetodoHttp = (metodo) => {
    const colores = {
      GET: 'info',
      POST: 'success',
      PUT: 'warning',
      PATCH: 'warning',
      DELETE: 'error',
    };
    return colores[metodo] || 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Título */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Historial de Auditoría
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registro completo de todas las acciones realizadas en el sistema
        </Typography>
      </Box>

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {estadisticas.totalAcciones}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Acciones
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                {estadisticas.accionesPorModulo?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Módulos Activos
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {estadisticas.accionesPorUsuario?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Usuarios Activos
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {estadisticas.accionesPorTipo?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tipos de Acciones
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Módulo"
              value={filtros.modulo}
              onChange={(e) => handleFiltroChange('modulo', e.target.value)}
              size="small"
            >
              {MODULOS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Acción"
              value={filtros.accion}
              onChange={(e) => handleFiltroChange('accion', e.target.value)}
              size="small"
            >
              {ACCIONES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Inicio"
              value={filtros.fechaInicio}
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Fecha Fin"
              value={filtros.fechaFin}
              onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Buscar por usuario, descripción o entidad"
              value={filtros.busqueda}
              onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
              placeholder="Ejemplo: Juan Pérez, paciente, archivo..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterIcon />}
                onClick={aplicarFiltros}
              >
                Aplicar Filtros
              </Button>
              <Button
                variant="outlined"
                onClick={limpiarFiltros}
                startIcon={<RefreshIcon />}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de registros */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Módulo</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Entidad</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>IP</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              registros.map((registro) => (
                <TableRow key={registro.id} hover>
                  <TableCell>{formatearFecha(registro.fechaHora)}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {registro.trabajadorNombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {registro.trabajadorUsername}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registro.modulo}
                      color={getColorModulo(registro.modulo)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {registro.accion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={registro.descripcion}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {registro.descripcion}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {registro.entidadNombre && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {registro.entidadTipo}
                        </Typography>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {registro.entidadNombre}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registro.metodoHttp}
                      color={getColorMetodoHttp(registro.metodoHttp)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {registro.ipAddress || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalRegistros}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Registros por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>
    </Container>
  );
};

export default HistorialAuditoria;
