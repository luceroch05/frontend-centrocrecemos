import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, getEspecialidades } from '../services/trabajadorService';
import { UserIcon, PhoneIcon, MapPinIcon, ShoppingBagIcon, CheckCircleIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MiPerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
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
      setEspecialidades(especialidadesData || []);

      const estaCompleto = !!(
        perfilData.telefono ||
        perfilData.direccion ||
        perfilData.talla_polo ||
        perfilData.talla_pantalon ||
        perfilData.talla_zapatos
      );

      setPerfilCompleto(estaCompleto);
      setModoEdicion(!estaCompleto);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      showNotification('Error al cargar los datos del perfil', 'error');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfil({ ...perfil, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validarFormulario = () => {
    const erroresNuevos = {};
    if (!perfil.nombres?.trim()) erroresNuevos.nombres = 'Requerido';
    if (!perfil.apellidos?.trim()) erroresNuevos.apellidos = 'Requerido';
    if (!perfil.dni?.trim()) erroresNuevos.dni = 'Requerido';
    if (!perfil.email?.trim()) erroresNuevos.email = 'Requerido';
    if (perfil.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) {
      erroresNuevos.email = 'Email inválido';
    }
    if (perfil.dni && !/^\d{8}$/.test(perfil.dni)) {
      erroresNuevos.dni = '8 dígitos';
    }
    if (perfil.telefono && perfil.telefono.trim() && !/^\d{9}$/.test(perfil.telefono)) {
      erroresNuevos.telefono = '9 dígitos';
    }
    if (perfil.telefono_emergencia && perfil.telefono_emergencia.trim() && !/^\d{9}$/.test(perfil.telefono_emergencia)) {
      erroresNuevos.telefono_emergencia = '9 dígitos';
    }
    setErrors(erroresNuevos);
    return Object.keys(erroresNuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      showNotification('Por favor corrige los errores', 'error');
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
      showNotification('Perfil actualizado correctamente', 'success');
      await cargarDatos();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showNotification('Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-[#7B1FA2] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 mt-3 text-xs font-medium tracking-wide">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-sm">No se pudo cargar el perfil</p>
          <button
            onClick={cargarDatos}
            className="bg-[#7B1FA2] text-white px-5 py-2.5 rounded-lg text-xs font-medium hover:bg-[#6A1B9A] transition-all"
          >
            Reintentar
          </button>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B1FA2] to-[#6A1B9A] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {perfil.nombres?.[0]}{perfil.apellidos?.[0]}
                </div>
                {perfilCompleto && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#A3C644] rounded-full border-3 border-white flex items-center justify-center">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1.5">
                  {perfil.nombres} {perfil.apellidos}
                </h1>
                <div className="flex items-center gap-2.5 text-sm">
                  <span className="text-gray-500">{perfil.rol?.nombre}</span>
                  {perfil.especialidad && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="text-[#7B1FA2] font-medium">{perfil.especialidad.nombre}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {!modoEdicion && (
              <button
                onClick={() => setModoEdicion(true)}
                className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-xs font-medium hover:bg-[#6A1B9A] transition-all"
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>

          {/* Username y Badge */}
          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-600 font-medium border border-gray-100">
              @{perfil.username}
            </div>
            {perfilCompleto && (
              <div className="px-3.5 py-1.5 bg-[#A3C644]/10 rounded-lg text-xs text-[#A3C644] font-medium border border-[#A3C644]/20">
                Perfil Completo
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-10"></div>

        {/* Content - List Style */}
        <div className="space-y-10">
          {/* Datos Personales */}
          <Section icon={UserIcon} title="Datos Personales" color="[#7B1FA2]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Field label="Nombres" value={perfil.nombres} name="nombres" editable={modoEdicion} onChange={handleChange} error={errors.nombres} />
              <Field label="Apellidos" value={perfil.apellidos} name="apellidos" editable={modoEdicion} onChange={handleChange} error={errors.apellidos} />
              <Field label="DNI" value={perfil.dni} name="dni" editable={modoEdicion} onChange={handleChange} error={errors.dni} maxLength={8} />
              <Field label="Email" value={perfil.email} name="email" type="email" editable={modoEdicion} onChange={handleChange} error={errors.email} />
              {perfil.rol?.nombre === 'Terapeuta' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Especialidad</label>
                  {modoEdicion ? (
                    <select
                      name="especialidad"
                      value={perfil.especialidad?.id || ''}
                      onChange={(e) => {
                        const esp = especialidades.find(e => e.id === parseInt(e.target.value));
                        setPerfil({ ...perfil, especialidad: esp });
                      }}
                      className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                    >
                      <option value="">Seleccionar especialidad</option>
                      {especialidades.map(esp => (
                        <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
                      {perfil.especialidad?.nombre || '-'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          {/* Contacto */}
          <Section icon={PhoneIcon} title="Contacto" color="[#7B1FA2]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Field label="Teléfono Personal" value={perfil.telefono} name="telefono" editable={modoEdicion} onChange={handleChange} error={errors.telefono} maxLength={9} />
              <Field label="Teléfono Emergencia" value={perfil.telefono_emergencia} name="telefono_emergencia" editable={modoEdicion} onChange={handleChange} error={errors.telefono_emergencia} maxLength={9} />
              <div className="md:col-span-2">
                <Field label="Contacto Emergencia" value={perfil.contacto_emergencia} name="contacto_emergencia" editable={modoEdicion} onChange={handleChange} />
              </div>
            </div>
          </Section>

          {/* Dirección */}
          <Section icon={MapPinIcon} title="Dirección" color="[#7B1FA2]">
            <div className="space-y-6">
              <Field label="Dirección Completa" value={perfil.direccion} name="direccion" editable={modoEdicion} onChange={handleChange} multiline />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
                <Field label="Distrito" value={perfil.distrito} name="distrito" editable={modoEdicion} onChange={handleChange} />
                <Field label="Provincia" value={perfil.provincia} name="provincia" editable={modoEdicion} onChange={handleChange} />
                <Field label="Departamento" value={perfil.departamento} name="departamento" editable={modoEdicion} onChange={handleChange} />
              </div>
            </div>
          </Section>

          {/* Tallas */}
          <Section icon={ShoppingBagIcon} title="Tallas" color="[#A3C644]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Polo/Camisa</label>
                {modoEdicion ? (
                  <select
                    name="talla_polo"
                    value={perfil.talla_polo || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#A3C644] transition-all bg-white text-gray-900 font-medium hover:border-gray-300"
                  >
                    <option value="">Seleccionar</option>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                ) : (
                  <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
                    {perfil.talla_polo || '-'}
                  </div>
                )}
              </div>
              <Field label="Talla Pantalón" value={perfil.talla_pantalon} name="talla_pantalon" editable={modoEdicion} onChange={handleChange} />
              <Field label="Talla Zapatos" value={perfil.talla_zapatos} name="talla_zapatos" editable={modoEdicion} onChange={handleChange} />
            </div>
          </Section>
        </div>

        {/* Floating Action Buttons */}
        {modoEdicion && (
          <div className="fixed bottom-6 right-6 flex gap-3 z-40">
            <button
              onClick={() => {
                setModoEdicion(false);
                cargarDatos();
              }}
              className="p-3 bg-white text-gray-600 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
              title="Cancelar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="flex items-center gap-2 bg-[#A3C644] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#8FB82D] transition-all hover:shadow-lg disabled:opacity-50"
            >
              {guardando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Guardar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ icon: Icon, title, color, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center`}>
        <Icon className={`w-4 h-4 text-${color}`} />
      </div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    <div className="pl-11">
      {children}
    </div>
  </div>
);

const Field = ({ label, value, name, type = 'text', editable, onChange, error, multiline, maxLength }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{label}</label>
    {editable ? (
      <>
        {multiline ? (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all resize-none bg-white text-gray-900 font-medium ${
              error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
            }`}
            rows={2}
            placeholder={`Ingresa ${label.toLowerCase()}`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            maxLength={maxLength}
            className={`w-full px-3 py-2.5 text-sm border-2 rounded-lg focus:outline-none transition-all bg-white text-gray-900 font-medium ${
              error ? 'border-red-300 focus:border-red-400 bg-red-50/30' : 'border-gray-200 focus:border-[#7B1FA2] hover:border-gray-300'
            }`}
            placeholder={`Ingresa ${label.toLowerCase()}`}
          />
        )}
        {error && (
          <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-500"></span>
            {error}
          </p>
        )}
      </>
    ) : (
      <div className="py-2.5 px-3 text-sm text-gray-900 font-medium bg-gray-50 rounded-lg border border-gray-100">
        {value || '-'}
      </div>
    )}
  </div>
);

export default MiPerfil;