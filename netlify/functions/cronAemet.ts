import { Handler } from '@netlify/functions'
import axios from 'axios'
import decompress from 'decompress'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { parseStringPromise } from 'xml2js'

// Utilidades
const yyyymmdd = (d: Date) => d.toISOString().split('T')[0]
const AEMET_API_KEY = process.env.AEMET_API_KEY || ''
const AREA = '77'
const SUBZONA = '771204'

export const handler: Handler = async () => {
  const now = new Date()
  const hoy = yyyymmdd(now)
  const ayer = yyyymmdd(new Date(now.getTime() - 86400000)) // 24h antes
  const intentos = []

  if (!AEMET_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: 'Falta AEMET_API_KEY' })
    }
  }

  try {
    // Intenta primero con la fecha de hoy, si no, prueba con la de ayer
    const fechas = [hoy, ayer]
    let datosUrl: string | null = null
    let metaResponse: any = null

    for (const fecha of fechas) {
      const metaUrl = `https://opendata.aemet.es/opendata/api/avisos_cap/archivo/fechaini/${fecha}/fechafin/${fecha}/area/${AREA}?api_key=${AEMET_API_KEY}`

      try {
        const r = await axios.get(metaUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AemetAgent/1.0)',
            'Accept': 'application/json'
          },
          timeout: 10000,
          validateStatus: () => true
        })

        metaResponse = {
          status: r.status,
          contentType: r.headers['content-type'] || '',
          sample: JSON.stringify(r.data).slice(0, 200),
          url: metaUrl
        }

        intentos.push({ paso: `metadatos ${fecha}`, ...metaResponse })

        if (r.status === 200 && r.data?.datos) {
          datosUrl = r.data.datos
          break
        }
      } catch (err: any) {
        intentos.push({ paso: `metadatos ${fecha}`, error: err.message || 'fallo desconocido' })
      }
    }

    if (!datosUrl) {
      throw new Error('No se pudo obtener la URL de descarga desde AEMET')
    }

    // Descarga del .tar.gz
    const descarga = await axios.get(datosUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AemetAgent/1.0)',
        'Accept': '*/*'
      },
      validateStatus: () => true
    })

    intentos.push({
      paso: 'descarga .tar.gz',
      status: descarga.status,
      contentType: descarga.headers['content-type'] || '',
      bytes: descarga.data?.length || 0,
      url: datosUrl
    })

    if (descarga.status !== 200 || !Buffer.isBuffer(descarga.data)) {
      throw new Error('La descarga del archivo .tar.gz ha fallado o no es binaria')
    }

    // Descomprime el tar
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aemet-'))
    const tarPath = path.join(tmpDir, 'avisos.tar.gz')
    fs.writeFileSync(tarPath, descarga.data)

    const files = await decompress(tarPath, tmpDir)
    const xmlEntry = files.find(f => f.path.endsWith('.xml'))
    if (!xmlEntry) throw new Error('No se encontró ningún archivo XML en el tar.gz')

    const xmlPath = path.join(tmpDir, xmlEntry.path)
    const xmlContent = fs.readFileSync(xmlPath, 'utf8')

    // Si devuelve HTML en lugar de XML
    if (xmlContent.trim().startsWith('<!DOCTYPE html') || xmlContent.includes('<html')) {
      throw new Error('AEMET devolvió HTML en lugar de XML')
    }

    // Parseo XML CAP
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

    // Microzonificador 771204
    const ahora = new Date().toISOString()
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

    // OK
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: true,
        message: err?.message || 'Error desconocido',
        diag: intentos
      })
    }
  }
}
