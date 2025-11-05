import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import TopMenu from '../components/TopMenu';

const GestionPopup = () => {
  // Estado para la imagen del popup
  const [popupConfig, setPopupConfig] = useState({
    activo: true,
    imagenUrl: '/assets/img/index/Dia-Mundial-de-la-Salud-Mental.png'
  });

  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogoSubir, setDialogoSubir] = useState(false);
  const [imagenTemporal, setImagenTemporal] = useState(null);

  // Manejadores
  const handleToggleActivo = (event) => {
    setPopupConfig(prev => ({
      ...prev,
      activo: event.target.checked
    }));
    setSnackbar({
      open: true,
      message: event.target.checked ? 'Popup activado' : 'Popup desactivado',
      severity: 'success'
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagenTemporal(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setSnackbar({
          open: true,
          message: 'Por favor seleccione un archivo de imagen válido',
          severity: 'error'
        });
      }
    }
  };

  const handleSubirImagen = () => {
    if (imagenTemporal) {
      // Aquí irá la lógica para subir la imagen al servidor
      setPopupConfig(prev => ({
        ...prev,
        imagenUrl: imagenTemporal
      }));
      setDialogoSubir(false);
      setImagenTemporal(null);
      setSnackbar({
        open: true,
        message: 'Imagen actualizada correctamente',
        severity: 'success'
      });
    }
  };

  const handleEliminarImagen = () => {
    setPopupConfig(prev => ({
      ...prev,
      imagenUrl: ''
    }));
    setSnackbar({
      open: true,
      message: 'Imagen eliminada',
      severity: 'info'
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <TopMenu />
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#424242',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <ImageIcon sx={{ fontSize: 40, color: '#A3C644' }} />
            Gestión de Popup Promocional
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Administra la imagen promocional que se muestra al cargar la página de inicio
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Configuración */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#424242' }}>
                ⚙️ Configuración
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={popupConfig.activo}
                    onChange={handleToggleActivo}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#A3C644',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#A3C644',
                      },
                    }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      Estado del Popup
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {popupConfig.activo ? 'Activo - Visible para usuarios' : 'Desactivado - Oculto'}
                    </Typography>
                  </Box>
                }
                sx={{ mb: 3 }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setDialogoSubir(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #A3C644 0%, #8fb23a 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8fb23a 0%, #7a9a32 100%)',
                    }
                  }}
                >
                  Cambiar Imagen
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setVistaPrevia(true)}
                  sx={{
                    borderColor: '#A3C644',
                    color: '#A3C644',
                    '&:hover': {
                      borderColor: '#8fb23a',
                      backgroundColor: 'rgba(163, 198, 68, 0.04)',
                    }
                  }}
                >
                  Vista Previa
                </Button>

                {popupConfig.imagenUrl && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleEliminarImagen}
                  >
                    Eliminar Imagen
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Vista previa de la imagen */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#424242' }}>
                🖼️ Imagen Actual
              </Typography>

              {popupConfig.imagenUrl ? (
                <Card sx={{ maxWidth: '100%', borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    image={popupConfig.imagenUrl}
                    alt="Imagen promocional"
                    sx={{
                      maxHeight: 500,
                      objectFit: 'contain',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      <strong>URL:</strong> {popupConfig.imagenUrl}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Estado:</strong> {popupConfig.activo ? '✅ Activo' : '❌ Desactivado'}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 300,
                    border: '2px dashed #e0e0e0',
                    borderRadius: 2,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 80, color: '#bdbdbd', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No hay imagen configurada
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => setDialogoSubir(true)}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #A3C644 0%, #8fb23a 100%)',
                    }}
                  >
                    Subir Primera Imagen
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Instrucciones */}
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                💡 Recomendaciones:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Usa imágenes en formato PNG o JPG</li>
                <li>Tamaño recomendado: 800x600 px o similar</li>
                <li>Peso máximo: 2MB para carga rápida</li>
                <li>Asegúrate que el texto sea legible</li>
              </ul>
            </Alert>
          </Grid>
        </Grid>

        {/* Diálogo para subir imagen */}
        <Dialog
          open={dialogoSubir}
          onClose={() => {
            setDialogoSubir(false);
            setImagenTemporal(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #A3C644 0%, #8fb23a 100%)',
            color: 'white',
            fontWeight: 'bold'
          }}>
            📤 Subir Nueva Imagen
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="upload-image-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="upload-image-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{
                    borderColor: '#A3C644',
                    color: '#A3C644',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    py: 3,
                    px: 4,
                    fontSize: '1.1rem'
                  }}
                >
                  Seleccionar Imagen
                </Button>
              </label>

              {imagenTemporal && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Vista Previa:
                  </Typography>
                  <img
                    src={imagenTemporal}
                    alt="Vista previa"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => {
                setDialogoSubir(false);
                setImagenTemporal(null);
              }}
              variant="outlined"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubirImagen}
              variant="contained"
              disabled={!imagenTemporal}
              sx={{
                background: 'linear-gradient(135deg, #A3C644 0%, #8fb23a 100%)',
              }}
            >
              Guardar Imagen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de vista previa */}
        <Dialog
          open={vistaPrevia}
          onClose={() => setVistaPrevia(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, #A3C644 0%, #8fb23a 100%)',
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            👁️ Vista Previa del Popup
            <IconButton
              onClick={() => setVistaPrevia(false)}
              sx={{ color: 'white' }}
            >
              <DeleteIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {popupConfig.imagenUrl ? (
              <Box sx={{ position: 'relative', backgroundColor: '#f5f5f5' }}>
                <img
                  src={popupConfig.imagenUrl}
                  alt="Imagen promocional"
                  style={{
                    width: '100%',
                    display: 'block'
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No hay imagen para previsualizar
                </Typography>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default GestionPopup;

