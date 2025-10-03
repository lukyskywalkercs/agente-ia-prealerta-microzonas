import { useEffect, useState } from 'react'
import { getAemetStatus } from '../lib/getAemetStatus'

export function AvisosAEMET() {
  const [estado, setEstado] = useState<'CARGANDO' | 'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('CARGANDO')
  const [avisos, setAvisos] = useState<any[]>([])

  useEffect(() => {
    getAemetStatus().then(async estado => {
      setEstado(estado)
      if (estado === 'CON_AVISOS') {
        const res = await fetch('/data/agent_ui.json')
        const data = await res.json()
        setAvisos(data.avisos)
      }
    })
  }, [])

  if (estado === 'CARGANDO') return <p className="text-sm">🔄 Cargando avisos...</p>
  if (estado === 'ERROR_API') return <p className="text-red-600 font-semibold">⚠️ Error al consultar datos oficiales de AEMET: no se ha podido verificar el estado de los datos.</p>
  if (estado === 'SIN_AVISOS') return <p className="text-green-700">✅ No hay avisos meteorológicos activos actualmente.</p>

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">⚠️ Avisos meteorológicos activos</h2>
      {avisos.map((a, i) => (
        <div key={i} className="border p-2 rounded shadow-sm bg-yellow-100">
          <strong>{a.areaDesc}</strong>: {a.fenomeno} · Nivel {a.nivel}
        </div>
      ))}
    </div>
  )
}