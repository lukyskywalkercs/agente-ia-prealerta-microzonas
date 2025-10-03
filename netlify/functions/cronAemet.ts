// netlify/functions/cronAemet.ts
import type { Handler } from '@netlify/functions'
import axios from 'axios'

const AREA = '77'
const API_KEY = process.env.AEMET_API_KEY || ''
const AEMET_URL = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/${AREA}?api_key=${API_KEY}`

export const handler: Handler = async () => {
  try {
    const res = await axios.get(AEMET_URL, {
      timeout: 15000,
      validateStatus: () => true,
      headers: { Accept: 'application/json' }
    })

    const contentType = res.headers['content-type'] || ''
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 502,
        body: `❌ Respuesta no JSON (${contentType}) · Inicio: ${res.data?.slice?.(0, 120) || '—'}`
      }
    }

    const payload = res.data
    if (typeof payload !== 'object' || payload === null) {
      return {
        statusCode: 502,
        body: `❌ Respuesta inválida de AEMET (no es objeto)`
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ estado: payload.estado, datos: payload.datos || null })
    }
  } catch (err: any) {
    if (err.code === 'ECONNRESET') {
      return { statusCode: 504, body: '❌ ECONNRESET · AEMET cerró la conexión' }
    }
    if (err.code === 'ETIMEDOUT') {
      return { statusCode: 504, body: '❌ ETIMEDOUT · Timeout al conectar con AEMET' }
    }
    return { statusCode: 500, body: `❌ ERROR FATAL: ${err?.message || String(err)}` }
  }
}
