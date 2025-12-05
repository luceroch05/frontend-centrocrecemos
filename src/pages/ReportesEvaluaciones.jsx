import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Autocomplete,
  Grid,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";
import SideMenu from "../components/SideMenu/SideMenu";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { getTiposTest, getDatosEstudiantes, getGrados, getSecciones, getInstituciones } from '../services/evaluacionService';
import axios from 'axios';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { API_BASE_URL } from '../services/api';

// Configurar las fuentes
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Definir las fuentes
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

export const ReportesEvaluaciones = () => {
  const [tiposTest, setTiposTest] = useState([]);
  const [tipoTestSeleccionado, setTipoTestSeleccionado] = useState('');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [areas, setAreas] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [colegioSeleccionado, setColegioSeleccionado] = useState('');
  const [colegios, setColegios] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [grados, setGrados] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  const [secciones, setSecciones] = useState([]);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar tipos de test, alumnos, grados, secciones y colegios al inicio
  useEffect(() => {
    const fetchFiltros = async () => {
      try {
        const [tipos, alumnosData, gradosData, seccionesData, colegiosData] = await Promise.all([
          getTiposTest(),
          getDatosEstudiantes(),
          getGrados(),
          getSecciones(),
          getInstituciones()
        ]);
        setTiposTest(tipos);
        
        // Asegurarse de que los datos de alumnos tengan el formato correcto
        const alumnosFormateados = alumnosData.map(alumno => ({
          id: alumno.id,
          nombre: alumno.nombre || alumno.NOMBRES || 'Sin nombre',
          ...alumno
        }));
        setAlumnos(alumnosFormateados);
        
        setGrados(gradosData);
        setSecciones(seccionesData);
        setColegios(colegiosData);
      } catch (e) {
        console.error('Error al cargar los filtros:', e);
        setTiposTest([]);
        setAlumnos([]);
        setGrados([]);
        setSecciones([]);
        setColegios([]);
      }
    };
    fetchFiltros();
  }, []);

  const aplicarFiltros = async () => {
    if (!tipoTestSeleccionado) return;
    try {
      let url = `${API_BASE_URL}/evaluaciones/tabla-alumnos-evaluados/${tipoTestSeleccionado}`;
      const params = new URLSearchParams();
      
      if (fechaInicio) {
        params.append('fechaInicio', fechaInicio);
      }
      if (fechaFin) {
        params.append('fechaFin', fechaFin);
      }
      if (alumnoSeleccionado) {
        params.append('estudianteId', alumnoSeleccionado.id);
      }
      if (gradoSeleccionado) {
        params.append('gradoId', gradoSeleccionado);
      }
      if (seccionSeleccionada) {
        params.append('seccionId', seccionSeleccionada);
      }
      if (colegioSeleccionado) {
        params.append('colegioId', colegioSeleccionado);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const { data } = await axios.get(url);
      setEvaluaciones(data);
      if (data.length > 0) {
        setAreas(Object.keys(data[0]).filter(k => k !== 'NOMBRES' && k !== 'RESULTADO'));
      } else {
        setAreas([]);
      }
      setFiltrosAplicados(true);
    } catch (e) {
      console.error('Error al cargar las evaluaciones:', e);
      setEvaluaciones([]);
      setAreas([]);
    }
  };

  const limpiarFiltros = () => {
    setTipoTestSeleccionado('');
    setFechaInicio('');
    setFechaFin('');
    setAlumnoSeleccionado(null);
    setColegioSeleccionado('');
    setGradoSeleccionado('');
    setSeccionSeleccionada('');
    setEvaluaciones([]);
    setAreas([]);
    setFiltrosAplicados(false);
  };

  // Ajustar las áreas para excluir campos fijos
  const camposFijos = ['NOMBRES', 'nombres', 'colegio', 'grado', 'seccion', 'fecha', 'RESULTADO', 'puntaje', 'estudiante_id', 'resultado_test_id'];
  const areasEvaluadas = areas.filter(area => !camposFijos.includes(area));

  // Función para tooltip del semáforo
  const getResultadoLabel = (color) => {
    if (!color) return 'Sin información';
    if (color === '#00FF00' || color.toLowerCase() === 'green') return 'Óptimo';
    if (color === '#FFFF00' || color.toLowerCase() === 'yellow') return 'En observación';
    if (color === '#FF0000' || color.toLowerCase() === 'red') return 'En riesgo';
    return 'Sin información';
  };

  const eliminarTest = async (estudianteId, tipoTestId) => {
    setTestToDelete({ estudianteId, tipoTestId });
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/evaluaciones/eliminar-evaluacion/${testToDelete.estudianteId}/${testToDelete.tipoTestId}`);
      setSnackbar({
        open: true,
        message: 'Test eliminado exitosamente',
        severity: 'success'
      });
      setOpenDialog(false);
      // Volver a cargar los datos con los mismos filtros
      await aplicarFiltros();
    } catch (e) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el test',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDownloadPDF = () => {
    if (!filtrosAplicados || evaluaciones.length === 0) {
      setSnackbar({
        open: true,
        message: 'No hay datos para descargar',
        severity: 'warning'
      });
      return;
    }

    const tipoTest = tiposTest.find(t => t.id === tipoTestSeleccionado);

    // Calcular ancho dinámico para las áreas evaluadas
    const anchoTotalAreas = 250;
    const anchoArea = areasEvaluadas.length > 0 ? Math.floor(anchoTotalAreas / areasEvaluadas.length) : 50;

    // Definir el documento
    const docDefinition = {
      pageOrientation: 'landscape',
      content: [
        {
          text: 'Reporte de Evaluaciones',
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        {
          text: `Tipo de Test: ${tipoTest?.nombre || ''}`,
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        {
          table: {
            widths: [
              120, // Nombres
              90, // Colegio
              67, // Grado/Sección
              55, // Fecha
              ...Array(areasEvaluadas.length).fill(anchoArea), // Áreas evaluadas
              40, // Puntaje
              47, // Resultado
            ],
            body: [
              // Encabezados
              ['Nombres', 'Colegio', 'Grado/sección', 'Fecha', ...areasEvaluadas.map(area => area.charAt(0).toUpperCase() + area.slice(1).toLowerCase()), 'Puntaje', 'Resultado'].map((col, i) => ({
                text: col,
                fillColor: '#7e57c2',
                color: 'white',
                bold: true,
                alignment: i <= 1 ? 'left' : 'center',
                fontSize: 9,
                margin: [2, 4, 2, 4],
                valign: 'middle'
              })),
              // Datos
              ...evaluaciones.map((evaluacion, idx) => [
                {text: evaluacion.nombres, alignment: 'left', margin: [2, 12, 2, 2], fillColor: idx % 2 === 0 ? null : '#f8fafd', fontSize: 9, valign: 'middle'},
                {text: evaluacion.colegio, alignment: 'left', margin: [2, 12, 2, 2], fillColor: idx % 2 === 0 ? null : '#f8fafd', fontSize: 9, valign: 'middle'},
                {text: `${evaluacion.grado || ''}${evaluacion.grado && evaluacion.seccion ? ' - ' : ''}${evaluacion.seccion || ''}`, alignment: 'center', fillColor: idx % 2 === 0 ? null : '#f8fafd', fontSize: 9, valign: 'middle',margin: [2, 12, 2, 2]},
                {text: evaluacion.fecha, alignment: 'center', fillColor: idx % 2 === 0 ? null : '#f8fafd', fontSize: 9, valign: 'middle', margin: [2, 12, 2, 2]},
                ...areasEvaluadas.map(area => {
                  const val = evaluacion[area];
                  // Detectar check
                  const isCheck = val === '✔' || val === '✓' || val === 'Sí' || val === 'Si' || val === 'SÍ' || val === 'true' || val === true;
                  const isX = val === '✗' || val === 'X' || val === 'No' || val === 'NO' || val === 'false' || val === false;
                  if (isCheck) {
                    return {
                      svg: '<svg width="24" height="24" viewBox="0 0 24 24"><polyline points="4,13 10,19 20,5" style="fill:none;stroke:#8bc34a;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round"/></svg>',
                      fit: [20, 20],
                      margin: [2, 12, 2, 2],
                      alignment: 'center',
                      valign: 'middle',
                      fillColor: idx % 2 === 0 ? null : '#f8fafd'
                    };
                  } else if (isX) {
                    return {
                      svg: '<svg width="24" height="24" viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" style="stroke:#e53935;stroke-width:3.5;stroke-linecap:round"/><line x1="18" y1="6" x2="6" y2="18" style="stroke:#e53935;stroke-width:3.5;stroke-linecap:round"/></svg>',
                      fit: [20, 20],
                      margin: [2, 12, 2, 2],
                      alignment: 'center',
                      valign: 'middle',
                      fillColor: idx % 2 === 0 ? null : '#f8fafd'
                    };
                  } else {
                    return {
                      text: val,
                      alignment: 'center',
                      fontSize: 9,
                      valign: 'middle',
                      fillColor: idx % 2 === 0 ? null : '#f8fafd'
                    };
                  }
                }),
                {
                  stack: [
                    { text: ' ', fontSize: 9, margin: [0, 6, 0, 0] },
                    { text: evaluacion.puntaje ?? '-', alignment: 'center', fontSize: 9 },
                    { text: ' ', fontSize: 9, margin: [0, 6, 0, 0] }
                  ],
                  alignment: 'center',
                  fillColor: idx % 2 === 0 ? null : '#f8fafd',
                  valign: 'middle'
                },
                {
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'ellipse',
                          x: 0,
                          y: 20,
                          r1: 8,
                          r2: 8,
                          color: evaluacion.RESULTADO === '#00FF00' ? 'green' :
                                evaluacion.RESULTADO === '#FFFF00' ? 'orange' :
                                evaluacion.RESULTADO === '#FF0000' ? 'red' : 'gray'
                        }
                      ],
                      width: 20,
                      height: 32
                    }
                  ],
                  alignment: 'center',
                  fillColor: idx % 2 === 0 ? null : '#f8fafd',
                  valign: 'middle'
                }
              ])
            ]
          },
          layout: {
            hLineWidth: function(i, node) { return 0.7; },
            vLineWidth: function(i, node) { return 0.7; },
            hLineColor: function(i, node) { return '#e0e0e0'; },
            vLineColor: function(i, node) { return '#e0e0e0'; },
            paddingLeft: function(i, node) { return 4; },
            paddingRight: function(i, node) { return 4; },
            paddingTop: function(i, node) { return 2; },
            paddingBottom: function(i, node) { return 2; }
          }
        }
      ],
      defaultStyle: {
        fontSize: 9,
        font: 'Roboto'
      }
    };

    // Generar y descargar el PDF
    pdfMake.createPdf(docDefinition).download('evaluaciones.pdf');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Lista de Alumnos Evaluados
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            disabled={!filtrosAplicados || evaluaciones.length === 0}
            sx={{
              backgroundColor: '#512da8',
              '&:hover': {
                backgroundColor: '#311b92',
              },
              px: 3,
              py: 1,
              borderRadius: 2
            }}
          >
            Descargar PDF
          </Button>
        </Box>

        <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 3, background: '#f8fafd' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#512da8' }}>
            Filtros de búsqueda
          </Typography>
          <Grid container spacing={2}>
            {/* Primera fila: Tipo de Test y Alumno */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="tipo-test-label">Tipo de Test</InputLabel>
                <Select
                  labelId="tipo-test-label"
                  value={tipoTestSeleccionado}
                  label="Tipo de Test"
                  onChange={e => setTipoTestSeleccionado(e.target.value)}
                >
                  {tiposTest.map(test => (
                    <MenuItem key={test.id} value={test.id}>{test.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                value={alumnoSeleccionado}
                onChange={(event, newValue) => {
                  setAlumnoSeleccionado(newValue);
                }}
                options={alumnos}
                getOptionLabel={(option) => {
                  if (!option) return '';
                  return option.nombre_estudiante + ' ' + option.apellidos_estudiante;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar Alumno"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => {
                  if (!option || !value) return false;
                  return option.id === value.id;
                }}
                noOptionsText="No se encontraron alumnos"
                loadingText="Cargando alumnos..."
              />
            </Grid>

            {/* Segunda fila: Colegio, Grado, Sección, Fecha Inicio y Fecha Fin */}
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="colegio-label">Colegio</InputLabel>
                    <Select
                      labelId="colegio-label"
                      value={colegioSeleccionado}
                      label="Colegio"
                      onChange={e => setColegioSeleccionado(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {colegios.map(colegio => (
                        <MenuItem key={colegio.id} value={colegio.id}>{colegio.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="grado-label">Grado</InputLabel>
                    <Select
                      labelId="grado-label"
                      value={gradoSeleccionado}
                      label="Grado"
                      onChange={e => setGradoSeleccionado(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {grados.map(grado => (
                        <MenuItem key={grado.id || grado} value={grado.id || grado}>{grado.nombre || grado}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="seccion-label">Sección</InputLabel>
                    <Select
                      labelId="seccion-label"
                      value={seccionSeleccionada}
                      label="Sección"
                      onChange={e => setSeccionSeleccionada(e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {secciones.map(seccion => (
                        <MenuItem key={seccion.id || seccion} value={seccion.id || seccion}>{seccion.nombre || seccion}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha Inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha Fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Botón de Filtrar */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={limpiarFiltros}
                  sx={{
                    borderColor: '#b39ddb',
                    color: '#512da8',
                    '&:hover': {
                      backgroundColor: '#ede7f6',
                      borderColor: '#512da8',
                    },
                    px: 4,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  Limpiar filtros
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FilterListIcon />}
                  onClick={aplicarFiltros}
                  sx={{
                    backgroundColor: '#512da8',
                    '&:hover': {
                      backgroundColor: '#311b92',
                    },
                    px: 4,
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  Filtrar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 3, 
            borderRadius: 3, 
            boxShadow: 3
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    borderRight: '1px solid #fff',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    borderTopLeftRadius: 12,
                    minWidth: 80,
                    maxWidth: 120,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  NOMBRES
                </TableCell>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    borderRight: '1px solid #fff',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    minWidth: 90,
                    maxWidth: 140,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  COLEGIO
                </TableCell>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    borderRight: '1px solid #fff',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    minWidth: 70,
                    maxWidth: 100,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  GRADO/SECCIÓN
                </TableCell>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    borderRight: '1px solid #fff',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    minWidth: 70,
                    maxWidth: 100,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  FECHA
                </TableCell>
                <TableCell
                  sx={{
                    background: '#7e57c2',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#fff',
                    fontSize: 13,
                    borderTopRightRadius: 12,
                    borderRight: '1px solid #fff',
                    padding: '6px 2px',
                  }}
                  colSpan={areasEvaluadas.length}
                  align="center"
                >
                  ÁREAS EVALUADAS
                </TableCell>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    minWidth: 50,
                    maxWidth: 70,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  PUNTAJE
                </TableCell>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    borderTopRightRadius: 12,
                    minWidth: 60,
                    maxWidth: 80,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  RESULTADO
                </TableCell>
                <TableCell
                  sx={{
                    background: '#b39ddb',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#222',
                    fontSize: 13,
                    borderTopRightRadius: 12,
                    minWidth: 60,
                    maxWidth: 80,
                    whiteSpace: 'nowrap',
                    padding: '6px 4px',
                  }}
                  rowSpan={2}
                  align="center"
                >
                  ELIMINAR
                </TableCell>
              </TableRow>
              <TableRow>
                {areasEvaluadas.map(area => (
                  <TableCell
                    key={area}
                    align="center"
                    sx={{
                      background: '#d1c4e9',
                      fontWeight: 'bold',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      verticalAlign: 'bottom',
                      borderRight: '1px solid #fff',
                      color: '#333',
                      fontSize: 13,
                      minWidth: 32,
                      maxWidth: 40,
                      whiteSpace: 'nowrap',
                      padding: '4px 2px',
                    }}
                  >
                    {area.toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!filtrosAplicados ? (
                <TableRow>
                  <TableCell colSpan={areasEvaluadas.length + 5} align="center" sx={{ p: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Seleccione un tipo de test y aplique los filtros para ver los resultados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : evaluaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={areasEvaluadas.length + 5} align="center" sx={{ p: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      No se encontraron evaluaciones con los filtros seleccionados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                evaluaciones.map((evaluacion, idx) => (
                  <TableRow key={idx} sx={{ background: idx % 2 === 0 ? '#f8fafd' : '#ede7f6', borderBottom: '1px solid #e0e0e0' }}>
                    <TableCell sx={{ color: '#222', fontWeight: 500, textAlign: 'center', maxWidth: 120, fontSize: 13, padding: '6px 4px' }}>
                      {evaluacion.nombres}
                    </TableCell>
                    <TableCell sx={{ color: '#222', textAlign: 'center', maxWidth: 120, fontSize: 13, padding: '6px 4px' }}>{evaluacion.colegio}</TableCell>
                    <TableCell sx={{ color: '#222', textAlign: 'center', maxWidth: 80, fontSize: 13, padding: '6px 4px' }}>{`${evaluacion.grado || ''}${evaluacion.grado && evaluacion.seccion ? ' - ' : ''}${evaluacion.seccion || ''}`}</TableCell>
                    <TableCell sx={{ color: '#222', textAlign: 'center', whiteSpace: 'nowrap', maxWidth: 80, fontSize: 13, padding: '6px 4px' }}>{evaluacion.fecha}</TableCell>
                    {areasEvaluadas.map(area => (
                      <TableCell align="center" key={area} sx={{ fontSize: 15, borderRight: '1px solid #f3e5f5', color: evaluacion[area] === '✔' ? '#388e3c' : '#d32f2f', background: 'inherit', padding: '4px 2px', minWidth: 32, maxWidth: 40 }}>
                        {evaluacion[area] === '✔' ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <CloseIcon sx={{ color: '#e53935' }} fontSize="small" />
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ fontWeight: 600, fontSize: 13, color: '#512da8', padding: '4px 2px' }}>{evaluacion.puntaje ?? '-'}</TableCell>
                    <TableCell align="center" sx={{ padding: '4px 2px' }}>
                      <Tooltip title={getResultadoLabel(evaluacion.RESULTADO)} placement="top">
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            backgroundColor: evaluacion.RESULTADO,
                            border: '1.5px solid #888',
                            boxShadow: '0 0 2px #aaa',
                            display: 'inline-block',
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center" sx={{ padding: '4px 2px' }}>
                      <Tooltip title="Eliminar test">
                        <Button
                          onClick={() => eliminarTest(evaluacion.estudiante_id, evaluacion.resultado_test_id)}
                          color="error"
                          size="small"
                          sx={{ minWidth: 0, p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de confirmación */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar eliminación
          </DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar este test?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleConfirmDelete} color="error" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para mensajes */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};