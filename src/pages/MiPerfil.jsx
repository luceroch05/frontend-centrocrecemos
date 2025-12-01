import React, { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, getEspecialidades } from '../services/trabajadorService';
import { UserIcon, PhoneIcon, MapPinIcon, ShoppingBagIcon, CheckCircleIcon, XMarkIcon, LockClosedIcon, PlusIcon, TrashIcon, StarIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  getCuentasBancarias,
  crearCuentaBancaria,
  eliminarCuentaBancaria,
  marcarCuentaPrincipal
} from '../services/rrhhService';

const MiPerfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

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

      // ✅ CAMBIO: Usar perfil_completo en lugar de perfil_bloqueado
      const estaCompleto = perfilData.perfil_completo === true;
      setPerfilCompleto(estaCompleto);
      
      // Inicialmente desactivar modo edición
      setModoEdicion(false);
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

  // Nueva función para activar el modo edición
  const activarEdicion = () => {
    if (perfilCompleto) {
      showNotification('Tu perfil está bloqueado. Contacta al administrador para realizar cambios.', 'error');
      return;
    }
    setModoEdicion(true);
  };

  // Nueva función para cancelar edición
  const cancelarEdicion = () => {
    setModoEdicion(false);
    cargarDatos(); // Recargar datos originales
    setErrors({});
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) {
      showNotification('Por favor corrige los errores', 'error');
      return;
    }

    // Mostrar modal de confirmación personalizado
    setMostrarModalConfirmacion(true);
  };

  const confirmarGuardado = async () => {
    setMostrarModalConfirmacion(false);
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
        especialidad_id: perfil.especialidad?.id || null,
        // ✅ CAMBIO: Usar perfil_completo en lugar de perfil_bloqueado
        perfil_completo: true // MARCAR COMO COMPLETADO
      };

      await updateMyProfile(dataToUpdate);
      showNotification('Perfil guardado y bloqueado correctamente. Para cambios futuros contacta al administrador.', 'success');
      
      // Actualizar estado local
      setPerfilCompleto(true);
      setModoEdicion(false);
      
      // Recargar datos del servidor
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
          {notification.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 text-[#A3C644]" />
          ) : (
            <XMarkIcon className="w-5 h-5 text-red-500" />
          )}
          <span className="text-xs font-medium text-gray-700">{notification.message}</span>
        </div>
      )}

      {/* Modal de Confirmación */}
      {mostrarModalConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMostrarModalConfirmacion(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header con degradado */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Confirmar Guardado de Perfil</h2>
              </div>
              <button
                onClick={() => setMostrarModalConfirmacion(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-5">
                <div className="flex gap-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-amber-900 mb-2">IMPORTANTE: Lee con atención</h3>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Una vez que guardes tu perfil, <strong className="font-bold">NO podrás modificarlo por tu cuenta</strong>. Si en el futuro necesitas realizar cambios, deberás contactar al administrador del sistema.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <p className="text-sm text-gray-700 font-medium">
                  Por favor, verifica que toda la información sea correcta:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#7B1FA2] flex-shrink-0 mt-0.5" />
                    <span>Datos personales completos y correctos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#7B1FA2] flex-shrink-0 mt-0.5" />
                    <span>Información de contacto actualizada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#7B1FA2] flex-shrink-0 mt-0.5" />
                    <span>Dirección y datos de ubicación precisos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-[#7B1FA2] flex-shrink-0 mt-0.5" />
                    <span>Tallas e información adicional verificada</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-700 text-center">
                  ¿Estás seguro de que toda la información es correcta y deseas <strong className="font-bold text-[#7B1FA2]">guardar y bloquear</strong> tu perfil?
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setMostrarModalConfirmacion(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGuardado}
                disabled={guardando}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#7B1FA2] to-[#6A1B9A] rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {guardando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Sí, Guardar y Bloquear
                  </>
                )}
              </button>
            </div>
          </div>
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
            
            {/* Controles de edición */}
            <div className="flex items-center gap-3">
              {/* Mostrar mensaje si está bloqueado */}
              {perfilCompleto && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <LockClosedIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    Perfil bloqueado. Contacta al administrador para cambios.
                  </span>
                </div>
              )}
              
              {/* Botón Editar - Solo visible si NO está en modo edición y NO está bloqueado */}
              {!modoEdicion && !perfilCompleto && (
                <button
                  onClick={activarEdicion}
                  className="flex items-center gap-2 bg-[#7B1FA2] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#6A1B9A] transition-all"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar Perfil
                </button>
              )}
              
              {/* Botones Cancelar/Guardar - Solo en modo edición */}
              {modoEdicion && (
                <div className="flex gap-2">
                  <button
                    onClick={cancelarEdicion}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all border border-gray-300"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleGuardar}
                    disabled={guardando}
                    className="flex items-center gap-2 bg-[#A3C644] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#8FB82D] transition-all disabled:opacity-50"
                  >
                    {guardando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4" />
                        Guardar y Bloquear
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
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
            {!perfilCompleto && !modoEdicion && (
              <div className="px-3.5 py-1.5 bg-orange-50 rounded-lg text-xs text-orange-600 font-medium border border-orange-200 flex items-center gap-1.5">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                Completa tu perfil (solo una vez)
              </div>
            )}
            {modoEdicion && (
              <div className="px-3.5 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-600 font-medium border border-blue-200 flex items-center gap-1.5">
                <PencilIcon className="w-3.5 h-3.5" />
                Modo Edición
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

          {/* Cuentas Bancarias - Solo editable si el perfil NO está bloqueado */}
          <Section icon={ShoppingBagIcon} title="Información Bancaria" color="[#7B1FA2]">
            <CuentasBancarias 
              trabajadorId={perfil.id} 
              readOnly={perfilCompleto || !modoEdicion}
            />
          </Section>
        </div>
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

// Componente de Cuentas Bancarias integrado
const CuentasBancarias = ({ trabajadorId, readOnly = false }) => {
  const [cuentas, setCuentas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    banco: '',
    numero_cuenta: '',
    cci: ''
  });

  const bancos = [
    'BCP', 'BBVA', 'INTERBANK', 'SCOTIABANK', 'BANBIF',
    'PICHINCHA', 'BANCO DE LA NACIÓN', 'OTROS'
  ];

  useEffect(() => {
    if (trabajadorId) {
      cargarCuentas();
    }
  }, [trabajadorId]);

  const cargarCuentas = async () => {
    try {
      setLoading(true);
      const data = await getCuentasBancarias(trabajadorId);
      setCuentas(data);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCuenta = async () => {
    if (!formData.banco || !formData.numero_cuenta) {
      alert('Por favor completa banco y número de cuenta');
      return;
    }

    try {
      setLoading(true);
      await crearCuentaBancaria({
        trabajadorId: trabajadorId,
        banco: formData.banco,
        numero_cuenta: formData.numero_cuenta,
        cci: formData.cci || null,
        es_principal: cuentas.length === 0
      });

      setFormData({ banco: '', numero_cuenta: '', cci: '' });
      setMostrarFormulario(false);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al agregar cuenta:', error);
      alert('Error al agregar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) return;

    try {
      setLoading(true);
      await eliminarCuentaBancaria(id);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      alert('Error al eliminar cuenta bancaria');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarPrincipal = async (id) => {
    try {
      setLoading(true);
      await marcarCuentaPrincipal(id);
      await cargarCuentas();
    } catch (error) {
      console.error('Error al marcar cuenta principal:', error);
      alert('Error al marcar como principal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Cuentas Bancarias {cuentas.length > 0 && `(${cuentas.length})`}
        </h3>
        {trabajadorId && !readOnly && (
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
            disabled={loading}
          >
            <PlusIcon className="w-4 h-4" />
            Agregar
          </button>
        )}
      </div>

      {mostrarFormulario && !readOnly && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Banco <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.banco}
                onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all bg-white"
              >
                <option value="">Seleccionar banco</option>
                {bancos.map(banco => (
                  <option key={banco} value={banco}>{banco}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Número de Cuenta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.numero_cuenta}
                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Ej: 19412345678901"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                CCI (Código de Cuenta Interbancario)
              </label>
              <input
                type="text"
                value={formData.cci}
                onChange={(e) => setFormData({ ...formData, cci: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7B1FA2] transition-all"
                placeholder="Ej: 00219400123456789012"
                maxLength={20}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setMostrarFormulario(false);
                setFormData({ banco: '', numero_cuenta: '', cci: '' });
              }}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregarCuenta}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#7B1FA2] hover:bg-[#6A1B9A] rounded-lg transition-all"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cuenta'}
            </button>
          </div>
        </div>
      )}

      {cuentas.length === 0 && !mostrarFormulario ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-sm text-gray-500">No hay cuentas bancarias registradas</p>
          {trabajadorId && !readOnly && (
            <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar" para registrar una cuenta</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {cuentas.map((cuenta) => (
            <div
              key={cuenta.id}
              className={`relative border-2 rounded-lg p-3 transition-all ${
                cuenta.es_principal
                  ? 'border-[#A3C644] bg-green-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {cuenta.es_principal && (
                <div className="absolute -top-2 -right-2 bg-[#A3C644] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  PRINCIPAL
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{cuenta.banco}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">
                    <span className="font-medium">Cuenta:</span> {cuenta.numero_cuenta}
                  </p>
                  {cuenta.cci && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">CCI:</span> {cuenta.cci}
                    </p>
                  )}
                </div>

                {!readOnly && trabajadorId && (
                  <div className="flex items-center gap-1">
                    {!cuenta.es_principal && (
                      <button
                        onClick={() => handleMarcarPrincipal(cuenta.id)}
                        className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded transition-all"
                        title="Marcar como principal"
                        disabled={loading}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminarCuenta(cuenta.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Eliminar cuenta"
                      disabled={loading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiPerfil;