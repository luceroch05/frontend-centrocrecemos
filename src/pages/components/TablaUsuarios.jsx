import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  IconButton,
  Chip,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ModalDetalleUsuario = ({ open, usuario, onClose }) => {
  if (!usuario) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#7B1FA2', color: 'white', fontWeight: 'bold' }}>
        Información Completa del Trabajador
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          {/* Datos Personales */}
          <Typography variant="h6" sx={{ color: '#7B1FA2', fontWeight: 'bold', mb: 2 }}>
            Datos Personales
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Nombres</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.nombres || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Apellidos</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.apellidos || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">DNI</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.dni || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Email</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.email || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Rol</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {usuario.rol ? (typeof usuario.rol === 'object' ? usuario.rol.nombre : usuario.rol) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Especialidad</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {usuario.especialidad ? (typeof usuario.especialidad === 'object' ? usuario.especialidad.nombre : usuario.especialidad) : 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Datos de Contacto */}
          <Typography variant="h6" sx={{ color: '#7B1FA2', fontWeight: 'bold', mb: 2 }}>
            Datos de Contacto
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Teléfono Personal</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.telefono || 'No registrado'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Teléfono de Emergencia</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.telefono_emergencia || 'No registrado'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Contacto de Emergencia</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.contacto_emergencia || 'No registrado'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Dirección */}
          <Typography variant="h6" sx={{ color: '#7B1FA2', fontWeight: 'bold', mb: 2 }}>
            Dirección
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Dirección Completa</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.direccion || 'No registrada'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">Distrito</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.distrito || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">Provincia</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.provincia || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">Departamento</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.departamento || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Tallas */}
          <Typography variant="h6" sx={{ color: '#7B1FA2', fontWeight: 'bold', mb: 2 }}>
            Tallas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">Talla de Polo/Camisa</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.talla_polo || 'No registrada'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">Talla de Pantalón</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.talla_pantalon || 'No registrada'}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">Talla de Zapatos</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{usuario.talla_zapatos || 'No registrada'}</Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#7B1FA2', fontWeight: 'bold' }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TablaUsuarios = ({ usuarios, onEditar, onToggleActivo }) => {
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  const handleVerDetalle = (usuario) => {
    setUsuarioDetalle(usuario);
    setOpenDetalle(true);
  };

  const handleCerrarDetalle = () => {
    setOpenDetalle(false);
    setUsuarioDetalle(null);
  };

  return (
    <>
      <ModalDetalleUsuario open={openDetalle} usuario={usuarioDetalle} onClose={handleCerrarDetalle} />
  <Paper sx={{ p: 2 }}>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#7B1FA2' }}>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Nombre</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Correo Personal</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Rol</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Especialidad</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Usuario Sistema</TableCell>
            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id} hover>
              <TableCell>{usuario.nombre || usuario.nombres + ' ' + usuario.apellidos}</TableCell>
              <TableCell>{usuario.correo || usuario.email}</TableCell>
              <TableCell>{usuario.rol ? (typeof usuario.rol === 'object' ? usuario.rol.nombre : usuario.rol) : ''}</TableCell>
              <TableCell>{usuario.especialidad ? (typeof usuario.especialidad === 'object' ? usuario.especialidad.nombre : usuario.especialidad) : ''}</TableCell>
              <TableCell>{usuario.username}</TableCell>
              <TableCell>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Switch
                    checked={usuario.estado === 1 || usuario.estado === true}
                    onChange={() => onToggleActivo(usuario.id)}
                    color="primary"
                  />
                  <Chip
                    label={(usuario.estado === 1 || usuario.estado === true) ? 'Activo' : 'Inactivo'}
                    color={(usuario.estado === 1 || usuario.estado === true) ? 'success' : 'default'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Stack>
              </TableCell>
              <TableCell align="center">
                <IconButton color="primary" onClick={() => handleVerDetalle(usuario)} title="Ver detalles">
                  <VisibilityIcon />
                </IconButton>
                <IconButton color="primary" onClick={() => onEditar(usuario)} title="Editar">
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
    </>
  );
};

export default TablaUsuarios; 