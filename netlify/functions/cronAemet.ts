import { Handler } from '@netlify/functions'
import axios from 'axios'
import decompress from 'decompress'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { parseStringPromise } from 'xml2js'

// Configuración
const API_KEY = process.env.AEMET_API_KEY || ''
const AREA = '77'
const SUBZONA = '771204'

export const handler: Handler = async () => {
  const ahora = new Date().toISOString()
  const diag: any[] = []

  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: 'Falta AEMET_API_KEY' })
    }
  }

  try {
    const metaUrl = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/${AREA}?api_key=${API_KEY}`
    const metaRes = await axios.get(metaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      },
      timeout: 20000
    })

    diag.push({
      paso: 'obtener metadatos',
      status: metaRes.status,
      contentType: metaRes.headers['content-type'],
      sample: JSON.stringify(metaRes.data).slice(0, 200)
    })

    const datosUrl = metaRes.data?.datos
    if (!datosUrl) throw new Error('No se encontró URL de descarga en los metadatos')

    const descargaRes = await axios.get(datosUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aemet-'))
    const tarPath = path.join(tmpDir, 'avisos.tar.gz')
    fs.writeFileSync(tarPath, descargaRes.data)

    const files = await decompress(tarPath, tmpDir)
    const xmlEntry = files.find(f => f.path.endsWith('.xml'))
    if (!xmlEntry) throw new Error('No se encontró archivo XML dentro del .tar.gz')

    const xmlPath = path.join(tmpDir, xmlEntry.path)
    const xmlContent = fs.readFileSync(xmlPath, 'utf8')
    if (xmlContent.includes('<html')) throw new Error('Respuesta HTML no válida en lugar de XML')

    const xml = await parseStringPromise(xmlContent, { explicitArray: false })
    const alerts = Array.isArray(xml.alerts?.alert)
      ? xml.alerts.alert
      : xml.alerts?.alert
        ? [xml.alerts.alert]
        : []

    const avisos = alerts.flatMap((alert: any) => {
      const info = alert?.info
      if (!info) return []
      const areas = Array.isArray(info.area) ? info.area : [info.area]
      return areas.map((area: any) => {
        const geocodes = Array.isArray(area.geocode) ? area.geocode : [area.geocode]
        const subzona = geocodes.find((g: any) => g?.valueName === 'ID_ZONA')?.value || '000000'
        return {
          subzona,
          areaDesc: area.areaDesc || '',
          fenomeno: info.event || '',
          f_inicio: info.onset || '',
          f_fin: info.expires || ''
        }
      })
    })

    const avisosAlmassora = avisos.filter(a => a.subzona === SUBZONA)
    const alerta_almassora = avisosAlmassora.length === 0
      ? {
          activo: false,
          subzona: SUBZONA,
          vigencia: { inicio: '', fin: '' },
          fenomenos: [],
          centros_afectados: [],
          caminos_afectados: [],
          zonas_riesgo_intersectadas: [],
          fuente: 'AEMET / Agente IA',
          generated_at: ahora,
          notas: ['No hay avisos meteorológicos activos para esta subzona.']
        }
      : {
          activo: true,
          subzona: SUBZONA,
          vigencia: {
            inicio: avisosAlmassora.map(a => a.f_inicio).sort()[0],
            fin: avisosAlmassora.map(a => a.f_fin).sort().slice(-1)[0]
          },
          fenomenos: [...new Set(avisosAlmassora.map(a => a.fenomeno))],
          centros_afectados: [],
          caminos_afectados: [],
          zonas_riesgo_intersectadas: [],
          fuente: 'AEMET / Agente IA',
          generated_at: ahora,
          notas: ['Se han detectado avisos meteorológicos activos para esta subzona.']
        }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agent_ui: avisos,
        alerta_almassora,
        generated_at: ahora
      })
    }

  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: true,
        message: err.message || 'Error desconocido',
        diag
      })
    }
  }
}
