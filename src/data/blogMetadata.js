// Metadata de todos los blogs
// Para agregar un nuevo blog, solo agrega un objeto aquí

export const blogMetadata = [
  {
    id: 1,
    slug: 'cushuro-superalimento-peruano-ninos-neurodivergentes',
    title: 'Cushuro: Un superalimento peruano ideal para niños neurodivergentes desde el primer año',
    excerpt: 'El cushuro, también conocido como llullucha, es una alga andina que crece en lagunas de altura. Su textura suave, fresca y gelatinosa lo convierte en un alimento muy interesante para niños neurodivergentes.',
    image: '/assets/img/blog/cuch.png',
    date: '15 Enero 2025',
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
    date: '20 Enero 2025',
    category: 'nutricion',
    categoryName: 'Nutrición',
    readTime: '10 min lectura',
    author: 'Centro Crecemos',
    heroImage: '/assets/img/blog/qinua-portada.jpg'
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
