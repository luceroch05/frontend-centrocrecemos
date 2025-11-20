import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initializePageScripts } from '../utils/initScripts';

export default function BlogDetailPage() {
  const { slug } = useParams();

  useEffect(() => {
    initializePageScripts();
    window.scrollTo(0, 0);
  }, []);

  // Contenido del blog
  const blogContent = {
    'cushuro-superalimento-peruano-ninos-neurodivergentes': {
      title: 'Cushuro: Un superalimento peruano ideal para niños neurodivergentes desde el primer año',
      date: '15 Enero 2025',
      category: 'Nutrición',
      readTime: '8 min lectura',
      heroImage: '/assets/img/blog/cuch.png',
      author: 'Centro Crecemos'
    }
  };

  const post = blogContent[slug];

  if (!post) {
    return (
      <main className="main">
        <section className="section" style={{ paddingTop: '120px' }}>
          <div className="container text-center">
            <h1>Blog no encontrado</h1>
            <Link to="/blog" className="btn btn-primary mt-4">Volver al Blog</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero section" style={{
        paddingTop: '120px',
        paddingBottom: '60px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <nav aria-label="breadcrumb" data-aos="fade-right">
                <ol className="breadcrumb mb-4" style={{ backgroundColor: 'transparent' }}>
                  <li className="breadcrumb-item"><Link to="/" style={{ color: '#666' }}>Inicio</Link></li>
                  <li className="breadcrumb-item"><Link to="/blog" style={{ color: '#666' }}>Blog</Link></li>
                  <li className="breadcrumb-item active" style={{ color: '#c263f9' }}>{post.category}</li>
                </ol>
              </nav>

              <div data-aos="fade-up" data-aos-delay="100">
                <div className="mb-4">
                  <span className="badge" style={{
                    background: 'white',
                    color: '#c263f9',
                    fontSize: '0.9rem',
                    padding: '10px 24px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    border: '2px solid #c263f9',
                    boxShadow: '0 4px 12px rgba(194, 99, 249, 0.15)'
                  }}>
                    {post.category}
                  </span>
                </div>

                <h1 className="mb-4" style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  fontWeight: '700',
                  lineHeight: '1.3',
                  color: '#2d465e'
                }}>
                  {post.title}
                </h1>

                <div className="d-flex align-items-center flex-wrap gap-3" style={{
                  color: '#666',
                  fontSize: '0.95rem'
                }}>
                  <span>
                    <i className="bi bi-person-circle me-2" style={{ color: '#c263f9' }}></i>
                    Por {post.author}
                  </span>
                  <span>
                    <i className="bi bi-calendar3 me-2" style={{ color: '#c263f9' }}></i>
                    {post.date}
                  </span>
                  <span>
                    <i className="bi bi-clock me-2" style={{ color: '#c263f9' }}></i>
                    {post.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="section light-background" style={{ paddingTop: '60px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              {/* Hero Image */}
              <div className="mb-5" data-aos="fade-up">
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  minHeight: '400px'
                }}>
                  <img
                    src={post.heroImage}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Article Content */}
              <article className="blog-content" data-aos="fade-up" data-aos-delay="100">
                <div className="lead mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
                  El cushuro, también conocido como llullucha, es una alga andina que crece en lagunas de altura. Su textura suave, fresca y gelatinosa lo convierte en un alimento muy interesante para niños neurodivergentes, especialmente aquellos con:
                </div>

                <ul className="feature-list mb-5">
                  <li><i className="bi bi-check-circle-fill"></i> Sensibilidad a texturas</li>
                  <li><i className="bi bi-check-circle-fill"></i> Selectividad alimentaria</li>
                  <li><i className="bi bi-check-circle-fill"></i> Baja tolerancia a alimentos duros o muy fibrosos</li>
                  <li><i className="bi bi-check-circle-fill"></i> Necesidad de alimentos frescos y fáciles de masticar</li>
                </ul>

                <p>Además, su perfil nutricional lo hace un excelente complemento natural en la alimentación desde el año de edad en adelante, siempre con introducción gradual.</p>

                <hr className="my-5" />

                <h2 className="section-title">¿Por qué el cushuro es tan beneficioso para niños neurodivergentes?</h2>

                <div className="row gy-4 mb-5">
                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
                    <div className="benefit-card">
                      <div className="benefit-icon">
                        <i className="bi bi-droplet-fill"></i>
                      </div>
                      <h3>Textura suave y fácil de aceptar</h3>
                      <p>Ideal para niños con rechazo a alimentos crocantes o muy duros.</p>
                    </div>
                  </div>

                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
                    <div className="benefit-card">
                      <div className="benefit-icon">
                        <i className="bi bi-egg-fill"></i>
                      </div>
                      <h3>Rico en proteínas naturales</h3>
                      <p>Apoya el crecimiento, la energía y el desarrollo físico.</p>
                    </div>
                  </div>

                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
                    <div className="benefit-card">
                      <div className="benefit-icon">
                        <i className="bi bi-lightning-fill"></i>
                      </div>
                      <h3>Fuente natural de Omega 3</h3>
                      <p>Favorece la atención, regulación emocional y funciones cognitivas.</p>
                    </div>
                  </div>

                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
                    <div className="benefit-card">
                      <div className="benefit-icon">
                        <i className="bi bi-heart-pulse-fill"></i>
                      </div>
                      <h3>Hierro de buena absorción</h3>
                      <p>Ayuda a prevenir anemia y mejora la vitalidad diaria.</p>
                    </div>
                  </div>

                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
                    <div className="benefit-card">
                      <div className="benefit-icon">
                        <i className="bi bi-water"></i>
                      </div>
                      <h3>Muy hidratante</h3>
                      <p>Perfecto para niños que suelen comer poca cantidad o rechazan alimentos secos.</p>
                    </div>
                  </div>
                </div>

                <hr className="my-5" />

                <h2 className="section-title">¿Cómo consumir cushuro en casa?</h2>

                <div className="alert-info mb-5">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  Solo preparaciones frescas, naturales, sin cocción y sin alimentos procesados
                </div>

                <p className="mb-5">Después de lavarlo bien, puedes incorporarlo de formas suaves y agradables:</p>

                <div className="recipe-section mb-5" data-aos="fade-up">
                  <div className="recipe-number">1</div>
                  <h3 className="recipe-title">Ensalada de verduras frescas</h3>
                  <div className="recipe-content">
                    <div className="recipe-image-placeholder">
                      <img src="/assets/img/blog/blog.png" alt="Ensalada con cushuro" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <p className="mt-3"><strong>Ingredientes:</strong> Cushuro entero + tomate + pepino + unas gotas de limón.</p>
                    <p>Una opción refrescante y fácil de adaptar a la tolerancia sensorial del niño.</p>
                  </div>
                </div>

                <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="100">
                  <div className="recipe-number">2</div>
                  <h3 className="recipe-title">Ensalada de frutas</h3>
                  <div className="recipe-content">
                    <div className="recipe-image-placeholder">
                      <img src="/assets/img/blog/2.ensaladadefruta.png" alt="Cushuro con frutas" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <p className="mt-3"><strong>Combinación suave:</strong> Papaya, manzana, plátano o fresas.</p>
                    <p>El cushuro entero se mezcla de forma natural gracias a su textura gelatinosa.</p>
                  </div>
                </div>

                <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="200">
                  <div className="recipe-number">3</div>
                  <h3 className="recipe-title">Desayuno fresco tipo bowl</h3>
                  <div className="recipe-content">
                    <div className="recipe-image-placeholder">
                      <img src="/assets/img/blog/3.desayunobowl.png" alt="Bowl con cushuro" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <ul className="mt-3">
                      <li>Frutas frescas picadas</li>
                      <li>Cushuro sin procesar</li>
                      <li>Opcional: un poquito de yogur natural si el niño lo tolera</li>
                    </ul>
                    <p className="text-muted">(Sin harinas, sin pan, sin procesados)</p>
                  </div>
                </div>

                <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="300">
                  <div className="recipe-number">4</div>
                  <h3 className="recipe-title">Para llevar al colegio o estimulación temprana</h3>
                  <div className="recipe-content">
                    <div className="recipe-image-placeholder">
                      <img src="/assets/img/blog/4.parallevarcolegio.png" alt="Lonchera con cushuro" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    <p className="mt-3"><strong>Preparaciones fáciles de transportar:</strong></p>
                    <ul>
                      <li>Ensaladita fría de cushuro con verduras suaves</li>
                      <li>Fruta picada + cushuro</li>
                      <li>Cushuro con palta suave en un envase pequeño</li>
                    </ul>
                  </div>
                </div>

                <div className="recipe-section mb-5" data-aos="fade-up" data-aos-delay="400">
                  <div className="recipe-number">5</div>
                  <h3 className="recipe-title">Añadir cushuro entero a platos fríos</h3>
                  <div className="recipe-content">
                    <p><strong>Ideal en:</strong></p>
                    <ul>
                      <li>Palta rellena</li>
                      <li>Verduras frías</li>
                      <li>Platos servidos a temperatura ambiente</li>
                    </ul>
                  </div>
                </div>

                <hr className="my-5" />

                <h2 className="section-title">Ideas sencillas para incluirlo en la lonchera</h2>

                <div className="row gy-4 mb-5">
                  <div className="col-md-4" data-aos="flip-up" data-aos-delay="100">
                    <div className="idea-card">
                      <i className="bi bi-apple"></i>
                      <h3>Fruta fresca con cushuro</h3>
                      <p>Una mezcla muy fácil de aceptar.</p>
                    </div>
                  </div>

                  <div className="col-md-4" data-aos="flip-up" data-aos-delay="200">
                    <div className="idea-card">
                      <i className="bi bi-cup-straw"></i>
                      <h3>Mini bowl frío</h3>
                      <p>Palta + cushuro + gotas de limón.</p>
                    </div>
                  </div>

                  <div className="col-md-4" data-aos="flip-up" data-aos-delay="300">
                    <div className="idea-card">
                      <i className="bi bi-hand-index"></i>
                      <h3>Verduras suaves para dedos</h3>
                      <p>Pepino, tomate cherry, cushuro entero.</p>
                    </div>
                  </div>
                </div>

                <hr className="my-5" />

                <h2 className="section-title">Tips importantes para familias</h2>

                <div className="tips-box mb-5" data-aos="fade-up">
                  <i className="bi bi-lightbulb-fill"></i>
                  <ul>
                    <li>Lavar con abundante agua antes de usar.</li>
                    <li>Mantener siempre refrigerado.</li>
                    <li>Introducir poco a poco para observar tolerancia sensorial y digestiva.</li>
                    <li>Ofrecer en contextos tranquilos y sin presión.</li>
                    <li>Evitar mezclarlo con alimentos procesados o harinas, para mantener su aporte natural.</li>
                  </ul>
                </div>

                <hr className="my-5" />

                <h2 className="section-title">Nota importante antes de finalizar</h2>

                <div className="warning-box mb-5" data-aos="fade-up">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <div>
                    <p className="mb-2"><strong>Cuando se introduce un alimento nuevo en niños pequeños o neurodivergentes:</strong></p>
                    <ul className="mb-0">
                      <li>Hazlo en pequeñas cantidades.</li>
                      <li>Observa la tolerancia sensorial, digestiva y conductual.</li>
                      <li>Si hay antecedentes de alergias, es recomendable consultar con un alergólogo antes de ofrecerlo.</li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* Share Section */}
              <div className="share-section mt-5 pt-5 border-top" data-aos="fade-up">
                <h3 className="h5 mb-4">Compartir este artículo</h3>
                <div className="d-flex flex-wrap gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn share-fb"
                  >
                    <i className="bi bi-facebook"></i>
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${post.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn share-tw"
                  >
                    <i className="bi bi-twitter"></i>
                    Twitter
                  </a>
                  <a
                    href={`https://wa.me/?text=${post.title} ${window.location.href}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn share-wa"
                  >
                    <i className="bi bi-whatsapp"></i>
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Back to Blog */}
              <div className="mt-5 text-center" data-aos="fade-up">
                <Link to="/blog" className="btn btn-primary btn-lg">
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver al Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .blog-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #444 !important;
        }

        .blog-content p {
          margin-bottom: 1.5rem;
        }

        .feature-list {
          list-style: none;
          padding: 0;
        }

        .feature-list li {
          padding: 0.8rem 0;
          font-size: 1.05rem;
          display: flex;
          align-items: center;
        }

        .feature-list i {
          color: #c263f9 !important;
          margin-right: 0.8rem;
          font-size: 1.2rem;
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2d465e !important;
          margin-bottom: 2rem;
          position: relative;
          padding-bottom: 1rem;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background: #c263f9;
        }

        .benefit-card {
          background: #fff !important;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          height: 100%;
          transition: all 0.3s ease;
        }

        .benefit-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(194, 99, 249, 0.15);
        }

        .benefit-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #c263f9 0%, #d99ffd 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .benefit-icon i {
          font-size: 1.8rem;
          color: white !important;
        }

        .benefit-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2d465e !important;
          margin-bottom: 0.8rem;
        }

        .benefit-card p {
          color: #666 !important;
          margin-bottom: 0;
          font-size: 0.95rem;
        }

        .alert-info {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          padding: 1.2rem 1.5rem;
          border-radius: 8px;
          color: #1565c0;
          font-weight: 600;
        }

        .recipe-section {
          position: relative;
          padding-left: 80px;
          margin-bottom: 3rem;
        }

        .recipe-number {
          position: absolute;
          left: 0;
          top: 0;
          width: 50px;
          height: 50px;
          background: #c263f9;
          color: white !important;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .recipe-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d465e !important;
          margin-bottom: 1rem;
        }

        .recipe-content {
          background: #f9f9f9;
          padding: 2rem;
          border-radius: 12px;
        }

        .recipe-image-placeholder {
          width: 100%;
          height: 300px;
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .recipe-image-placeholder img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .idea-card {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
        }

        .idea-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(194, 99, 249, 0.15);
        }

        .idea-card i {
          font-size: 3rem;
          color: #c263f9 !important;
          margin-bottom: 1rem;
        }

        .idea-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2d465e !important;
          margin-bottom: 0.8rem;
        }

        .idea-card p {
          color: #666 !important;
          margin-bottom: 0;
          font-size: 0.9rem;
        }

        .tips-box {
          background: #fff8e1;
          border-left: 4px solid #ffc107;
          padding: 1.5rem 2rem;
          border-radius: 8px;
          display: flex;
          gap: 1.5rem;
        }

        .tips-box i {
          font-size: 2rem;
          color: #ffc107;
          flex-shrink: 0;
        }

        .tips-box ul {
          margin-bottom: 0;
        }

        .warning-box {
          background: #ffebee;
          border-left: 4px solid #f44336;
          padding: 1.5rem 2rem;
          border-radius: 8px;
          display: flex;
          gap: 1.5rem;
        }

        .warning-box i {
          font-size: 2rem;
          color: #f44336;
          flex-shrink: 0;
        }

        .warning-box ul {
          margin-bottom: 0;
        }

        .share-section {
          padding: 2rem;
          background: #f9f9f9;
          border-radius: 12px;
        }

        .share-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          color: white;
        }

        .share-btn:hover {
          transform: translateY(-2px);
          color: white;
        }

        .share-fb {
          background: #1877f2;
        }

        .share-fb:hover {
          background: #0d65d9;
        }

        .share-tw {
          background: #1da1f2;
        }

        .share-tw:hover {
          background: #0c8bd9;
        }

        .share-wa {
          background: #25d366;
        }

        .share-wa:hover {
          background: #1fb855;
        }

        @media (max-width: 768px) {
          .recipe-section {
            padding-left: 0;
            padding-top: 70px;
          }

          .recipe-number {
            left: 50%;
            transform: translateX(-50%);
          }

          .section-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}
