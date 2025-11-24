// Este archivo exporta todos los componentes de blogs
// Para agregar un nuevo blog, solo importa y exporta aquí

// Blogs de Nutrición
import CushuroBlog from './nutricion/CushuroBlog';
import QuinuaBlog from './nutricion/QuinuaBlog';

// Blogs de Desarrollo Infantil
// import EjemploBlog from './desarrollo-infantil/EjemploBlog';

// Blogs de Psicología
import ViolenciaDomesticaBlog from './psicologia/ViolenciaDomesticaBlog';

// Blogs de Terapias
// import EjemploBlog from './terapias/EjemploBlog';

// Blogs de Familia
// import EjemploBlog from './familia/EjemploBlog';

// Blogs de Educación
// import EjemploBlog from './educacion/EjemploBlog';

// Mapa de slug a componente
export const blogComponents = {
  'cushuro-superalimento-peruano-ninos-neurodivergentes': CushuroBlog,
  'quinua-superalimento-peruano-ninos-neurodivergentes': QuinuaBlog,
  'violencia-domestica-adultos-mayores-historia-muchas-capas': ViolenciaDomesticaBlog,
  // Agrega más blogs aquí...
  // 'slug-del-blog': ComponenteBlog,
};

// Exportar componentes individuales si los necesitas
export {
  CushuroBlog,
  QuinuaBlog,
  ViolenciaDomesticaBlog,
};
