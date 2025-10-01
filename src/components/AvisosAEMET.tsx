// src/components/AvisosAEMET.tsx
import React, { useEffect, useState } from 'react'

interface Aviso {
  subzona: string
  areaDesc: string
  fenomeno: string
  f_inicio: string
  f_fin: string
}

const AvisosAEMET: React.FC = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/data/agent_ui.json', { cache: 'no-store' })
        const tipo = res.headers.get('content-type') || ''
        if (!res.ok || !tipo.includes('application/json')) {
          throw new Error(`Respuesta inválida: ${res.status} (${tipo})`)
        }
        const data = await res.json()
        setAvisos(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error('❌ Error cargando avisos AEMET:', err)
        setError('⚠️ Error al consultar datos oficiales de AEMET: No se pudo verificar el estado de los datos de AEMET.')
      }
    }
    cargar()
  }, [])

  const agrupar = avisos.reduce((acc, aviso) => {
    if (!acc[aviso.subzona]) acc[aviso.subzona] = []
    acc[aviso.subzona].push(aviso)
    return acc
  }, {} as Record<string, Aviso[]>)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Avisos AEMET por Subzona</h1>
      {error && <p className="text-red-700 text-sm mb-4">{error}</p>}
      {avisos.length === 0 && !error && (
        <p className="text-green-700 text-sm">✅ No hay avisos activos ahora mismo.</p>
      )}
      {Object.entries(agrupar).map(([subzona, lista]) => (
        <div key={subzona} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Subzona {subzona}</h2>
          <ul className="space-y-2">
            {lista.map((aviso, i) => (
              <li key={i} className="bg-white p-4 rounded border shadow-sm">
                <p className="font-medium">{aviso.fenomeno}</p>
                <p className="text-sm text-gray-600">
                  {aviso.areaDesc} · Desde {aviso.f_inicio} hasta {aviso.f_fin}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default AvisosAEMET
