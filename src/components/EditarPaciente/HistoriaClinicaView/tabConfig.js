import {
  Assessment,
  FamilyRestroom,
  Psychology,
  MedicalServices,
  Timeline,
  Description,
  School,
  Healing
} from '@mui/icons-material';

// Configuración de tabs dinámica
export const TAB_CONFIG = [
  {
    id: 'reporte-evolucion',
    label: 'Reporte de Evolución',
    icon: Assessment,
    component: 'ReporteEvolucion',
    visible: () => true, // Siempre visible
    required: true,
    description: 'Reporte detallado del progreso del paciente'
  },
  {
    id: 'entrevista-padres',
    label: 'Entrevista a Padres',
    icon: FamilyRestroom,
    component: 'EntrevistaPadres',
    visible: () => true,
    required: false,
    description: 'Información de la entrevista con los padres'
  },
  {
    id: 'evaluacion-terapia-ocupacional',
    label: 'Evaluación Terapia Ocupacional',
    icon: Healing,
    component: 'EvaluacionTerapiaOcupacional',
    visible: (paciente, serviciosPaciente = []) => {
      // SOLUCIÓN SIMPLE: Buscar el servicio con ID 2
      const tiene = serviciosPaciente.some(s => s?.servicio?.id === 2);
      console.log('🔥 TERAPIA OCUPACIONAL:', tiene ? 'SÍ' : 'NO', serviciosPaciente);
      return tiene;
    },
    required: false,
    description: 'Evaluación completa de terapia ocupacional'
  },
];

// Función SIMPLE para obtener tabs visibles
export const getVisibleTabs = (paciente, serviciosPaciente = []) => {
  console.log('🎯 Calculando tabs con servicios:', serviciosPaciente);
  const tabs = TAB_CONFIG.filter(tab => tab.visible(paciente, serviciosPaciente));
  console.log('✅ Tabs resultantes:', tabs.map(t => t.label));
  return tabs;
};

// Función para obtener un tab específico por ID
export const getTabById = (tabId) => {
  return TAB_CONFIG.find(tab => tab.id === tabId);
};

// Función para validar si un tab es requerido
export const isTabRequired = (tabId) => {
  const tab = getTabById(tabId);
  return tab?.required || false;
};

// Función para obtener el primer tab visible
export const getFirstVisibleTab = (paciente, serviciosPaciente = []) => {
  const visibleTabs = getVisibleTabs(paciente, serviciosPaciente);
  return visibleTabs.length > 0 ? visibleTabs[0] : null;
};

// Función para obtener el índice de un tab
export const getTabIndex = (tabId, paciente, serviciosPaciente = []) => {
  const visibleTabs = getVisibleTabs(paciente, serviciosPaciente);
  return visibleTabs.findIndex(tab => tab.id === tabId);
};