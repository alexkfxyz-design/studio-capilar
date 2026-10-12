import { useEffect, useState } from 'react'
import PublicSite from './public/PublicSite.jsx'
import AdminApp from './admin/AdminApp.jsx'

// El panel se abre con ?view=admin o con #admin
const esAdmin = () => new URLSearchParams(window.location.search).get('view') === 'admin' || window.location.hash === '#admin'

export default function App() {
  const [admin, setAdmin] = useState(esAdmin)
  useEffect(() => {
    const h = () => { setAdmin(esAdmin()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  return admin ? <AdminApp /> : <PublicSite />
}
