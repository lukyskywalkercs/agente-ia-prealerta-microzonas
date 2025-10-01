import { Handler } from '@netlify/functions'
import axios from 'axios'
import decompress from 'decompress'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { parseStringPromise } from 'xml2js'

export const handler: Handler = async () => {
  const API_KEY = process.env.AEMET_API_KEY || ''
  const hoy = new Date().toISOString().split('T')[0]
  const area = '77'
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aemet-'))

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: '❌ FALTA AEMET_API_KEY' }),
    }
  }

  try {
    const metaUrl = `https://opendata.aemet.es/opendata/api/avisos_cap/archivo/fechaini/${hoy}/fechafin/${hoy}/area/${area}?api_key=${API_KEY}`

    const { data: meta } = await axios.get(metaUrl, {
      timeout: 20000,
      headers: {
        'User-Agent': 'NetlifyServerless/1.0',
        'Accept': 'application/json',
      },
    })

    if (!meta?.datos) {
      throw new Error('AEMET no ha devuelto el campo "datos". Posible API rota.')
    }

    const { data: raw } = await axios.get(meta.datos, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'NetlifyServerless/1.0',
        'Accept': '*/*',
      },
    })

    const tarPath = path.join(tmpDir, 'avisos.tar.gz')
    fs.writeFileSync(tarPath, raw)

    const files = await decompress(tarPath, tmpDir)
    const xmlFile = files.find(f => f.path.endsWith('.xml'))
    if (!xmlFile) throw new Error('No se encontró XML en el .tar.gz de AEMET')

    const xmlPath = path.join(tmpDir, xmlFile.path)
    const xmlContent = fs.readFileSync(xmlPath, 'utf8')

    // Si AEMET devuelve HTML por error
    if (xmlContent.startsWith('<!DOCTYPE html') || xmlContent.includes('<html')) {
      throw new Error('AEMET devolvió HTML en vez de XML. Posible error interno o acceso denegado.')
    }

    const parsed = await parseStringPromise(xmlContent, { explicitArray: false })
    const alerts = Array.isArray(parsed.alerts?.alert)
      ? parsed.alerts.alert
      : parsed.alerts?.alert
        ? [parsed.alerts.alert]
        : []

    const avisos = alerts.flatMap((alert) => {
      const info = alert.info
      const areas = Array.isArray(info.area) ? info.area : [info.area]
      return areas.map((area) => {
        const geocodes = Array.isArray(area.geocode) ? area.geocode : [area.geocode]
        const subzona = geocodes.find((g) => g.valueName === 'ID_ZONA')?.value || '000000'
        return {
          subzona,
          areaDesc: area.areaDesc || 'Desconocida',
          fenomeno: info.event,
          f_inicio: info.onset,
          f_fin: info.expires,
        }
      })
    })

    // Microzonificador in-line para subzona 771204
    const alerta_almassora = (() => {
      const subzona = '771204'
      const ahora = new Date().toISOString()
      const filtrados = avisos.filter((a) => a.subzona === subzona)

      if (!filtrados.length) {
        return {
          activo: false,
          subzona,
          vigencia: { inicio: '', fin: '' },
          fenomenos: [],
          centros_afectados: [],
          caminos_afectados: [],
          zonas_riesgo_intersectadas: [],
          fuente: 'AEMET / Agente IA',
          generated_at: ahora,
          notas: ['No hay avisos meteorológicos activos para esta subzona.'],
        }
      }

      const inicio = filtrados.map((a) => a.f_inicio).filter(Boolean).sort()[0] || ''
      const fin = filtrados.map((a) => a.f_fin).filter(Boolean).sort().slice(-1)[0] || ''
      const fenomenos = [...new Set(filtrados.map((a) => a.fenomeno))]

      return {
        activo: true,
        subzona,
        vigencia: { inicio, fin },
        fenomenos,
        centros_afectados: [],
        caminos_afectados: [],
        zonas_riesgo_intersectadas: [],
        fuente: 'AEMET / Agente IA',
        generated_at: ahora,
        notas: [
          'Se han detectado avisos meteorológicos activos para esta subzona.',
          'Este agente IA no sustituye a los canales oficiales.',
        ],
      }
    })()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_ui: avisos,
        alerta_almassora,
        generated_at: new Date().toISOString(),
      }),
    }
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: true,
        message: err.message || 'Fallo inesperado',
      }),
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}
