import { useEffect, useMemo, useRef, useState } from 'react'
import { NEGOCIO, CATEGORIAS } from '../config'
import { useCollection, modoDemo } from '../lib/db'
import { money, iniciales, linkWhatsApp } from '../lib/utils'
import { LOGO, LOGO_LN } from '../lib/brand'
import Reserva from './Reserva.jsx'

const reduceMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}

// Aparición suave al hacer scroll. Si algo falla, el contenido queda visible igual.
function useReveal(rootRef, deps) {
  const [activo, setActivo] = useState(false)
  const io = useRef(null)
  useEffect(() => {
    if (reduceMotion() || !('IntersectionObserver' in window)) return
    io.current = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.current.unobserve(e.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    setActivo(true)
    return () => io.current?.disconnect()
  }, [])
  useEffect(() => {
    if (!io.current || !rootRef.current) return
    rootRef.current.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.current.observe(el))
  }, [activo, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
  return activo
}

// Número que sube de 0 al valor final
function Contador({ valor }) {
  const [n, setN] = useState(reduceMotion() ? valor : 0)
  useEffect(() => {
    if (reduceMotion()) return setN(valor)
    let raf, t0
    const paso = (t) => {
      t0 ??= t
      const p = Math.min(1, (t - t0) / 1400)
      setN(Math.round(valor * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(paso)
    }
    const espera = setTimeout(() => (raf = requestAnimationFrame(paso)), 700)
    return () => { clearTimeout(espera); cancelAnimationFrame(raf) }
  }, [valor])
  return n
}

export default function PublicSite() {
  const [servicios] = useCollection('servicios')
  const [estilistas] = useCollection('estilistas')
  const [productos] = useCollection('productos')
  const [cat, setCat] = useState('Todos')
  const [preSel, setPreSel] = useState(null)
  const [menu, setMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const rootRef = useRef(null)

  const activos = servicios.filter((s) => s.activo !== false)
  const cats = ['Todos', ...CATEGORIAS.filter((c) => activos.some((s) => s.categoria === c))]
  const lista = useMemo(() => activos.filter((s) => cat === 'Todos' || s.categoria === cat), [activos, cat])
  const equipo = estilistas.filter((e) => e.activo !== false)
  const prods = productos.filter((p) => p.activo !== false && Number(p.stock) > 0)
  const nombresMarquee = activos.length ? activos.map((s) => s.nombre) : ['Cortes', 'Color', 'Tratamientos capilares', 'Barbería', 'Peinados']

  const reveal = useReveal(rootRef, [lista.length, cat, equipo.length, prods.length])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    h(); window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const reservar = (s) => { setPreSel(s?.id || null); document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' }) }
  const shine = { WebkitMaskImage: `url(${LOGO})`, maskImage: `url(${LOGO})` }

  return (
    <div className={'pub' + (reveal ? ' reveal-on' : '')} ref={rootRef}>
      <header className={'pub-nav' + (scrolled || menu ? ' scrolled' : '')}>
        <a href="#inicio" className="brand" onClick={() => setMenu(false)}>
          <img src={LOGO_LN} alt="" width="40" height="35" />
          <span>{NEGOCIO.nombre}<small>{NEGOCIO.slogan}</small></span>
        </a>
        <button className={'burger' + (menu ? ' open' : '')} onClick={() => setMenu(!menu)} aria-label="Menú" aria-expanded={menu}><i /><i /><i /></button>
        <nav className={menu ? 'open' : ''} onClick={() => setMenu(false)}>
          <a href="#servicios"><span>Servicios</span></a>
          {equipo.length > 0 && <a href="#equipo"><span>Equipo</span></a>}
          {prods.length > 0 && <a href="#productos"><span>Productos</span></a>}
          <a href="#contacto"><span>Contacto</span></a>
          <a href="#reserva" className="btn btn-gold sm">Reservar cita</a>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="glow g1" />
          <div className="glow g2" />
          <svg className="waves" viewBox="0 0 1440 600" preserveAspectRatio="none">
            <path d="M-50 420 C 260 300, 520 520, 820 380 S 1300 260, 1500 340" />
            <path d="M-50 460 C 300 360, 560 560, 860 420 S 1320 300, 1500 390" />
            <path d="M-50 500 C 340 420, 600 600, 900 470 S 1340 350, 1500 440" />
          </svg>
        </div>

        <div className="hero-grid">
          <div className="hero-mark">
            <div className="ring r1" />
            <div className="ring r2" />
            <div className="mark">
              <img src={LOGO} alt={`${NEGOCIO.nombre} · ${NEGOCIO.slogan}`} />
              <span className="mark-shine" style={shine} />
            </div>
          </div>

          <div className="hero-copy">
            <p className="eyebrow anim" style={{ '--i': 1 }}>Reserva online · 24/7</p>
            <h1>
              <span className="line"><span style={{ '--i': 2 }}>Tu estilo,</span></span>
              <span className="line"><em style={{ '--i': 3 }}>en buenas manos.</em></span>
            </h1>
            <p className="lead anim" style={{ '--i': 4 }}>{NEGOCIO.descripcion}</p>
            <div className="hero-cta anim" style={{ '--i': 5 }}>
              <button className="btn btn-gold" onClick={() => reservar(null)}>Reservar cita</button>
              <a className="btn btn-ghost" href={linkWhatsApp(NEGOCIO.whatsapp, `Hola ${NEGOCIO.nombre}, quisiera información.`)} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a>
            </div>
            <ul className="hero-facts anim" style={{ '--i': 6 }}>
              <li><b><Contador valor={activos.length} /></b>servicios</li>
              <li><b><Contador valor={equipo.length} /></b>especialistas</li>
              <li><b>24/7</b>reservas</li>
            </ul>
          </div>
        </div>
        <a href="#servicios" className="scroll-cue" aria-label="Ver servicios"><span /></a>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="track">
          {[...nombresMarquee, ...nombresMarquee].map((n, i) => <span key={i}>{n}<i>✦</i></span>)}
        </div>
      </div>

      <section id="servicios" className="band">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <p className="eyebrow">Carta de servicios</p>
            <h2>Servicios y precios</h2>
          </div>
          <div className="chips" data-reveal>
            {cats.map((c) => <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div className="serv-grid">
            {lista.map((s, i) => (
              <article key={s.id} className="serv-card" data-reveal style={{ '--d': i % 6 }}>
                {s.imagen && <div className="serv-img"><img src={s.imagen} alt={s.nombre} loading="lazy" /></div>}
                <div className="serv-body">
                  <span className="tag">{s.categoria}</span>
                  <h3>{s.nombre}</h3>
                  {s.descripcion && <p>{s.descripcion}</p>}
                  <div className="serv-foot">
                    <div><b className="price">{money(s.precio)}</b><small>{s.duracion} min</small></div>
                    <button className="btn btn-line sm" onClick={() => reservar(s)}>Reservar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {equipo.length > 0 && (
        <section id="equipo" className="band dark">
          <div className="wrap">
            <div className="sec-head" data-reveal><p className="eyebrow">Nuestro equipo</p><h2>Manos expertas</h2></div>
            <div className="team">
              {equipo.map((e, i) => (
                <div key={e.id} className="member" data-reveal style={{ '--d': i }}>
                  <div className="member-ph">
                    {e.foto ? <img src={e.foto} alt={e.nombre} loading="lazy" /> : <div className="avatar xl">{iniciales(e.nombre)}</div>}
                  </div>
                  <h3>{e.nombre}</h3>
                  <p>{e.especialidad}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {prods.length > 0 && (
        <section id="productos" className="band">
          <div className="wrap">
            <div className="sec-head" data-reveal><p className="eyebrow">Para llevar a casa</p><h2>Productos en el salón</h2></div>
            <div className="prod-grid">
              {prods.map((p, i) => (
                <div key={p.id} className="prod" data-reveal style={{ '--d': i % 6 }}>
                  <div className="prod-img">{p.imagen ? <img src={p.imagen} alt={p.nombre} loading="lazy" /> : <img src={LOGO_LN} alt="" className="prod-ph" />}</div>
                  <h4>{p.nombre}</h4>
                  <b className="price">{money(p.precio)}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="reserva" className="band dark reserva-band">
        <div className="wrap narrow">
          <div className="sec-head center" data-reveal><p className="eyebrow">Reserva online</p><h2>Agenda tu cita</h2><p className="sub">Elige servicio, especialista y horario. Te confirmamos por WhatsApp.</p></div>
          <div data-reveal><Reserva servicios={activos} estilistas={equipo} preSel={preSel} /></div>
        </div>
      </section>

      <section id="contacto" className="band">
        <div className="wrap contact">
          <div data-reveal>
            <p className="eyebrow">Visítanos</p>
            <h2>{NEGOCIO.nombre}</h2>
            <dl className="info">
              <div><dt>Dirección</dt><dd>{NEGOCIO.direccion}</dd></div>
              <div><dt>Horario</dt><dd>{NEGOCIO.horario.texto}</dd></div>
              <div><dt>WhatsApp</dt><dd><a href={linkWhatsApp(NEGOCIO.whatsapp, `Hola ${NEGOCIO.nombre}, quisiera información.`)} target="_blank" rel="noreferrer">{NEGOCIO.telefono}</a></dd></div>
              {NEGOCIO.tiktok && <div><dt>TikTok</dt><dd><a href={NEGOCIO.tiktok} target="_blank" rel="noreferrer">@{NEGOCIO.tiktok.split('@')[1]}</a></dd></div>}
            </dl>
            <div className="hero-cta">
              <a className="btn btn-dark" href={NEGOCIO.mapaUrl} target="_blank" rel="noreferrer">Cómo llegar</a>
              {NEGOCIO.tiktok && <a className="btn btn-ghost dark" href={NEGOCIO.tiktok} target="_blank" rel="noreferrer">TikTok</a>}
              {NEGOCIO.instagram && <a className="btn btn-ghost dark" href={NEGOCIO.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {NEGOCIO.facebook && <a className="btn btn-ghost dark" href={NEGOCIO.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            </div>
          </div>
          <div className="map-card" data-reveal style={{ '--d': 2 }}>
            <iframe
              title={`Ubicación de ${NEGOCIO.nombre} en Google Maps`}
              src={`https://www.google.com/maps?q=${NEGOCIO.ubicacion.lat},${NEGOCIO.ubicacion.lng}&z=17&hl=es&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a className="map-foot" href={NEGOCIO.mapaUrl} target="_blank" rel="noreferrer">
              <img src={LOGO_LN} alt="" width="30" height="26" />
              <span><b>{NEGOCIO.nombre}</b><small>{NEGOCIO.direccion}</small></span>
              <em>Abrir en Maps ↗</em>
            </a>
          </div>
        </div>
      </section>

      <footer className="pub-foot">
        <img src={LOGO_LN} alt="" width="54" height="47" />
        <b>{NEGOCIO.nombre}</b>
        <small>{NEGOCIO.slogan}</small>
        <p className="foot-info">{NEGOCIO.direccion}<br />WhatsApp {NEGOCIO.telefono}{NEGOCIO.tiktok && <> · <a href={NEGOCIO.tiktok} target="_blank" rel="noreferrer">TikTok</a></>}</p>
        <p>© {new Date().getFullYear()} {NEGOCIO.nombre} · <a href="#admin">Acceso personal</a></p>
      </footer>

      <a className="wa-float" href={linkWhatsApp(NEGOCIO.whatsapp, `Hola ${NEGOCIO.nombre}, quisiera reservar una cita.`)} target="_blank" rel="noreferrer" aria-label="Escríbenos por WhatsApp">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" /></svg>
      </a>
      {modoDemo && <div className="demo-bar">Modo demo · <a href="#admin">Panel admin</a></div>}
    </div>
  )
}
