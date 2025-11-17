import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { getTrabajadores, crearTrabajador, getRoles, getEspecialidades, activarTrabajador, desactivarTrabajador, updateTrabajador } from '../services/trabajadorService';
import TablaUsuarios from './components/TablaUsuarios';
import ModalEditarUsuario from './components/ModalEditarUsuario';
import ModalNuevoUsuario from './components/ModalNuevoUsuario';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [openNuevoModal, setOpenNuevoModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    usuario: '',
    contrasena: '',
    rol: '',
    especialidad: '',
    email: ''
  });
  const [nuevoUsuarioErrors, setNuevoUsuarioErrors] = useState({});
  const [nuevoUsuarioLoading, setNuevoUsuarioLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [roles, setRoles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [usuarioEditandoErrors, setUsuarioEditandoErrors] = useState({});

  useEffect(() => {
    const cargarTrabajadores = async () => {
      try {
        const data = await getTrabajadores();
        setUsuarios(data);
      } catch (error) {
        setUsuarios([]);
      }
    };
    const cargarRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data); // Mantener los objetos completos de roles
      } catch (error) {
        setRoles([]);
      }
    };
    const cargarEspecialidades = async () => {
      try {
        const data = await getEspecialidades();
        setEspecialidades(data);
      } catch (error) {
        setEspecialidades([]);
      }
    };
    cargarTrabajadores();
    cargarRoles();
    cargarEspecialidades();
  }, []);

  const handleToggleActivo = async (id) => {
    const usuario = usuarios.find(u => u.id === id);
    try {
      if (usuario.estado === 1 || usuario.estado === true) {
        await desactivarTrabajador(id);
        setSnackbar({ open: true, message: 'Usuario desactivado', severity: 'success' });
        setUsuarios(usuarios.map(u =>
          u.id === id ? { ...u, estado: 0 } : u
        ));
      } else {
        await activarTrabajador(id);
        setSnackbar({ open: true, message: 'Usuario activado', severity: 'success' });
        setUsuarios(usuarios.map(u =>
          u.id === id ? { ...u, estado: 1 } : u
        ));
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cambiar el estado', severity: 'error' });
    }
  };

  // Editar usuario
  const handleEditar = (usuario) => {
    // Asegurar que la especialidad se preserve correctamente
    const usuarioConEspecialidad = {
      ...usuario,
      especialidad: usuario.especialidad || null
    };
    setUsuarioEditando(usuarioConEspecialidad);
    setOpenModal(true);
  };
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    
    // Preservar la especialidad actual si existe y no se está modificando
    const especialidadActual = usuarioEditando?.especialidad;
    
    setUsuarioEditando(prev => ({
      ...prev,
      [name]: value,
      // Si no se está modificando la especialidad y existe una especialidad actual, mantenerla
      ...(name !== 'especialidad' && especialidadActual && { especialidad: especialidadActual })
    }));
  };
  const handleGuardar = async () => {
    // Validación de campos obligatorios
    const camposObligatorios = ['nombres', 'apellidos', 'dni', 'usuario', 'rol', 'email'];
    
    // Agregar especialidad solo si el rol es Terapeuta
const rolNombre = typeof usuarioEditando.rol === 'object' && usuarioEditando.rol !== null 
  ? usuarioEditando.rol.nombre 
  : usuarioEditando.rol;
      if (rolNombre === 'Terapeuta') {
      camposObligatorios.push('especialidad');
    }
    
    const errors = {};
    for (const campo of camposObligatorios) {
      let valor = usuarioEditando[campo];
      if (campo === 'usuario' && !valor) {
        valor = usuarioEditando.username;
      }
      if (
        valor === undefined ||
        valor === null ||
        (typeof valor === 'string' && valor.trim() === '') ||
        (typeof valor === 'object' && Object.keys(valor).length === 0)
      ) {
        errors[campo] = 'Este campo es obligatorio';
      }
    }
    setUsuarioEditandoErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' });
      return;
    }
    try {
      console.log('usuarioEditando:', usuarioEditando);
      console.log('roles:', roles);
      console.log('usuarioEditando.rol:', usuarioEditando.rol);
      console.log('tipo de usuarioEditando.rol:', typeof usuarioEditando.rol);
      
      // Buscar el objeto rol y especialidad por nombre
      // El rol puede venir como objeto {id, nombre, descripcion} o como string
      let rolId = null;
      if (typeof usuarioEditando.rol === 'object' && usuarioEditando.rol.id) {
        // Si es un objeto con id, usar ese id
        rolId = usuarioEditando.rol.id;
        console.log('Rol es objeto, usando id:', rolId);
      } else if (typeof usuarioEditando.rol === 'string') {
        // Si es un string, buscar el rol por nombre y obtener su id
        const rolObj = roles.find(r => r.nombre === usuarioEditando.rol);
        rolId = rolObj ? rolObj.id : null;
        console.log('Rol es string, buscando por nombre:', usuarioEditando.rol, 'encontrado:', rolObj, 'id:', rolId);
      }
      
      // Buscar la especialidad - puede venir como objeto {id, nombre} o como string
      let especialidadId = null;
      if (typeof usuarioEditando.especialidad === 'object' && usuarioEditando.especialidad?.id) {
        // Si es un objeto con id, usar ese id
        especialidadId = usuarioEditando.especialidad.id;
        console.log('Especialidad es objeto, usando id:', especialidadId);
      } else if (typeof usuarioEditando.especialidad === 'string' && usuarioEditando.especialidad) {
        // Si es un string, buscar la especialidad por nombre y obtener su id
        const especialidadObj = especialidades.find(e => e.nombre === usuarioEditando.especialidad);
        especialidadId = especialidadObj ? especialidadObj.id : null;
        console.log('Especialidad es string, buscando por nombre:', usuarioEditando.especialidad, 'encontrado:', especialidadObj, 'id:', especialidadId);
      }
       const data = {
         nombres: usuarioEditando.nombres,
         apellidos: usuarioEditando.apellidos,
         dni: usuarioEditando.dni,
         username: usuarioEditando.usuario || usuarioEditando.username,
         email: usuarioEditando.email,
         rol_id: rolId,
         especialidad_id: especialidadId,
         telefono: usuarioEditando.telefono || null,
         telefono_emergencia: usuarioEditando.telefono_emergencia || null,
         contacto_emergencia: usuarioEditando.contacto_emergencia || null,
         direccion: usuarioEditando.direccion || null,
         distrito: usuarioEditando.distrito || null,
         provincia: usuarioEditando.provincia || null,
         departamento: usuarioEditando.departamento || null,
         talla_polo: usuarioEditando.talla_polo || null,
         talla_pantalon: usuarioEditando.talla_pantalon || null,
         talla_zapatos: usuarioEditando.talla_zapatos || null
       };

       // Solo agregar password si se está cambiando
       if (usuarioEditando.contrasena && usuarioEditando.contrasena.trim() !== '') {
         data.password = usuarioEditando.contrasena;
       }
       console.log('Data que se envía al backend:', data);
      const actualizado = await updateTrabajador(usuarioEditando.id, data);
      setUsuarios(usuarios.map(u =>
        u.id === usuarioEditando.id ? actualizado : u
      ));
      setOpenModal(false);
      setUsuarioEditando(null);
      setUsuarioEditandoErrors({});
      setSnackbar({ open: true, message: 'Usuario actualizado correctamente', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al actualizar el usuario', severity: 'error' });
    }
  };
  const handleCancelar = () => {
    setOpenModal(false);
    setUsuarioEditando(null);
  };

  // Nuevo usuario
  const handleChangeNuevo = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({ ...nuevoUsuario, [name]: value });
  };
  const handleGuardarNuevoUsuario = async () => {
    // Validación de campos obligatorios
    const camposObligatorios = ['nombres', 'apellidos', 'dni', 'usuario', 'contrasena', 'rol', 'email'];
    
    // Agregar especialidad solo si el rol es Terapeuta
    if (nuevoUsuario.rol === 'Terapeuta') {
      camposObligatorios.push('especialidad');
    }
    
    const errors = {};
    for (const campo of camposObligatorios) {
      if (!nuevoUsuario[campo] || nuevoUsuario[campo].trim() === '') {
        errors[campo] = 'Este campo es obligatorio';
      }
    }
    setNuevoUsuarioErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSnackbar({ open: true, message: 'Todos los campos son obligatorios', severity: 'error' });
      return;
    }
    setNuevoUsuarioLoading(true);
         try {
       // Buscar el objeto rol y especialidad por nombre
       const rolObj = roles.find(r => r.nombre === nuevoUsuario.rol);
       const especialidadObj = especialidades.find(e => e.nombre === nuevoUsuario.especialidad);
       const data = {
         nombres: nuevoUsuario.nombres,
         apellidos: nuevoUsuario.apellidos,
         dni: nuevoUsuario.dni,
         username: nuevoUsuario.usuario,
         password: nuevoUsuario.contrasena,
         rol_id: rolObj ? rolObj.id : null,
         especialidad_id: especialidadObj ? especialidadObj.id : null,
         email: nuevoUsuario.email
       };
      const nuevo = await crearTrabajador(data);
      setUsuarios([...usuarios, nuevo]);
      setOpenNuevoModal(false);
      setNuevoUsuario({ nombres: '', apellidos: '', dni: '', usuario: '', contrasena: '', rol: '', especialidad: '', email: '' });
      setNuevoUsuarioErrors({});
      setSnackbar({ open: true, message: 'Usuario creado correctamente', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al crear el usuario', severity: 'error' });
    } finally {
      setNuevoUsuarioLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, mt: 10 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7B1FA2' }}>
          Gestión de Usuarios
        </Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} sx={{ background: '#7B1FA2' }} onClick={() => setOpenNuevoModal(true)}>
          Nuevo usuario
        </Button>
      </Stack>
      <TablaUsuarios usuarios={usuarios} onEditar={handleEditar} onToggleActivo={handleToggleActivo} roles={roles} />
      <ModalEditarUsuario
        open={openModal}
        usuario={usuarioEditando}
        onChange={handleChangeEdit}
        onClose={handleCancelar}
        onSave={handleGuardar}
        roles={roles}
        especialidades={especialidades}
        errors={usuarioEditandoErrors}
      />
      <ModalNuevoUsuario
        open={openNuevoModal}
        usuario={nuevoUsuario}
        onChange={handleChangeNuevo}
        onClose={() => setOpenNuevoModal(false)}
        onSave={handleGuardarNuevoUsuario}
        roles={roles}
        loading={nuevoUsuarioLoading}
        errors={nuevoUsuarioErrors}
        especialidades={especialidades}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Usuarios; 