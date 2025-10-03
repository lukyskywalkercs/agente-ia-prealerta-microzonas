import fs from 'fs'
import path from 'path'
import axios from 'axios'
import decompress from 'decompress'
import { parseCapXml } from './parseCapXml'
import { runMicrozonificador } from '../agents/almassora/microzonificador'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// ✅ ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const AREA = '77'
const API_KEY = process.env.AEMET_API_KEY || ''
const BASE_URL = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/${AREA}?api_key=${API_KEY}`

const TMP_DIR = path.join(__dirname, '..', 'tmp')
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data')
const LOG_PATH = path.join(__dirname, '..', 'logs', 'cron.log')

function logError(msg: string) {
  const line = `[${new Date().toISOString()}] ❌ ${msg}`
  fs.appendFileSync(LOG_PATH, `${line}\n`)
  console.error(line)
}

function logOk(msg: string) {
  const line = `[${new Date().toISOString()}] ✅ ${msg}`
  fs.appendFileSync(LOG_PATH, `${line}\n`)
  console.log(line)
}

async function main() {
  console.log(`🚀 Inicio cron AEMET · ${new Date().toISOString()}`)
  console.log(`📡 URL AEMET: ${BASE_URL}`)

  try {
    const response = await axios.get(BASE_URL, { timeout: 10000 })
    const contentType = response.headers['content-type']
    const raw = typeof response.data === 'string' ? response.data : JSON.stringify(response.data)

    if (!contentType.includes('application/json') || raw.startsWith('<!DOCTYPE')) {
      logError(`Respuesta HTML inválida desde AEMET · Estado ${response.status}`)
      return
    }

    if (!response.data || !response.data.datos) {
      logError(`Respuesta sin campo 'datos' desde AEMET`)
      return
    }

    const urlDatos = response.data.datos
    const tarFileName = `avisos_${AREA}_${Date.now()}.tar.gz`
    const tarPath = path.join(TMP_DIR, tarFileName)

    const file = await axios.get(urlDatos, { responseType: 'arraybuffer' })
    fs.mkdirSync(TMP_DIR, { recursive: true })
    fs.writeFileSync(tarPath, file.data)
    logOk(`.tar.gz descargado (${tarFileName})`)

    const files = await decompress(tarPath, TMP_DIR)
    const xmlFile = files.find(f => f.path.endsWith('.xml'))

    if (!xmlFile) {
      logError(`No se encontró archivo .xml en el .tar.gz`)
      return
    }

    const avisos = await parseCapXml(xmlFile.data.toString())

    if (!Array.isArray(avisos)) {
      logError(`Parser devolvió un tipo no válido`)
      return
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    fs.writeFileSync(path.join(OUTPUT_DIR, 'agent_ui.json'), JSON.stringify({ generated_at: new Date(), avisos }, null, 2))
    logOk(`Generado public/data/agent_ui.json con ${avisos.length} avisos`)

    const almassora = avisos.filter(a => a.subzona === '771204')
    const micro = runMicrozonificador(almassora)
    fs.writeFileSync(path.join(OUTPUT_DIR, 'alerta_almassora.json'), JSON.stringify(micro, null, 2))
    logOk(`Generado public/data/alerta_almassora.json (activo=${micro.activo}, nivel=${micro.nivel})`)

  } catch (err: any) {
    if (err.code === 'ECONNRESET') {
      logError(`ECONNRESET · El servidor cerró la conexión`)
    } else if (err.code === 'ETIMEDOUT') {
      logError(`ETIMEDOUT · Timeout al conectar con AEMET`)
    } else if (err.response?.status === 500) {
      logError(`HTTP 500 · Error interno de AEMET`)
    } else {
      logError(`ERROR FATAL: ${err.message || err.toString()}`)
    }
  }
}

main()
