// ⚙️ Datos del negocio: cámbialos por los de la peluquería real.
export const NEGOCIO = {
  nombre: 'Look Nais',
  slogan: 'Hair Studio & Scalp Clinic',
  descripcion: 'Cortes, color y tratamientos capilares con especialistas. Reserva tu cita en menos de un minuto.',
  whatsapp: '51973061389',            // con código de país, sin + ni espacios
  telefono: '+51 973 061 389',
  direccion: 'Ramiro Prialé R-16, Alto Selva Alegre, Arequipa',
  mapaUrl: 'https://maps.app.goo.gl/c9n7ca5r2TYQbzLD8',
  ubicacion: { lat: -16.376846, lng: -71.519462 },   // para el mapa interactivo
  tiktok: 'https://www.tiktok.com/@studio.salon.look.nice',
  instagram: '',                       // déjalo vacío si no tienen; el botón se oculta solo
  facebook: '',
  moneda: 'S/',
  horario: {
    apertura: '09:00',
    cierre: '20:00',
    intervalo: 30,          // minutos entre turnos
    diasCerrados: [],       // 0 = domingo, 1 = lunes ... ej: [0] para cerrar domingos
    texto: 'Lun a Dom · 9:00 am – 8:00 pm',
  },
  diasMaxReserva: 30,       // hasta cuántos días adelante se puede reservar
}
 
export const CATEGORIAS = ['Cortes', 'Barbería', 'Color', 'Tratamientos', 'Uñas', 'Otros']
export const METODOS_PAGO = ['Efectivo', 'Yape', 'Plin', 'Tarjeta', 'Transferencia']
export const ESTADOS = {
  pendiente: { label: 'Pendiente', color: '#c98a1b' },
  confirmada: { label: 'Confirmada', color: '#2f7fb8' },
  completada: { label: 'Completada', color: '#2e8b57' },
  cancelada: { label: 'Cancelada', color: '#b23b3b' },
  noasistio: { label: 'No asistió', color: '#777' },
}
 