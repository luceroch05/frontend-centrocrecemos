import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import { getMyProfile, updateMyProfile, getEspecialidades } from '../services/trabajadorService';

const MiPerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [perfilData, especialidadesData] = await Promise.all([
        getMyProfile(),
        getEspecialidades()
      ]);
      setPerfil(perfilData);
      setEspecialidades(especialidadesData);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setSnackbar({ open: true, message: 'Error al cargar los datos del perfil', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil({ ...perfil, [name]: value });
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validarFormulario = () => {
    const erroresNuevos = {};

    // Validar campos obligatorios
    if (!perfil.nombres?.trim()) erroresNuevos.nombres = 'El nombre es obligatorio';
    if (!perfil.apellidos?.trim()) erroresNuevos.apellidos = 'Los apellidos son obligatorios';
    if (!perfil.dni?.trim()) erroresNuevos.dni = 'El DNI es obligatorio';
    if (!perfil.email?.trim()) erroresNuevos.email = 'El email es obligatorio';

    // Validar formato de email
    if (perfil.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) {
      erroresNuevos.email = 'El formato del email no es válido';
    }

    // Validar DNI (8 dígitos)
    if (perfil.dni && !/^\d{8}$/.test(perfil.dni)) {
      erroresNuevos.dni = 'El DNI debe tener 8 dígitos';
    }

    // Validar teléfonos (si están presentes, deben tener formato válido)
    if (perfil.telefono && perfil.telefono.trim() && !/^\d{9}$/.test(perfil.telefono)) {
      erroresNuevos.telefono = 'El teléfono debe tener 9 dígitos';
    }
    if (perfil.telefono_emergencia && perfil.telefono_emergencia.trim() && !/^\d{9}$/.test(perfil.telefono_emergencia)) {
      erroresNuevos.telefono_emergencia = 'El teléfono debe tener 9 dígitos';
    }

    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      setSnackbar({ open: true, message: 'Por favor corrige los errores en el formulario', severity: 'error' });
      return;
    }

    setGuardando(true);
    try {
      const dataToUpdate = {
        nombres: perfil.nombres,
        apellidos: perfil.apellidos,
        dni: perfil.dni,
        email: perfil.email,
        telefono: perfil.telefono || null,
        telefono_emergencia: perfil.telefono_emergencia || null,
        contacto_emergencia: perfil.contacto_emergencia || null,
        direccion: perfil.direccion || null,
        distrito: perfil.distrito || null,
        provincia: perfil.provincia || null,
        departamento: perfil.departamento || null,
        talla_polo: perfil.talla_polo || null,
        talla_pantalon: perfil.talla_pantalon || null,
        talla_zapatos: perfil.talla_zapatos || null,
        especialidad_id: perfil.especialidad?.id || null
      };

      await updateMyProfile(dataToUpdate);
      setSnackbar({ open: true, message: 'Perfil actualizado correctamente', severity: 'success' });
      await cargarDatos(); // Recargar datos para obtener la versión actualizada
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setSnackbar({ open: true, message: 'Error al actualizar el perfil', severity: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress sx={{ color: '#7B1FA2' }} />
      </Box>
    );
  }

  if (!perfil) {
    return (
      <Box sx={{ p: 3, mt: 10 }}>
        <Alert severity="error">No se pudo cargar la información del perfil</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 10 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7B1FA2', mb: 3 }}>
        Mi Perfil
      </Typography>

      {/* Datos Personales */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ color: '#7B1FA2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
            Datos Personales
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombres"
              name="nombres"
              value={perfil.nombres || ''}
              onChange={handleChange}
              required
              error={!!errors.nombres}
              helperText={errors.nombres}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Apellidos"
              name="apellidos"
              value={perfil.apellidos || ''}
              onChange={handleChange}
              required
              error={!!errors.apellidos}
              helperText={errors.apellidos}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="DNI"
              name="dni"
              value={perfil.dni || ''}
              onChange={handleChange}
              required
              error={!!errors.dni}
              helperText={errors.dni}
              inputProps={{ maxLength: 8 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={perfil.email || ''}
              onChange={handleChange}
              required
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Usuario"
              value={perfil.username || ''}
              disabled
              helperText="El usuario no se puede modificar"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rol"
              value={perfil.rol?.nombre || ''}
              disabled
              helperText="El rol es asignado por el administrador"
            />
          </Grid>
          {perfil.rol?.nombre === 'Terapeuta' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Especialidad"
                name="especialidad"
                value={perfil.especialidad?.id || ''}
                onChange={(e) => {
                  const especialidadSeleccionada = especialidades.find(esp => esp.id === e.target.value);
                  setPerfil({ ...perfil, especialidad: especialidadSeleccionada });
                }}
              >
                {especialidades.map((esp) => (
                  <MenuItem key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Datos de Contacto */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ContactPhoneIcon sx={{ color: '#7B1FA2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
            Datos de Contacto
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono Personal"
              name="telefono"
              value={perfil.telefono || ''}
              onChange={handleChange}
              error={!!errors.telefono}
              helperText={errors.telefono || 'Ingrese su número de celular'}
              inputProps={{ maxLength: 9 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono de Emergencia"
              name="telefono_emergencia"
              value={perfil.telefono_emergencia || ''}
              onChange={handleChange}
              error={!!errors.telefono_emergencia}
              helperText={errors.telefono_emergencia || 'Número de contacto de emergencia'}
              inputProps={{ maxLength: 9 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre del Contacto de Emergencia"
              name="contacto_emergencia"
              value={perfil.contacto_emergencia || ''}
              onChange={handleChange}
              helperText="Nombre de la persona a contactar en caso de emergencia"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Dirección */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOnIcon sx={{ color: '#7B1FA2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
            Dirección
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección Completa"
              name="direccion"
              value={perfil.direccion || ''}
              onChange={handleChange}
              multiline
              rows={2}
              helperText="Calle, número, referencia, etc."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Distrito"
              name="distrito"
              value={perfil.distrito || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Provincia"
              name="provincia"
              value={perfil.provincia || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Departamento"
              name="departamento"
              value={perfil.departamento || ''}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tallas */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CheckroomIcon sx={{ color: '#7B1FA2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
            Tallas
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Talla de Polo/Camisa"
              name="talla_polo"
              value={perfil.talla_polo || ''}
              onChange={handleChange}
            >
              <MenuItem value="">Seleccionar</MenuItem>
              <MenuItem value="XS">XS</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="XL">XL</MenuItem>
              <MenuItem value="XXL">XXL</MenuItem>
              <MenuItem value="XXXL">XXXL</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Talla de Pantalón"
              name="talla_pantalon"
              value={perfil.talla_pantalon || ''}
              onChange={handleChange}
              helperText="Ej: 28, 30, 32, 34, etc."
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Talla de Zapatos"
              name="talla_zapatos"
              value={perfil.talla_zapatos || ''}
              onChange={handleChange}
              helperText="Ej: 38, 39, 40, 41, etc."
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Botón Guardar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={guardando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleGuardar}
          disabled={guardando}
          sx={{
            background: '#7B1FA2',
            '&:hover': { background: '#6A1B9A' },
            px: 4,
            py: 1.5
          }}
        >
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MiPerfil;
