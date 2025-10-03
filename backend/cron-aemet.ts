import axios from 'axios'
import fs from 'fs'
import path from 'path'
import decompress from 'decompress'
import { parseCapXml } from './parseCapXml'
import { Aviso, Nivel } from './types'

const CWD = process.cwd()
const TMP_DIR = path.join(CWD, 'tmp')
const DATA_DIR = path.join(CWD, 'public', 'data')
const LOG_DIR = path.join(CWD, 'logs')

for (const dir of [TMP_DIR, DATA_DIR, LOG_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const LOG_FILE = path.join(LOG_DIR, 'cron.log')
const AREA = '77'
const API_KEY = process.env.AEMET_API_KEY || ''
const AEMET_URL = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/${AREA}?api_key=${API_KEY}`

function logInfo(msg: string) {
  const line = `[${new Date().toISOString()}] ✅ ${msg}\n`
  fs.appendFileSync(LOG_FILE, line)
  console.log(line.trim())
}
function logError(msg: string) {
  const line = `[${new Date().toISOString()}] ❌ ${msg}\n`
  fs.appendFileSync(LOG_FILE, line)
  console.error(line.trim())
}

function writeJSONAtomic(filePath: string, obj: any) {
  const tmp = `${filePath}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2))
  fs.renameSync(tmp, filePath)
}

function nivelMax(avisos: Aviso[]): Nivel {
  const order: Record<Nivel, number> = { '—': 0, amarillo: 1, naranja: 2, rojo: 3 }
  let max: Nivel = '—'
  for (const a of avisos) {
    if (a.nivel && order[a.nivel] > order[max]) max = a.nivel
  }
  return max
}

async function main() {
  console.log(`🚀 Inicio cron AEMET · ${new Date().toISOString()}`)
  console.log(`📡 URL AEMET: ${AEMET_URL}`)

  try {
    const res = await axios.get(AEMET_URL, {
      timeout: 15000,
      headers: { Accept: 'application/json' },
      validateStatus: () => true
    })

    const contentType = res.headers?.['content-type'] ?? ''
    if (!contentType.includes('application/json')) {
      logError(`Content-Type inválido (${contentType || 'desconocido'}) · AEMET devolvió contenido no JSON`)
      return
    }

    const payload: any = res.data
    if (typeof payload !== 'object' || payload == null) {
      logError('Respuesta JSON inválida (no objeto)')
      return
    }

    if (res.status >= 500) {
      logError(`HTTP ${res.status} · Error interno de AEMET`)
      return
    }

    if (payload.estado === 404) {
      const agent = { generated_at: new Date().toISOString(), avisos: [] as Aviso[] }
      writeJSONAtomic(path.join(DATA_DIR, 'agent_ui.json'), agent)
      const alerta = { subzona: '771204', activo: false, nivel: '—' as Nivel }
      writeJSONAtomic(path.join(DATA_DIR, 'alerta_almassora.json'), alerta)
      logInfo(`Zona ${AREA} sin avisos (estado 404 de AEMET) · agent_ui.json con 0 avisos`)
      return
    }

    if (payload.estado !== 200 || !payload.datos) {
      logError(`Respuesta inesperada de AEMET · estado=${payload.estado} · datos=${payload.datos ?? 'null'}`)
      return
    }

    const tarUrl: string = payload.datos
    const tarResp = await axios.get<ArrayBuffer>(tarUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
      headers: { Accept: '*/*' },
      validateStatus: () => true
    })

    if (tarResp.status >= 400 || !tarResp.data) {
      logError(`Fallo al descargar TAR · HTTP ${tarResp.status}`)
      return
    }

    const buf = Buffer.from(tarResp.data)
    const files = await decompress(buf)
    const xml = files.find(f => f.path.toLowerCase().endsWith('.xml'))
    if (!xml) {
      logError('No se encontró XML dentro del .tar.gz')
      return
    }

    const xmlText = xml.data.toString('utf8')
    const avisos: Aviso[] = await parseCapXml(xmlText)

    const agent = { generated_at: new Date().toISOString(), avisos }
    writeJSONAtomic(path.join(DATA_DIR, 'agent_ui.json'), agent)
    logInfo(`Generado agent_ui.json con ${avisos.length} avisos`)

    const avisosAlmassora = avisos.filter(a => a.subzona === '771204')
    const nivel = nivelMax(avisosAlmassora)
    const alerta = { subzona: '771204', activo: nivel !== '—', nivel }
    writeJSONAtomic(path.join(DATA_DIR, 'alerta_almassora.json'), alerta)
    logInfo(`Generado alerta_almassora.json (activo=${alerta.activo}, nivel=${alerta.nivel})`)
  } catch (err: any) {
    if (err?.code === 'ECONNRESET') {
      logError('ECONNRESET · El servidor cerró la conexión')
    } else if (err?.code === 'ETIMEDOUT') {
      logError('ETIMEDOUT · Timeout al conectar con AEMET')
    } else {
      logError(`ERROR FATAL: ${err?.message || String(err)}`)
    }
  } finally {
    try { fs.rmSync(TMP_DIR, { recursive: true, force: true }) } catch {}
  }
}

main()
