import { useEffect, useState } from 'react'
import { getAemetStatus } from '../lib/getAemetStatus'

export function AvisoAlmassora() {
  const [estado, setEstado] = useState<'CARGANDO' | 'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('CARGANDO')
  const [avisos, setAvisos] = useState<any[]>([])

  useEffect(() => {
    getAemetStatus().then(async estado => {
      setEstado(estado)
      if (estado === 'CON_AVISOS') {
        const res = await fetch('/data/agent_ui.json')
        const data = await res.json()
        const filtrados = data.avisos.filter((a: any) => a.subzona === '771204')
        setAvisos(filtrados)
      }
    })
  }, [])

  if (estado === 'CARGANDO') return <p className="text-sm">🔄 Cargando avisos para Almassora...</p>
  if (estado === 'ERROR_API') return <p className="text-red-600 font-semibold">⚠️ Error al consultar datos oficiales de AEMET para Almassora.</p>
  if (estado === 'SIN_AVISOS' || avisos.length === 0) return <p className="text-green-700">✅ No hay avisos meteorológicos activos para la subzona 771204</p>

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">⚠️ Avisos activos en Almassora</h2>
      {avisos.map((a, i) => (
        <div key={i} className="border p-2 rounded shadow-sm bg-yellow-100">
          <strong>{a.areaDesc}</strong>: {a.fenomeno} · Nivel {a.nivel}
        </div>
      ))}
    </div>
  )
}