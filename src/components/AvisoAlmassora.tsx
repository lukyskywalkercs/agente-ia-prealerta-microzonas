import React, { useEffect, useState } from 'react'

type Alerta = {
  subzona: string
  areaDesc: string
  activo: boolean
  nivel: string
  nivel_num: string
  f_inicio?: string
  f_fin?: string
  fenomeno?: string
  comentario?: string
  probabilidad?: string
}

export default function AvisoAlmassora() {
  const [alerta, setAlerta] = useState<Alerta | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchAlerta() {
      try {
        const res = await fetch('/data/alerta_almassora.json')
        const isJson = res.headers.get('content-type')?.includes('application/json')

        if (!res.ok || !isJson) {
          throw new Error('⚠️ Error al consultar datos oficiales de AEMET')
        }

        const data: Alerta = await res.json()

        if (!data || Object.keys(data).length === 0) {
          throw new Error('⚠️ Datos de alerta no disponibles o vacíos')
        }

        setAlerta(data)
      } catch (err) {
        console.error(err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerta()
  }, [])

  if (loading) {
    return <p className="text-gray-500">Cargando datos de AEMET...</p>
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-800 p-4 rounded">
        ⚠️ Error al consultar datos oficiales de AEMET.<br />
        No se pudo verificar el estado de los avisos meteorológicos para Almassora (771204).
      </div>
    )
  }

  if (!alerta?.activo) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-800 p-4 rounded">
        ✅ No hay avisos meteorológicos activos para la subzona <strong>771204 · Almassora</strong>.<br />
        Confirmado por el agente IA: sin avisos <strong>naranja</strong> ni <strong>rojo</strong> válidos para esta subzona.
      </div>
    )
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-900 p-4 rounded space-y-2">
      <h2 className="text-lg font-semibold">
        ⚠️ Aviso activo en la subzona 771204 · Almassora
      </h2>
      <p><strong>Fenómeno:</strong> {alerta.fenomeno}</p>
      <p><strong>Nivel:</strong> {alerta.nivel.toUpperCase()}</p>
      <p><strong>Periodo de validez:</strong> {alerta.f_inicio} → {alerta.f_fin}</p>
      {alerta.comentario && <p><strong>Comentario:</strong> {alerta.comentario}</p>}
      {alerta.probabilidad && <p><strong>Probabilidad:</strong> {alerta.probabilidad}</p>}
      <p className="text-sm text-gray-600">Fuente oficial: AEMET · Última actualización por agente IA</p>
    </div>
  )
}
