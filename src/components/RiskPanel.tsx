// src/components/RiskPanel.tsx
import React, { useEffect, useState } from 'react'

interface Evaluacion {
  subzona: string
  areaDesc: string
  nivel_riesgo: 'BAJO' | 'MODERADO' | 'ALTO'
  score_ia: number
  fenomeno_principal: string
  window?: { onsetSoonest?: string; expiresLatest?: string; imminenceHours?: number; durationHours?: number }
  trend?: 'UP' | 'DOWN' | 'SAME' | 'NEW'
  reasons?: string[]
}

const RiskPanel: React.FC = () => {
  const [datos, setDatos] = useState<Evaluacion[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/data/risk_eval.json', { cache: 'no-store' })
        const tipo = res.headers.get('content-type') || ''
        if (!res.ok || !tipo.includes('application/json')) {
          throw new Error(`Respuesta inválida: ${res.status} (${tipo})`)
        }
        const data = await res.json()
        setDatos(Array.isArray(data) ? data : [])
      } catch (err: any) {
        console.error('❌ Error cargando risk_eval.json:', err)
        setError('⚠️ Error al cargar evaluación de riesgo IA.')
      }
    }
    cargar()
  }, [])

  const niveles = ['ALTO', 'MODERADO', 'BAJO'] as const

  const getColor = (nivel: string) => {
    switch (nivel) {
      case 'ALTO': return 'border-red-600 bg-red-100'
      case 'MODERADO': return 'border-yellow-500 bg-yellow-100'
      default: return 'border-green-600 bg-green-100'
    }
  }

  const toScale20 = (score: number) => Math.round(((score - 1) / 3) * 20)

  const agrupar = niveles.map(nivel => ({
    nivel,
    zonas: datos.filter(d => d.nivel_riesgo === nivel).sort((a, b) => b.score_ia - a.score_ia)
  }))

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Agente IA Evaluador de Riesgo</h2>
      <p className="text-sm text-gray-600 mb-6">
        Esta herramienta analiza los avisos meteorológicos reales de AEMET y calcula un riesgo por subzona usando criterios como inminencia, duración y severidad.
      </p>

      {error && (
        <p className="text-red-700 text-sm mb-4">{error}</p>
      )}

      {datos.length === 0 && !error && (
        <p className="text-sm text-green-700">✅ No se han detectado riesgos relevantes.</p>
      )}

      {agrupar.map(grupo =>
        grupo.zonas.length > 0 && (
          <div key={grupo.nivel} className="mb-6">
            <h3 className="text-md font-semibold mb-2">Riesgo {grupo.nivel}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {grupo.zonas.map(z => (
                <div key={z.subzona} className={`p-4 rounded border-l-4 shadow-sm ${getColor(grupo.nivel)}`}>
                  <p className="font-bold text-gray-800">Subzona {z.subzona}</p>
                  <p className="text-sm text-gray-700">{z.areaDesc}</p>
                  <p className="text-sm font-medium mt-1">Fenómeno: {z.fenomeno_principal}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Score IA: {z.score_ia.toFixed(2)} · {toScale20(z.score_ia)}/20
                    {z.trend === 'UP' && <span className="text-red-700 ml-2">↑</span>}
                    {z.trend === 'DOWN' && <span className="text-green-700 ml-2">↓</span>}
                    {z.trend === 'NEW' && <span className="text-yellow-700 ml-2">nuevo</span>}
                  </p>
                  {z.reasons && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {z.reasons.map((r, i) => (
                        <span key={i} className="text-xs bg-black/5 text-gray-800 px-2 py-0.5 rounded-full">{r}</span>
                      ))}
                    </div>
                  )}
                  {z.window && (
                    <p className="text-[11px] text-gray-500 mt-2">
                      {z.window.onsetSoonest && <>Inicio: {new Date(z.window.onsetSoonest).toLocaleString()} · </>}
                      {z.window.expiresLatest && <>Fin: {new Date(z.window.expiresLatest).toLocaleString()}</>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default RiskPanel
