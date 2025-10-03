// src/components/AvisosAEMET.tsx
import React, { useEffect, useState } from 'react'
import { fetchJsonStrict } from '../lib/fetchJsonStrict'

type Aviso = {
  subzona: string
  areaDesc: string
  fenomeno?: string
  nivel: 'amarillo' | 'naranja' | 'rojo'
  nivel_num?: string
  f_inicio?: string
  f_fin?: string
}
type AgentUI = { generated_at: string; avisos: Aviso[] }

const AvisosAEMET: React.FC = () => {
  const [data, setData] = useState<AgentUI | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const json = await fetchJsonStrict<AgentUI>('/data/agent_ui.json')
        if (!alive) return
        if (!json || !Array.isArray(json.avisos)) {
          throw new Error('Estructura JSON inválida: falta "avisos" (array)')
        }
        setData(json)
      } catch (e: any) {
        setError(`⚠️ Error al consultar datos oficiales de AEMET: ${e?.message || e}`)
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  if (loading) return <p>🔄 Cargando avisos…</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return null

  if (data.avisos.length === 0) {
    return <p className="text-green-700">✅ No hay avisos meteorológicos activos actualmente.</p>
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">⚠️ Avisos meteorológicos activos</h2>
      {data.avisos.map((a, i) => (
        <div key={i} className="border rounded p-3 bg-yellow-50">
          <p><strong>Zona:</strong> {a.areaDesc} ({a.subzona})</p>
          {a.fenomeno && <p><strong>Fenómeno:</strong> {a.fenomeno}</p>}
          <p><strong>Nivel:</strong> {a.nivel.toUpperCase()}</p>
          {a.f_inicio && <p><strong>Inicio:</strong> {a.f_inicio}</p>}
          {a.f_fin && <p><strong>Fin:</strong> {a.f_fin}</p>}
        </div>
      ))}
    </div>
  )
}

export default AvisosAEMET
