import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
  Divider
} from '@mui/material';
import { ROLES_NAMES } from '../../constants/roles';

// Componente simple de botón con carga
const LoadingButton = ({ loading, children, ...props }) => (
  <Button
    {...props}
    disabled={loading || props.disabled}
    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : props.startIcon}
  >
    {children}
  </Button>
);

const ModalEditarUsuario = ({ open, usuario, onChange, onClose, onSave, roles, especialidades, errors }) => {
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Verificar si el rol seleccionado es Terapeuta
  const rolNombre = typeof usuario?.rol === 'object' ? usuario?.rol?.nombre : usuario?.rol;
  const isTerapeuta = rolNombre === ROLES_NAMES[4]; // 4 es el ID de TERAPEUTA

  // Función para manejar el cambio de rol y limpiar especialidad si no es terapeuta
  const handleRolChange = (e) => {
    const newRol = e.target.value;
    const newIsTerapeuta = newRol === ROLES_NAMES[4];

    // Si cambia de terapeuta a otro rol, limpiar especialidad
    if (!newIsTerapeuta && usuario?.especialidad) {
      onChange({ target: { name: 'especialidad', value: '' } });
    }

    onChange(e);
  };

  // Función wrapper para manejar el guardado con estado de carga
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Editar Usuario</DialogTitle>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs de edición de usuario">
          <Tab label="Datos Básicos" />
          <Tab label="Contacto y Ubicación" />
          <Tab label="Tallas" />
        </Tabs>
      </Box>
      <DialogContent dividers>
        {/* Tab 0: Datos Básicos */}
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              Información Personal
            </Typography>
            <TextField label="Nombres" name="nombres" value={usuario?.nombres || ''} onChange={onChange} fullWidth error={!!errors?.nombres} helperText={errors?.nombres} />
            <TextField label="Apellidos" name="apellidos" value={usuario?.apellidos || ''} onChange={onChange} fullWidth error={!!errors?.apellidos} helperText={errors?.apellidos} />
            <TextField label="DNI" name="dni" value={usuario?.dni || ''} onChange={onChange} fullWidth error={!!errors?.dni} helperText={errors?.dni} inputProps={{ maxLength: 8 }} />
            <TextField label="Email" name="email" value={usuario?.email || ''} onChange={onChange} fullWidth error={!!errors?.email} helperText={errors?.email} />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              Datos del Sistema
            </Typography>
            <TextField label="Usuario" name="usuario" value={usuario?.usuario || usuario?.username || ''} onChange={onChange} fullWidth error={!!errors?.usuario} helperText={errors?.usuario} />
            <TextField label="Contraseña" name="contrasena" type="password" value={usuario?.contrasena || ''} onChange={onChange} fullWidth error={!!errors?.contrasena} helperText={errors?.contrasena || 'Dejar en blanco para mantener la contraseña actual'} />
            <TextField select label="Rol" name="rol" value={usuario?.rol?.nombre || usuario?.rol || ''} onChange={handleRolChange} fullWidth error={!!errors?.rol} helperText={errors?.rol}>
              {roles.map((rol) => (
                <MenuItem key={rol.id} value={rol.nombre}>{rol.nombre}</MenuItem>
              ))}
            </TextField>
            {isTerapeuta && (
              <TextField select label="Especialidad" name="especialidad" value={usuario?.especialidad?.nombre || usuario?.especialidad || ''} onChange={onChange} fullWidth error={!!errors?.especialidad} helperText={errors?.especialidad}>
                {especialidades && especialidades.map((esp) => (
                  <MenuItem key={esp.id} value={esp.nombre}>{esp.nombre}</MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        )}

        {/* Tab 1: Contacto y Ubicación */}
        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              Información de Contacto
            </Typography>
            <TextField label="Teléfono Personal" name="telefono" value={usuario?.telefono || ''} onChange={onChange} fullWidth helperText="Número de celular" inputProps={{ maxLength: 9 }} />
            <TextField label="Teléfono de Emergencia" name="telefono_emergencia" value={usuario?.telefono_emergencia || ''} onChange={onChange} fullWidth helperText="Contacto de emergencia" inputProps={{ maxLength: 9 }} />
            <TextField label="Nombre del Contacto de Emergencia" name="contacto_emergencia" value={usuario?.contacto_emergencia || ''} onChange={onChange} fullWidth />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              Dirección
            </Typography>
            <TextField label="Dirección Completa" name="direccion" value={usuario?.direccion || ''} onChange={onChange} fullWidth multiline rows={2} helperText="Calle, número, referencia" />
            <TextField label="Distrito" name="distrito" value={usuario?.distrito || ''} onChange={onChange} fullWidth />
            <TextField label="Provincia" name="provincia" value={usuario?.provincia || ''} onChange={onChange} fullWidth />
            <TextField label="Departamento" name="departamento" value={usuario?.departamento || ''} onChange={onChange} fullWidth />
          </Box>
        )}

        {/* Tab 2: Tallas */}
        {tabValue === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold' }}>
              Información de Tallas
            </Typography>
            <TextField
              select
              label="Talla de Polo/Camisa"
              name="talla_polo"
              value={usuario?.talla_polo || ''}
              onChange={onChange}
              fullWidth
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
            <TextField label="Talla de Pantalón" name="talla_pantalon" value={usuario?.talla_pantalon || ''} onChange={onChange} fullWidth helperText="Ej: 28, 30, 32, 34, etc." />
            <TextField label="Talla de Zapatos" name="talla_zapatos" value={usuario?.talla_zapatos || ''} onChange={onChange} fullWidth helperText="Ej: 38, 39, 40, 41, etc." />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={saving}>
          Cancelar
        </Button>
        <LoadingButton
          onClick={handleSave}
          color="primary"
          variant="contained"
          loading={saving}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ModalEditarUsuario; 