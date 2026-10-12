import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import QRCode from 'qrcode'
import { useCollection, add } from '../lib/db'
import { seed } from '../lib/seed'
import { money, hoy, addDays, fechaCorta, hora12 } from '../lib/utils'
import { Kpi, Badge, PageHead } from './ui.jsx'

const COLORS = ['#b8893f', '#2b2420', '#8a6d5a', '#d7b98a', '#5c4a3d', '#a39484']

export default function Dashboard({ go }) {
  const [ventas] = useCollection('ventas')
  const [citas] = useCollection('citas')
  const [productos, cargandoProd] = useCollection('productos')
  const [servicios, cargandoServ] = useCollection('servicios')
  const [estilistas] = useCollection('estilistas')
  const [qr, setQr] = useState('')
  const [cargando, setCargando] = useState(false)

  // Carga servicios, equipo y productos de ejemplo (sin citas ni ventas falsas)
  const cargarIniciales = async () => {
    setCargando(true)
    const d = seed()
    const sinId = ({ id, ...r }) => r
    if (!servicios.length) for (const x of d.servicios) await add('servicios', sinId(x))
    if (!estilistas.length) for (const x of d.estilistas) await add('estilistas', sinId(x))
    if (!productos.length) for (const x of d.productos) await add('productos', sinId(x))
    setCargando(false)
  }
  const vacio = !cargandoServ && !cargandoProd && (servicios.length === 0 || estilistas.length === 0)
  const h = hoy(), mes = h.slice(0, 7)
  const urlWeb = window.location.href.split('?')[0]

  useEffect(() => { QRCode.toDataURL(urlWeb + '#reserva', { width: 220, margin: 1 }).then(setQr) }, [urlWeb])

  const d = useMemo(() => {
    const vHoy = ventas.filter((v) => v.fecha === h)
    const vMes = ventas.filter((v) => v.fecha?.startsWith(mes))
    const sum = (a) => a.reduce((s, v) => s + Number(v.total || 0), 0)
    const cHoy = citas.filter((c) => c.fecha === h && c.estado !== 'cancelada').sort((a, b) => a.hora.localeCompare(b.hora))
    const dias = Array.from({ length: 14 }, (_, i) => addDays(h, i - 13)).map((f) => ({ dia: fechaCorta(f), total: sum(ventas.filter((v) => v.fecha === f)) }))
    const porServ = {}, porEst = {}
    vMes.forEach((v) => {
      v.items?.filter((i) => i.tipo === 'servicio').forEach((i) => { porServ[i.nombre] = (porServ[i.nombre] || 0) + i.cantidad })
      if (v.estilistaNombre) porEst[v.estilistaNombre] = (porEst[v.estilistaNombre] || 0) + Number(v.total)
    })
    const top = Object.entries(porServ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }))
    const est = Object.entries(porEst).sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name: name.split(' ')[0], total }))
    const pend = citas.filter((c) => c.estado === 'pendiente' && c.fecha >= h).length
    const web = citas.filter((c) => c.origen === 'web' && c.fecha?.startsWith(mes)).length
    return { ingHoy: sum(vHoy), ingMes: sum(vMes), ticket: vMes.length ? sum(vMes) / vMes.length : 0, nMes: vMes.length, cHoy, dias, top, est, pend, web }
  }, [ventas, citas, h, mes])

  const stockBajo = productos.filter((p) => p.activo !== false && Number(p.stock) <= 3)

  return (
    <>
      <PageHead title="Resumen" />
      {vacio && (
        <div className="card setup">
          <div>
            <h3>Configuración inicial</h3>
            <p className="muted">Tu base de datos está vacía. Carga una lista base de servicios, equipo y productos y luego edítalos con los datos reales (precios, nombres, fotos).</p>
          </div>
          <button className="btn btn-gold" disabled={cargando} onClick={cargarIniciales}>{cargando ? 'Cargando…' : 'Cargar datos iniciales'}</button>
        </div>
      )}
      <div className="kpis">
        <Kpi label="Ingresos hoy" value={money(d.ingHoy)} sub={`${d.cHoy.length} citas agendadas`} />
        <Kpi label="Ingresos del mes" value={money(d.ingMes)} sub={`${d.nMes} atenciones`} />
        <Kpi label="Ticket promedio" value={money(d.ticket)} sub="este mes" />
        <Kpi label="Por confirmar" value={d.pend} sub={`${d.web} reservas web este mes`} />
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Ingresos · últimos 14 días</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={d.dias}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="dia" fontSize={11} tickLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => money(v)} />
              <Bar dataKey="total" fill="#b8893f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Servicios más pedidos (mes)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={d.top} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {d.top.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="legend">{d.top.map((t, i) => <li key={t.name}><i style={{ background: COLORS[i % COLORS.length] }} />{t.name} <b>{t.value}</b></li>)}</ul>
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="row-between"><h3>Citas de hoy</h3><button className="link" onClick={() => go('agenda')}>Ver agenda →</button></div>
          {d.cHoy.length === 0 ? <p className="muted">No hay citas hoy.</p> : (
            <ul className="mini-list">
              {d.cHoy.map((c) => <li key={c.id}><b>{hora12(c.hora)}</b><span>{c.cliente}<small>{c.servicioNombre} · {c.estilistaNombre}</small></span><Badge estado={c.estado} /></li>)}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>Ingresos por estilista (mes)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.est} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={70} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => money(v)} />
              <Bar dataKey="total" fill="#2b2420" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {stockBajo.length > 0 && <p className="warn">⚠ Stock bajo: {stockBajo.map((p) => `${p.nombre} (${p.stock})`).join(', ')}</p>}
        </div>
        <div className="card qr-card">
          <h3>QR de reservas</h3>
          <p className="muted">Imprímelo y ponlo en el mostrador o espejo. Lleva directo a reservar.</p>
          {qr && <img src={qr} alt="QR reservas" />}
          {qr && <a className="btn btn-dark sm" href={qr} download="qr-reservas.png">Descargar QR</a>}
        </div>
      </div>
    </>
  )
}
