// Imágenes de marca (están en /public). BASE_URL hace que funcionen en GitHub Pages.
const base = import.meta.env.BASE_URL
export const LOGO = base + 'logo.png'        // logo completo (monograma + nombre + slogan)
export const LOGO_LN = base + 'logo-ln.png'  // solo el monograma LN

// Fotos de la portada (en /public/hero). Para cambiarlas, reemplaza los archivos o edita esta lista.
export const HERO_FOTOS = [
  { src: base + 'hero/hero-1.jpg', alt: 'Estilista realizando un corte de cabello', pos: '50% 30%' },
  { src: base + 'hero/hero-2.jpg', alt: 'Lavado de cabello en el lavacabezas', pos: '50% 40%' },
  { src: base + 'hero/hero-3.jpg', alt: 'Peinado con secadora y cepillo redondo', pos: '55% 30%' },
  { src: base + 'hero/hero-4.jpg', alt: 'Masaje capilar durante el lavado', pos: '50% 40%' },
]
