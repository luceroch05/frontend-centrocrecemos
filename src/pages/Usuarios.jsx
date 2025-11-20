import React, { useState, useEffect } from 'react';
import {
  UserPlus, Edit2, Power, Check, X, Search, Filter,
  Mail, Phone, MapPin, User, Users, Briefcase, AlertCircle,
  ChevronRight, Shield, Calendar, Building, Trash2, Eye, Shirt
} from 'lucide-react';
import { getTrabajadores, crearTrabajador, getRoles, getEspecialidades, activarTrabajador, desactivarTrabajador, updateTrabajador } from '../services/trabajadorService';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  
  // Modales
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  
  // Notificación
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [trabajadoresData, rolesData, especialidadesData] = await Promise.all([
        getTrabajadores(),
        getRoles(),
        getEspecialidades()
      ]);
      setUsuarios(trabajadoresData);
      setRoles(rolesData);
      setEspecialidades(especialidadesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showNotification('Error al cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleToggleActivo = async (usuario) => {
    try {
      if (usuario.estado === 1 || usuario.estado === true) {
        await desactivarTrabajador(usuario.id);
        showNotification('Usuario desactivado correctamente', 'success');
      } else {
        await activarTrabajador(usuario.id);
        showNotification('Usuario activado correctamente', 'success');
      }
      cargarDatos();
    } catch (error) {
      showNotification('Error al cambiar el estado del usuario', 'error');
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalEditar(true);
  };

  const handleVerDetalle = (usuario) => {
    setUsuarioDetalle(usuario);
    setModalDetalle(true);
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusqueda = !busqueda || 
      usuario.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellidos?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.dni?.includes(busqueda) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchRol = !filtroRol || usuario.rol?.nombre === filtroRol;
    const matchEstado = !filtroEstado || 
      (filtroEstado === 'activo' && (usuario.estado === 1 || usuario.estado === true)) ||
      (filtroEstado === 'inactivo' && (usuario.estado === 0 || usuario.estado === false));
    
    return matchBusqueda && matchRol && matchEstado;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-3 text-xs font-medium tracking-wide">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border transform transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-white border-gray-200'
            : 'bg-white border-red-200'
        } flex items-center gap-2.5`}>
          <div className={`w-1.5 h-1.5 rounded-full ${notification.type === 'success' ? 'bg-[#A3C644]' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1.5">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-500">Administra los usuarios del sistema</p>
            </div>
            
            <button
              onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all"
              />
            </div>
            
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
            >
              <option value="">Todos los roles</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
              ))}
            </select>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Lista de usuarios */}
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9C27B0] to-[#BA68C8] opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-600 font-medium text-base mb-1">No se encontraron usuarios</p>
            <p className="text-gray-400 text-sm">Ajusta los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {usuariosFiltrados.map((usuario) => (
              <TarjetaUsuario
                key={usuario.id}
                usuario={usuario}
                onEditar={handleEditar}
                onToggleActivo={handleToggleActivo}
                onVerDetalle={handleVerDetalle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Nuevo Usuario */}
      {modalNuevo && (
        <ModalNuevoUsuario
          onClose={() => setModalNuevo(false)}
          roles={roles}
          especialidades={especialidades}
          onSuccess={() => {
            cargarDatos();
            showNotification('Usuario creado correctamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      {/* Modal Editar Usuario */}
      {modalEditar && usuarioEditando && (
        <ModalEditarUsuario
          usuario={usuarioEditando}
          onClose={() => {
            setModalEditar(false);
            setUsuarioEditando(null);
          }}
          roles={roles}
          especialidades={especialidades}
          onSuccess={() => {
            cargarDatos();
            showNotification('Usuario actualizado correctamente', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      {/* Modal Detalle Usuario */}
      {modalDetalle && usuarioDetalle && (
        <ModalDetalleUsuario
          usuario={usuarioDetalle}
          onClose={() => {
            setModalDetalle(false);
            setUsuarioDetalle(null);
          }}
          onEditar={() => {
            setModalDetalle(false);
            handleEditar(usuarioDetalle);
          }}
        />
      )}
    </div>
  );
};

// Componente Tarjeta Usuario
const TarjetaUsuario = ({ usuario, onEditar, onToggleActivo, onVerDetalle }) => {
  const esActivo = usuario.estado === 1 || usuario.estado === true;
  
  return (
    <div className="group relative bg-white rounded-xl p-4 border border-gray-200 hover:border-[#7B1FA2]/50 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm transition-all ${
          esActivo 
            ? 'bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A]' 
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}>
          {usuario.nombres?.[0]}{usuario.apellidos?.[0]}
        </div>
        
        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
            {usuario.nombres} {usuario.apellidos}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1.5">
            <User className="w-3 h-3 flex-shrink-0 text-blue-500" />
            <span className="font-medium">@{usuario.username}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail className="w-3 h-3 flex-shrink-0 text-green-500" />
            <span className="truncate">{usuario.email}</span>
          </div>
        </div>

        {/* Estado badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border flex-shrink-0 ${
          esActivo 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${esActivo ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${
            esActivo ? 'text-green-700' : 'text-gray-700'
          }`}>
            {esActivo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Info adicional */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3 flex-shrink-0 text-[#7B1FA2]" />
          <span className="font-medium text-gray-700">{usuario.rol?.nombre}</span>
        </div>
        
        {usuario.especialidad && (
          <div className="flex items-center gap-2 text-xs">
            <Briefcase className="w-3 h-3 flex-shrink-0 text-orange-500" />
            <span className="text-gray-600">{usuario.especialidad.nombre}</span>
          </div>
        )}

        {usuario.telefono && (
          <div className="flex items-center gap-2 text-xs">
            <Phone className="w-3 h-3 flex-shrink-0 text-blue-500" />
            <span className="text-gray-600">{usuario.telefono}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onVerDetalle(usuario)}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
          title="Ver información completa"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver
        </button>

        <button
          onClick={() => onEditar(usuario)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#A3C644] text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#8FB82D] transition-all"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Editar
        </button>

        <button
          onClick={() => onToggleActivo(usuario)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            esActivo
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {esActivo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
};

// Modal Nuevo Usuario
const ModalNuevoUsuario = ({ onClose, roles, especialidades, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    usuario: '',
    contrasena: '',
    email: '',
    rol: '',
    especialidad: '',
    cargo: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    const camposObligatorios = ['nombres', 'apellidos', 'dni', 'usuario', 'contrasena', 'email', 'rol', 'cargo'];

    // Agregar especialidad si es terapeuta
    const rolObj = roles.find(r => r.nombre === formData.rol);
    if (rolObj?.nombre === 'Terapeuta') {
      camposObligatorios.push('especialidad');
    }

    camposObligatorios.forEach(campo => {
      if (!formData[campo]?.trim()) {
        erroresNuevos[campo] = 'Este campo es obligatorio';
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erroresNuevos.email = 'Email inválido';
    }

    if (formData.dni && !/^\d{8}$/.test(formData.dni)) {
      erroresNuevos.dni = 'Debe tener 8 dígitos';
    }

    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      onError('Por favor corrige los errores');
      return;
    }

    setLoading(true);
    try {
      const rolObj = roles.find(r => r.nombre === formData.rol);
      const especialidadObj = especialidades.find(e => e.nombre === formData.especialidad);
      
      const data = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        username: formData.usuario,
        password: formData.contrasena,
        email: formData.email,
        rol_id: rolObj?.id,
        rol: formData.rol, // Agregar rol como string
        especialidad_id: especialidadObj?.id || null,
        cargo: formData.cargo
      };

      console.log('=== DATA ENVIADA AL BACKEND ===');
      console.log('formData.rol:', formData.rol);
      console.log('rolObj:', rolObj);
      console.log('data completa:', data);

      await crearTrabajador(data);
      onSuccess();
      onClose();
    } catch (error) {
      onError('Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  const rolSeleccionado = roles.find(r => r.nombre === formData.rol);
  const esTerapeuta = rolSeleccionado?.nombre === 'Terapeuta';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5">Nuevo Usuario</h2>
              <p className="text-sm text-white/90">Completa los datos del nuevo usuario</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                error={errors.nombres}
                required
              />
              <InputField
                label="Apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                error={errors.apellidos}
                required
              />
              <InputField
                label="DNI"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                error={errors.dni}
                maxLength={8}
                required
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <InputField
                label="Usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                error={errors.usuario}
                required
              />
              <InputField
                label="Contraseña"
                name="contrasena"
                type="password"
                value={formData.contrasena}
                onChange={handleChange}
                error={errors.contrasena}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                error={errors.rol}
                options={roles.map(r => r.nombre)}
                required
              />

              <InputField
                label="Cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
                error={errors.cargo}
                placeholder="Ej: Director, Coordinador, etc."
                required
              />
            </div>

            {esTerapeuta && (
              <SelectField
                label="Especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                error={errors.especialidad}
                options={especialidades.map(e => e.nombre)}
                required
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// Modal Editar Usuario
const ModalEditarUsuario = ({ usuario, onClose, roles, especialidades, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    nombres: usuario.nombres || '',
    apellidos: usuario.apellidos || '',
    dni: usuario.dni || '',
    usuario: usuario.username || '',
    email: usuario.email || '',
    rol: usuario.rol?.nombre || '',
    especialidad: usuario.especialidad?.nombre || '',
    contrasena: '',
    cargo: usuario.cargo || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    distrito: usuario.distrito || '',
    provincia: usuario.provincia || '',
    departamento: usuario.departamento || ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    const camposObligatorios = ['nombres', 'apellidos', 'dni', 'usuario', 'email', 'rol', 'cargo'];

    const rolObj = roles.find(r => r.nombre === formData.rol);
    if (rolObj?.nombre === 'Terapeuta') {
      camposObligatorios.push('especialidad');
    }

    camposObligatorios.forEach(campo => {
      if (!formData[campo]?.trim()) {
        erroresNuevos[campo] = 'Este campo es obligatorio';
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      erroresNuevos.email = 'Email inválido';
    }

    if (formData.dni && !/^\d{8}$/.test(formData.dni)) {
      erroresNuevos.dni = 'Debe tener 8 dígitos';
    }

    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      onError('Por favor corrige los errores');
      return;
    }

    setLoading(true);
    try {
      const rolObj = roles.find(r => r.nombre === formData.rol);
      const especialidadObj = especialidades.find(e => e.nombre === formData.especialidad);
      
      const data = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        dni: formData.dni,
        username: formData.usuario,
        email: formData.email,
        rol_id: rolObj?.id,
        rol: formData.rol, // Agregar rol como string
        especialidad_id: especialidadObj?.id || null,
        cargo: formData.cargo,
        telefono: formData.telefono || null,
        direccion: formData.direccion || null,
        distrito: formData.distrito || null,
        provincia: formData.provincia || null,
        departamento: formData.departamento || null
      };

      if (formData.contrasena?.trim()) {
        data.password = formData.contrasena;
      }

      await updateTrabajador(usuario.id, data);
      onSuccess();
      onClose();
    } catch (error) {
      onError('Error al actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const rolSeleccionado = roles.find(r => r.nombre === formData.rol);
  const esTerapeuta = rolSeleccionado?.nombre === 'Terapeuta';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1.5">Editar Usuario</h2>
              <p className="text-sm text-white/90">{usuario.nombres} {usuario.apellidos}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {/* Datos básicos */}
            <Section title="Datos Básicos" icon={User} color="text-blue-600" bgColor="bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nombres"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  error={errors.nombres}
                  required
                />
                <InputField
                  label="Apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  error={errors.apellidos}
                  required
                />
                <InputField
                  label="DNI"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  error={errors.dni}
                  maxLength={8}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
              </div>
            </Section>

            {/* Acceso */}
            <Section title="Acceso al Sistema" icon={Shield} color="text-purple-600" bgColor="bg-purple-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Usuario"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  error={errors.usuario}
                  required
                />
                <InputField
                  label="Nueva Contraseña"
                  name="contrasena"
                  type="password"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para mantener"
                />
                <SelectField
                  label="Rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  error={errors.rol}
                  options={roles.map(r => r.nombre)}
                  required
                />
                <InputField
                  label="Cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  error={errors.cargo}
                  placeholder="Ej: Director, Coordinador, etc."
                  required
                />
                {esTerapeuta && (
                  <SelectField
                    label="Especialidad"
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    error={errors.especialidad}
                    options={especialidades.map(e => e.nombre)}
                    required
                  />
                )}
              </div>
            </Section>

            {/* Contacto */}
            <Section title="Información de Contacto" icon={Phone} color="text-green-600" bgColor="bg-green-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  maxLength={9}
                />
                <InputField
                  label="Distrito"
                  name="distrito"
                  value={formData.distrito}
                  onChange={handleChange}
                />
                <InputField
                  label="Provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                />
                <InputField
                  label="Departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Dirección"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    multiline
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// Componente Section
const Section = ({ title, icon: Icon, color, bgColor, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
    </div>
    <div className="pl-11">
      {children}
    </div>
  </div>
);

// Componente InputField
const InputField = ({ label, name, value, onChange, error, type = 'text', required, maxLength, placeholder, multiline }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        rows={2}
        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all resize-none bg-white text-gray-900 font-medium ${
          error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
        }`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 font-medium ${
          error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
        }`}
      />
    )}
    {error && (
      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-red-500"></span>
        {error}
      </p>
    )}
  </div>
);

// Componente SelectField
const SelectField = ({ label, name, value, onChange, error, options, required }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 font-medium ${
        error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
      }`}
    >
      <option value="">Seleccionar {label.toLowerCase()}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {error && (
      <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-red-500"></span>
        {error}
      </p>
    )}
  </div>
);

// Modal Detalle Usuario
const ModalDetalleUsuario = ({ usuario, onClose, onEditar }) => {
  const esActivo = usuario.estado === 1 || usuario.estado === true;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-white shadow-xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#7B1FA2] via-[#8E24AA] to-[#AB47BC] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                {usuario.nombres?.[0]}{usuario.apellidos?.[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {usuario.nombres} {usuario.apellidos}
                </h2>
                <p className="text-sm text-white/90">@{usuario.username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Estado Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${
            esActivo
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-gray-50 border-gray-300 text-gray-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${esActivo ? 'bg-green-500' : 'bg-gray-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wide">
              {esActivo ? 'Usuario Activo' : 'Usuario Inactivo'}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Datos Personales */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Datos Personales</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-11">
                <InfoField label="Nombres" value={usuario.nombres} />
                <InfoField label="Apellidos" value={usuario.apellidos} />
                <InfoField label="DNI" value={usuario.dni} />
                <InfoField label="Email" value={usuario.email} />
              </div>
            </div>

            {/* Información Profesional */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Información Profesional</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-11">
                <InfoField
                  label="Rol"
                  value={usuario.rol ? (typeof usuario.rol === 'object' ? usuario.rol.nombre : usuario.rol) : 'N/A'}
                />
                <InfoField
                  label="Cargo"
                  value={usuario.cargo || 'N/A'}
                />
                {usuario.especialidad && (
                  <InfoField
                    label="Especialidad"
                    value={typeof usuario.especialidad === 'object' ? usuario.especialidad.nombre : usuario.especialidad}
                  />
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Información de Contacto</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-11">
                <InfoField label="Teléfono Personal" value={usuario.telefono || 'No registrado'} />
                <InfoField label="Teléfono de Emergencia" value={usuario.telefono_emergencia || 'No registrado'} />
                <div className="col-span-2">
                  <InfoField label="Contacto de Emergencia" value={usuario.contacto_emergencia || 'No registrado'} />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Dirección</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 pl-11">
                <div className="col-span-2">
                  <InfoField label="Dirección Completa" value={usuario.direccion || 'No registrada'} />
                </div>
                <InfoField label="Distrito" value={usuario.distrito || 'N/A'} />
                <InfoField label="Provincia" value={usuario.provincia || 'N/A'} />
                <InfoField label="Departamento" value={usuario.departamento || 'N/A'} />
              </div>
            </div>

            {/* Tallas */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-pink-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Tallas</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 pl-11">
                <InfoField label="Polo/Camisa" value={usuario.talla_polo || 'No registrada'} />
                <InfoField label="Pantalón" value={usuario.talla_pantalon || 'No registrada'} />
                <InfoField label="Zapatos" value={usuario.talla_zapatos || 'No registrada'} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all"
          >
            Cerrar
          </button>
          <button
            onClick={onEditar}
            className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Editar Usuario
          </button>
        </div>
      </div>
    </>
  );
};

// Componente InfoField
const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
      {label}
    </label>
    <p className="text-sm text-gray-900 font-medium">{value || 'N/A'}</p>
  </div>
);

export default Usuarios;