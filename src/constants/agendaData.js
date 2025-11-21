// Datos estáticos para la agenda

export const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const horas = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export const pacientes = [
  { id: 1, nombre: 'María González', documento: '12345678' },
  { id: 2, nombre: 'Carlos López', documento: '87654321' },
  { id: 3, nombre: 'Sofia Rodríguez', documento: '11223344' },
  { id: 4, nombre: 'Romeo Prueba', documento: '55667788' },
  { id: 5, nombre: 'Homero Prueba', documento: '99887766' },
  { id: 6, nombre: 'Ana García', documento: '44332211' },
  { id: 7, nombre: 'Luis Martínez', documento: '77889900' }
];

export const doctores = [
  { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Psicología' },
  { id: 2, nombre: 'Dra. Ana Martínez', especialidad: 'Terapia Ocupacional' },
  { id: 3, nombre: 'Dr. Miguel Torres', especialidad: 'Terapia de Lenguaje' },
  { id: 4, nombre: 'Dra. Carmen López', especialidad: 'Psicología Infantil' },
  { id: 5, nombre: 'Dr. Roberto Silva', especialidad: 'Terapia Familiar' }
];

export const servicios = [
  'Terapia Individual',
  'Terapia Familiar',
  'Evaluación Psicológica',
  'Terapia de Lenguaje',
  'Terapia Ocupacional',
  'Orientación Vocacional',
  'Evaluación Neuropsicológica'
];

export const motivos = [
  'Consulta inicial',
  'Seguimiento',
  'Evaluación',
  'Terapia regular',
  'Emergencia',
  'Reevaluación'
];

export const duraciones = [
  { valor: 40, label: '40 minutos' },
  { valor: 50, label: '50 minutos' }
];

export const citasEjemplo = [
  {
    id: 1,
    paciente: 'María González',
    terapeuta: 'Dr. Juan Pérez',
    fecha: '2024-01-15',
    hora: '09:00',
    duracion: 60,
    tipo: 'Terapia Individual',
    estado: 'Confirmada',
    dia: 'Lunes'
  },
  {
    id: 2,
    paciente: 'Carlos López',
    terapeuta: 'Dra. Ana Martínez',
    fecha: '2024-01-16',
    hora: '10:30',
    duracion: 45,
    tipo: 'Evaluación',
    estado: 'Pendiente',
    dia: 'Martes'
  },
  {
    id: 3,
    paciente: 'Sofia Rodríguez',
    terapeuta: 'Dr. Miguel Torres',
    fecha: '2024-01-17',
    hora: '14:00',
    duracion: 90,
    tipo: 'Terapia Familiar',
    estado: 'Confirmada',
    dia: 'Miércoles'
  },
  {
    id: 4,
    paciente: 'Romeo Prueba',
    terapeuta: 'Dr. Juan Pérez',
    fecha: '2024-01-17',
    hora: '09:00',
    duracion: 60,
    tipo: 'Evaluación',
    estado: 'Confirmada',
    dia: 'Miércoles'
  },
  {
    id: 5,
    paciente: 'Homero Prueba',
    terapeuta: 'Dra. Ana Martínez',
    fecha: '2024-01-17',
    hora: '11:00',
    duracion: 60,
    tipo: 'Terapia Individual',
    estado: 'Confirmada',
    dia: 'Miércoles'
  }
];
