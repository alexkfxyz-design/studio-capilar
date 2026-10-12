import { useMemo, useState } from 'react'
import { NEGOCIO, CATEGORIAS } from '../config'
import { useCollection, modoDemo } from '../lib/db'
import { money, iniciales, linkWhatsApp } from '../lib/utils'
import Reserva from './Reserva.jsx'

export default function PublicSite() {
  const [servicios] = useCollection('servicios')
  const [estilistas] = useCollection('estilistas')
  const [productos] = useCollection('productos')
  const [cat, setCat] = useState('Todos')
  const [preSel, setPreSel] = useState(null)
  const [menu, setMenu] = useState(false)

  const activos = servicios.filter((s) => s.activo !== false)
  const cats = ['Todos', ...CATEGORIAS.filter((c) => activos.some((s) => s.categoria === c))]
  const lista = useMemo(() => activos.filter((s) => cat === 'Todos' || s.categoria === cat), [activos, cat])
  const equipo = estilistas.filter((e) => e.activo !== false)
  const prods = productos.filter((p) => p.activo !== false && Number(p.stock) > 0)

  const reservar = (s) => { setPreSel(s?.id || null); document.getElementById('reserva')?.scrollIntoView({ behavior: 'smooth' }) }

  return (
    <div className="pub">
      {modoDemo && <div className="demo-bar">Modo demo · los datos se guardan solo en este navegador · <a href="#admin">Ir al panel admin</a></div>}
      <header className="pub-nav">
        <a href="#inicio" className="logo"><span>{NEGOCIO.nombre}</span><small>{NEGOCIO.slogan}</small></a>
        <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menú">☰</button>
        <nav className={menu ? 'open' : ''} onClick={() => setMenu(false)}>
          <a href="#servicios">Servicios</a>
          <a href="#equipo">Equipo</a>
          {prods.length > 0 && <a href="#productos">Productos</a>}
          <a href="#contacto">Contacto</a>
          <a href="#reserva" className="btn btn-gold sm">Reservar</a>
        </nav>
      </header>

      <section id="inicio" className="hero">
        <div className="hero-inner">
          <p className="eyebrow">{NEGOCIO.slogan}</p>
          <h1>Tu estilo,<br /><em>en buenas manos.</em></h1>
          <p className="lead">{NEGOCIO.descripcion}</p>
          <div className="hero-cta">
            <button className="btn btn-gold" onClick={() => reservar(null)}>Reservar cita</button>
            <a className="btn btn-ghost" href={linkWhatsApp(NEGOCIO.whatsapp, `Hola ${NEGOCIO.nombre}, quisiera información.`)} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a>
          </div>
          <ul className="hero-facts">
            <li><b>{activos.length}</b> servicios</li>
            <li><b>{equipo.length}</b> estilistas</li>
            <li><b>Online</b> reserva 24/7</li>
          </ul>
        </div>
      </section>

      <section id="servicios" className="sec">
        <div className="sec-head">
          <p className="eyebrow">Carta de servicios</p>
          <h2>Servicios y precios</h2>
        </div>
        <div className="chips">
          {cats.map((c) => <button key={c} className={'chip' + (c === cat ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="serv-grid">
          {lista.map((s) => (
            <article key={s.id} className="serv-card">
              {s.imagen && <img src={s.imagen} alt={s.nombre} />}
              <div className="serv-body">
                <span className="tag">{s.categoria}</span>
                <h3>{s.nombre}</h3>
                <p>{s.descripcion}</p>
                <div className="serv-foot">
                  <div><b className="price">{money(s.precio)}</b><small> · {s.duracion} min</small></div>
                  <button className="btn btn-dark sm" onClick={() => reservar(s)}>Reservar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="equipo" className="sec alt">
        <div className="sec-head"><p className="eyebrow">Nuestro equipo</p><h2>Manos expertas</h2></div>
        <div className="team">
          {equipo.map((e) => (
            <div key={e.id} className="member">
              {e.foto ? <img src={e.foto} alt={e.nombre} /> : <div className="avatar xl">{iniciales(e.nombre)}</div>}
              <h3>{e.nombre}</h3>
              <p>{e.especialidad}</p>
            </div>
          ))}
        </div>
      </section>

      {prods.length > 0 && (
        <section id="productos" className="sec">
          <div className="sec-head"><p className="eyebrow">Para llevar a casa</p><h2>Productos en el salón</h2></div>
          <div className="prod-grid">
            {prods.map((p) => (
              <div key={p.id} className="prod">
                {p.imagen ? <img src={p.imagen} alt={p.nombre} /> : <div className="prod-ph">✦</div>}
                <h4>{p.nombre}</h4>
                <b className="price">{money(p.precio)}</b>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="reserva" className="sec reserva-sec">
        <div className="sec-head"><p className="eyebrow">Reserva online</p><h2>Agenda tu cita</h2></div>
        <Reserva servicios={activos} estilistas={equipo} preSel={preSel} />
      </section>

      <section id="contacto" className="sec alt">
        <div className="contact">
          <div>
            <p className="eyebrow">Visítanos</p>
            <h2>{NEGOCIO.nombre}</h2>
            <p>📍 {NEGOCIO.direccion}</p>
            <p>🕘 {NEGOCIO.horario.texto}</p>
            <p>📞 {NEGOCIO.telefono}</p>
            <div className="hero-cta">
              <a className="btn btn-dark" href={NEGOCIO.mapaUrl} target="_blank" rel="noreferrer">Cómo llegar</a>
              <a className="btn btn-ghost dark" href={NEGOCIO.instagram} target="_blank" rel="noreferrer">Instagram</a>
              <a className="btn btn-ghost dark" href={NEGOCIO.facebook} target="_blank" rel="noreferrer">Facebook</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="pub-foot">© {new Date().getFullYear()} {NEGOCIO.nombre} · <a href="#admin">Acceso personal</a></footer>
      <a className="wa-float" href={linkWhatsApp(NEGOCIO.whatsapp, `Hola ${NEGOCIO.nombre}, quisiera reservar una cita.`)} target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>
    </div>
  )
}
