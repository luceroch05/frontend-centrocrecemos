// Metadata de todos los blogs
// Para agregar un nuevo blog, solo agrega un objeto aquí

export const blogMetadata = [
  {
    id: 1,
    slug: 'cushuro-superalimento-peruano-ninos-neurodivergentes',
    title: 'Cushuro: Un superalimento peruano ideal para niños neurodivergentes desde el primer año',
    excerpt: 'El cushuro, también conocido como llullucha, es una alga andina que crece en lagunas de altura. Su textura suave, fresca y gelatinosa lo convierte en un alimento muy interesante para niños neurodivergentes.',
    image: '/assets/img/blog/cuch.png',
    date: '15 Noviembre 2025',
    category: 'nutricion',
    categoryName: 'Nutrición',
    readTime: '8 min lectura',
    author: 'Centro Crecemos',
    heroImage: '/assets/img/blog/cuch.png'
  },
  {
    id: 2,
    slug: 'quinua-superalimento-peruano-ninos-neurodivergentes',
    title: 'Quinua: El superalimento peruano ideal para niños neurodivergentes',
    excerpt: 'La quinua es un pseudocereal andino con un perfil nutricional excepcional. Su textura suave, versatilidad y riqueza en nutrientes esenciales la convierte en un aliado fundamental para el desarrollo de niños neurodivergentes.',
    image: '/assets/img/blog/qinua-portada.jpg',
    date: '20 Noviembre 2025',
    category: 'nutricion',
    categoryName: 'Nutrición',
    readTime: '10 min lectura',
    author: 'Centro Crecemos',
    heroImage: '/assets/img/blog/qinua-portada.jpg'
  },
  {
    id: 3,
    slug: 'violencia-domestica-adultos-mayores-historia-muchas-capas',
    title: 'Más allá de la violencia doméstica: una historia con muchas capas',
    excerpt: 'A muchos adultos mayores la vida no les pesa por los años, sino por las historias que han cargado desde la infancia: silencios impuestos, miedos aprendidos, sacrificios exigidos y una forma de amar marcada por el deber.',
    image: '/assets/img/blog/violencia 1.jpg',
    date: '24 Noviembre 2025',
    category: 'psicologia',
    categoryName: 'Psicología',
    readTime: '25 min lectura',
    author: 'Lic. Giselle Burgos Del Rosario',
    heroImage: '/assets/img/blog/violencia-adultos-mayores.jpg'
  },
  {
    id: 4,
    slug: 'alimentos-omega-3-ninos-neurodivergentes',
    title: 'Alimentos que contienen Omega 3: Guía completa para niños neurodivergentes',
    excerpt: 'El Omega 3 es un nutriente esencial para el desarrollo cerebral, la regulación emocional y el bienestar general. Descubre qué alimentos naturales aportan Omega 3 y cómo incluirlos en la alimentación infantil.',
    image: '/assets/img/blog/omega.jpg',
    date: '24 Noviembre 2025',
    category: 'nutricion',
    categoryName: 'Nutrición',
    readTime: '12 min lectura',
    author: 'Leonardo Yactayo Uceda',
    heroImage: '/assets/img/blog/omega3-portada.jpg'
  },
  {
    id: 5,
    slug: '25-noviembre-dia-eliminacion-violencia-mujer',
    title: '25 de Noviembre: El Día que Nos Recuerda que la Lucha Continúa',
    excerpt: 'El color naranja inunda las calles, redes sociales y espacios públicos. La razón detrás de su uso es muy importante: se conmemoró el Día Internacional de la Eliminación de la Violencia contra la Mujer.',
    image: '/assets/img/blog/25nov-portada.jpg',
    date: '25 Noviembre 2025',
    category: 'psicologia',
    categoryName: 'Psicología',
    readTime: '8 min lectura',
    author: 'Lic. Giselle Burgos Del Rosario',
    heroImage: '/assets/img/blog/25noviembre1.jpg'
  },
  {
    id: 6,
    slug: 'tumbo-fruta-andina-ninos-neurodivergentes',
    title: 'Tumbo: Una fruta andina ideal para niños neurodivergentes desde el primer año',
    excerpt: 'El tumbo, también llamado curuba o parcha andina, es una fruta originaria de los Andes. Su pulpa suave y jugosa, junto con su sabor ligeramente ácido, la convierten en una opción muy adecuada para niños neurodivergentes.',
    image: '/assets/img/blog/tumboportada.jpg',
    date: '28 Noviembre 2025',
    category: 'nutricion',
    categoryName: 'Nutrición',
    readTime: '8 min lectura',
    author: 'Leonardo Yactayo Uceda',
    heroImage: '/assets/img/blog/tumbo-portada.jpg'
  }
  // Aquí agregas más blogs...
];

// Función helper para obtener un blog por slug
export const getBlogBySlug = (slug) => {
  return blogMetadata.find(blog => blog.slug === slug);
};

// Función helper para obtener blogs por categoría
export const getBlogsByCategory = (category) => {
  if (category === 'todos') return blogMetadata;
  return blogMetadata.filter(blog => blog.category === category);
};
