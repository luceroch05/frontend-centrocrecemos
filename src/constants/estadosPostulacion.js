import {
  Schedule,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

export const CONFIGURACION_ESTADOS_POSTULACION = [
  {
    nombre: 'Nuevo',
    color: '#f59e0b',
    icono: Schedule,
    label: 'Nuevos'
  },
  {
    nombre: 'En revisión',
    color: '#06b6d4',
    icono: Warning,
    label: 'En Revisión'
  },
  {
    nombre: 'Contactado',
    color: '#8b5cf6',
    icono: CheckCircle,
    label: 'Contactados'
  },
  {
    nombre: 'Contratado',
    color: '#10b981',
    icono: CheckCircle,
    label: 'Contratados'
  },
  {
    nombre: 'Rechazado',
    color: '#ef4444',
    icono: Cancel,
    label: 'Rechazados'
  }
];

export const COLORES_ESTADO = {
  'Nuevo': 'warning',
  'En revisión': 'info',
  'Contactado': 'primary',
  'Por entrevistar': 'secondary',
  'Rechazado': 'error',
  'Contratado': 'success'
};
