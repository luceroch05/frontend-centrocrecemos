import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Avatar, IconButton, Tooltip, Divider, Chip, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PhotoCamera, Save } from '@mui/icons-material';
import { getPacienteById, updatePacienteById } from '../services/pacienteService';

const DEFAULT_IMG = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const DetallePaciente = () => {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [parejas, setParejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(null);

  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        const data = await getPacienteById(id);
        // Combinar los datos del ed con las parejas para que estén en el mismo objeto
        const pacienteCompleto = {
          ...data.paciente,
          parejas: data.parejas || []
        };
        console.log('pacienteCompleto', pacienteCompleto);
        setPaciente(pacienteCompleto);
        setParejas(data.parejas || []);
      } catch (err) {
        setError('Error al cargar los datos del paciente');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    cargarPaciente();
  }, [id]);

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfil(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updatePacienteById(id, paciente);
      // Mostrar mensaje de éxito
    } catch (err) {
      setError('Error al actualizar los datos del paciente');
      console.error(err);
    }
  };

  if (loading) return <Box p={4}>Cargando...</Box>;
  if (error) return <Box p={4} color="error">{error}</Box>;
  if (!paciente) return <Box p={4}>No se encontró el paciente.</Box>;

  // Calcular edad
  const calcularEdad = (fecha) => {
    if (!fecha) return '';
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };
  const edad = calcularEdad(paciente.fecha_nacimiento);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Sección Izquierda - Foto y Datos Básicos */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={fotoPerfil || paciente.fotoPerfil}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-button-file"
                type="file"
                onChange={handleFotoChange}
              />
              <label htmlFor="icon-button-file">
                <IconButton color="primary" component="span">
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Datos del Paciente
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                <strong>Nombre Completo:</strong>
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                sx={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
              >
                {paciente.nombres} {paciente.apellido_paterno} {paciente.apellido_materno}
              </Typography>

              <Typography variant="subtitle1">
                <strong>Documento:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {paciente.tipo_documento?.nombre}: {paciente.numero_documento}
              </Typography>

              <Typography variant="subtitle1">
                <strong>Fecha de Nacimiento:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {paciente.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString() : ''}
              </Typography>

              <Typography variant="subtitle1">
                <strong>Edad:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {edad} años
              </Typography>

              <Typography variant="subtitle1">
                <strong>Sexo:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {paciente.sexo?.nombre || ''}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Sección Derecha - Formulario de Edición */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Editar Datos del Paciente
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* Datos Personales */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Datos Personales
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombres"
                    value={paciente.nombres || ''}
                    onChange={(e) => setPaciente({...paciente, nombres: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    value={paciente.apellido_paterno || ''}
                    onChange={(e) => setPaciente({...paciente, apellido_paterno: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    value={paciente.apellido_materno || ''}
                    onChange={(e) => setPaciente({...paciente, apellido_materno: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha de Nacimiento"
                    value={paciente.fecha_nacimiento || ''}
                    onChange={(e) => setPaciente({...paciente, fecha_nacimiento: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={paciente.tipo_documento?.id || ''}
                      label="Tipo de Documento"
                      onChange={(e) => setPaciente({...paciente, tipo_documento: { id: e.target.value } })}
                    >
                      <MenuItem value="1">DNI</MenuItem>
                      <MenuItem value="3">Carnet de Extranjería</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Documento"
                    value={paciente.numero_documento || ''}
                    onChange={(e) => setPaciente({...paciente, numero_documento: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sexo</InputLabel>
                    <Select
                      value={paciente.sexo?.id || ''}
                      label="Sexo"
                      onChange={(e) => setPaciente({...paciente, sexo: { id: e.target.value } })}
                    >
                      <MenuItem value="1">Masculino</MenuItem>
                      <MenuItem value="2">Femenino</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Datos de Contacto */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Datos de Contacto
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={paciente.direccion || ''}
                    onChange={(e) => setPaciente({...paciente, direccion: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={paciente.celular || ''}
                    onChange={(e) => setPaciente({...paciente, celular: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono 2"
                    value={paciente.celular2 || ''}
                    onChange={(e) => setPaciente({...paciente, celular2: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    type="email"
                    value={paciente.correo || ''}
                    onChange={(e) => setPaciente({...paciente, correo: e.target.value})}
                  />
                </Grid>

                {/* Datos de Servicio */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Datos de Servicio
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Servicio</InputLabel>
                    <Select
                      value={paciente.servicio?.id || ''}
                      label="Servicio"
                      onChange={(e) => setPaciente({...paciente, servicio: { id: e.target.value } })}
                    >
                      <MenuItem value="1">Servicio 1</MenuItem>
                      <MenuItem value="2">Servicio 2</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Motivo de Consulta"
                    value={paciente.motivo_consulta || ''}
                    onChange={(e) => setPaciente({...paciente, motivo_consulta: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Referido por"
                    value={paciente.referido_por || ''}
                    onChange={(e) => setPaciente({...paciente, referido_por: e.target.value})}
                  />
                </Grid>

                {/* Datos del Responsable */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Datos del Responsable
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Responsable"
                    value={paciente.responsable_nombre || ''}
                    onChange={(e) => setPaciente({...paciente, responsable_nombre: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    value={paciente.responsable_apellido_paterno || ''}
                    onChange={(e) => setPaciente({...paciente, responsable_apellido_paterno: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    value={paciente.responsable_apellido_materno || ''}
                    onChange={(e) => setPaciente({...paciente, responsable_apellido_materno: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      value={paciente.responsable_tipo_documento?.id || ''}
                      label="Tipo de Documento"
                      onChange={(e) => setPaciente({...paciente, responsable_tipo_documento: { id: e.target.value } })}
                    >
                      <MenuItem value="1">DNI</MenuItem>
                      <MenuItem value="3">Carnet de Extranjería</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Documento"
                    value={paciente.responsable_numero_documento || ''}
                    onChange={(e) => setPaciente({...paciente, responsable_numero_documento: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Relación</InputLabel>
                    <Select
                      value={paciente.responsable_relacion?.id || ''}
                      label="Relación"
                      onChange={(e) => setPaciente({...paciente, responsable_relacion: { id: e.target.value } })}
                    >
                      <MenuItem value="1">Padre</MenuItem>
                      <MenuItem value="2">Madre</MenuItem>
                      <MenuItem value="3">Tutor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={paciente.responsable_telefono || ''}
                    onChange={(e) => setPaciente({...paciente, responsable_telefono: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    type="email"
                    value={paciente.responsable_email || ''}
                    onChange={(e) => setPaciente({...paciente, responsable_email: e.target.value})}
                  />
                </Grid>

                {/* Información de Parejas (solo para Terapia de Pareja) */}
                {paciente.servicio?.id === 8 && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Información de Parejas
                      </Typography>
                    </Grid>
                    {parejas && parejas.length > 0 ? (
                      parejas.map((pareja, index) => (
                        <Grid item xs={12} key={pareja.id || index}>
                          <Typography variant="subtitle1" gutterBottom>
                            Pareja {index + 1}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Nombres"
                                value={pareja.nombres || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Apellido Paterno"
                                value={pareja.apellido_paterno || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Apellido Materno"
                                value={pareja.apellido_materno || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Tipo de Documento"
                                value={pareja.tipo_documento?.nombre || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Número de Documento"
                                value={pareja.numero_documento || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Celular"
                                value={pareja.celular || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Dirección"
                                value={pareja.direccion || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Correo Electrónico"
                                value={pareja.email || ''}
                                InputProps={{ readOnly: true }}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" align="center">
                          No hay información de parejas registrada
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}

                {/* Botón de Guardar */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Guardar Cambios
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetallePaciente; 