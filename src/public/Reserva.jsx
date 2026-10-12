import { useEffect, useMemo, useState } from 'react'
import { NEGOCIO } from '../config'
import { useCollection, crearCita } from '../lib/db'
import { money, hoy, addDays, fechaLarga, hora12, turnosDisponibles, iniciales, linkWhatsApp } from '../lib/utils'

export default function Reserva({ servicios, estilistas, preSel }) {
  const [bloqueos] = useCollection('bloqueos')
  const [paso, setPaso] = useState(1)
  const [servId, setServId] = useState(null)
  const [estId, setEstId] = useState('cualquiera')
  const [fecha, setFecha] = useState(hoy())
  const [turno, setTurno] = useState(null)
  const [datos, setDatos] = useState({ cliente: '', telefono: '', notas: '' })
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { if (preSel) { setServId(preSel); setPaso(2); setOk(null) } }, [preSel])

  const serv = servicios.find((s) => s.id === servId)
  const dias = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(hoy(), i))
    .filter((d) => !NEGOCIO.horario.diasCerrados.includes(new Date(d + 'T12:00').getDay())), [])
  const turnos = useMemo(() => serv ? turnosDisponibles({ fecha, duracion: Number(serv.duracion), estilistaId: estId, estilistas, bloqueos }) : [],
    [serv, fecha, estId, estilistas, bloqueos])

  const confirmar = async (e) => {
    e.preventDefault()
    if (!/^9\d{8}$/.test(datos.telefono.replace(/\s/g, ''))) return setError('Ingresa un celular válido de 9 dígitos (empieza con 9).')
    setError(''); setEnviando(true)
    try {
      const est = estilistas.find((x) => x.id === turno.estilistaId)
      const cita = {
        cliente: datos.cliente.trim(), telefono: datos.telefono.replace(/\s/g, ''), notas: datos.notas.trim(),
        servicioId: serv.id, servicioNombre: serv.nombre, precio: Number(serv.precio), duracion: Number(serv.duracion),
        estilistaId: est.id, estilistaNombre: est.nombre, fecha, hora: turno.hora, estado: 'pendiente', origen: 'web',
      }
      await crearCita(cita)
      setOk(cita)
    } catch (err) { setError('No se pudo registrar la cita. Intenta de nuevo o escríbenos por WhatsApp.'); console.error(err) }
    setEnviando(false)
  }

  const reiniciar = () => { setOk(null); setPaso(1); setServId(null); setTurno(null); setDatos({ cliente: '', telefono: '', notas: '' }) }

  if (ok) {
    const msg = `Hola ${NEGOCIO.nombre}, acabo de reservar:\n• ${ok.servicioNombre} con ${ok.estilistaNombre}\n• ${fechaLarga(ok.fecha)} a las ${hora12(ok.hora)}\nA nombre de ${ok.cliente}.`
    return (
      <div className="booking done">
        <div className="check">✓</div>
        <h3>¡Cita reservada, {ok.cliente.split(' ')[0]}!</h3>
        <p><b>{ok.servicioNombre}</b> con {ok.estilistaNombre}</p>
        <p className="big">{fechaLarga(ok.fecha)} · {hora12(ok.hora)}</p>
        <p className="muted">Te esperamos en {NEGOCIO.direccion}. Si no puedes asistir, avísanos con anticipación.</p>
        <div className="hero-cta center">
          <a className="btn btn-gold" href={linkWhatsApp(NEGOCIO.whatsapp, msg)} target="_blank" rel="noreferrer">Confirmar por WhatsApp</a>
          <button className="btn btn-ghost dark" onClick={reiniciar}>Hacer otra reserva</button>
        </div>
      </div>
    )
  }

  return (
    <div className="booking">
      <ol className="steps">
        {['Servicio', 'Estilista', 'Fecha y hora', 'Tus datos'].map((t, i) => (
          <li key={t} className={paso === i + 1 ? 'on' : paso > i + 1 ? 'done' : ''} onClick={() => paso > i + 1 && setPaso(i + 1)}><span>{i + 1}</span>{t}</li>
        ))}
      </ol>

      {paso === 1 && (
        <div className="pick-list">
          {servicios.map((s) => (
            <button key={s.id} className={'pick' + (s.id === servId ? ' on' : '')} onClick={() => { setServId(s.id); setTurno(null); setPaso(2) }}>
              <span><b>{s.nombre}</b><small>{s.categoria} · {s.duracion} min</small></span>
              <b className="price">{money(s.precio)}</b>
            </button>
          ))}
        </div>
      )}

      {paso === 2 && (
        <div className="pick-grid">
          <button className={'pick-card' + (estId === 'cualquiera' ? ' on' : '')} onClick={() => { setEstId('cualquiera'); setTurno(null); setPaso(3) }}>
            <div className="avatar">★</div><b>Cualquiera</b><small>Más horarios disponibles</small>
          </button>
          {estilistas.map((e) => (
            <button key={e.id} className={'pick-card' + (estId === e.id ? ' on' : '')} onClick={() => { setEstId(e.id); setTurno(null); setPaso(3) }}>
              {e.foto ? <img src={e.foto} alt="" className="avatar" /> : <div className="avatar">{iniciales(e.nombre)}</div>}
              <b>{e.nombre}</b><small>{e.especialidad}</small>
            </button>
          ))}
        </div>
      )}

      {paso === 3 && serv && (
        <div>
          <div className="days">
            {dias.map((d) => {
              const dt = new Date(d + 'T12:00')
              return (
                <button key={d} className={'day' + (d === fecha ? ' on' : '')} onClick={() => { setFecha(d); setTurno(null) }}>
                  <small>{dt.toLocaleDateString('es-PE', { weekday: 'short' })}</small>
                  <b>{dt.getDate()}</b>
                  <small>{dt.toLocaleDateString('es-PE', { month: 'short' })}</small>
                </button>
              )
            })}
          </div>
          {turnos.length === 0 ? <p className="muted center">No hay horarios libres este día. Prueba otra fecha.</p> : (
            <div className="slots">
              {turnos.map((t) => (
                <button key={t.hora} className={'slot' + (turno?.hora === t.hora ? ' on' : '')} onClick={() => { setTurno(t); setPaso(4) }}>{hora12(t.hora)}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {paso === 4 && serv && turno && (
        <form className="form" onSubmit={confirmar}>
          <div className="resumen">
            <div><small>Servicio</small><b>{serv.nombre}</b></div>
            <div><small>Estilista</small><b>{estilistas.find((x) => x.id === turno.estilistaId)?.nombre}</b></div>
            <div><small>Cuándo</small><b>{fechaLarga(fecha)}, {hora12(turno.hora)}</b></div>
            <div><small>Precio</small><b>{money(serv.precio)}</b></div>
          </div>
          <label>Nombre y apellido<input required value={datos.cliente} onChange={(e) => setDatos({ ...datos, cliente: e.target.value })} placeholder="Ej. Lucía Torres" /></label>
          <label>Celular<input required inputMode="tel" value={datos.telefono} onChange={(e) => setDatos({ ...datos, telefono: e.target.value })} placeholder="9XX XXX XXX" /></label>
          <label>Comentario (opcional)<textarea rows="2" value={datos.notas} onChange={(e) => setDatos({ ...datos, notas: e.target.value })} placeholder="Ej. traigo foto de referencia" /></label>
          {error && <p className="err">{error}</p>}
          <button className="btn btn-gold block" disabled={enviando}>{enviando ? 'Reservando…' : 'Confirmar reserva'}</button>
        </form>
      )}
    </div>
  )
}
