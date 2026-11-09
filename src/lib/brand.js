// Imágenes de marca (están en /public). BASE_URL hace que funcionen en GitHub Pages.
const base = import.meta.env.BASE_URL
export const LOGO = base + 'logo.png'        // logo completo (monograma + nombre + slogan)
export const LOGO_LN = base + 'logo-ln.png'  // solo el monograma LN
