// agents/prealert.ts
// Agente de prealertas: lee aemet_avisos.json y genera prealert_ui.json con avisos de severidad MEDIA y CRÍTICA
// Reglas: NUNCA simula datos. Solo procesa lo que haya en public/data/aemet_avisos.json

import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

type Nivel = 'NORMALIDAD' | 'MEDIA' | 'CRÍTICA'

type AvisoAEMET = {
  id: string
  subzona?: string
  zona?: string
  nivel: Nivel
  evento?: string
  desde?: string
  hasta?: string
  desc?: string
  probabilidad?: string
  valor?: string
  comentario?: string
  parametros?: Array<{ valueName: string; value: string }>
  origenXml?: string
  area?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const avisosPath    = path.join(__dirname, '..', 'public', 'data', 'aemet_avisos.json')
const prealertPath  = path.join(__dirname, '..', 'public', 'data', 'prealert_ui.json')

async function readJsonSafe<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson(file: string, data: any) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data ?? {}, null, 2), 'utf8')
}

function isRelevant(aviso: AvisoAEMET): boolean {
  // Consideramos prealerta para MEDIA y CRÍTICA
  return aviso.nivel === 'MEDIA' || aviso.nivel === 'CRÍTICA'
}

async function run() {
  console.log('[PREALERT] 🔎 Generando prealertas a partir de aemet_avisos.json…')

  const avisos = await readJsonSafe<AvisoAEMET[]>(avisosPath, [])
  const relevantes = avisos.filter(isRelevant)

  const now = new Date().toISOString()
  const tasks = relevantes.map(a => ({
    id: `prealert-${a.id}`,
    subzona: a.subzona ?? null,
    zona: a.zona ?? null,
    nivel: a.nivel,
    evento: a.evento ?? '',
    ventana: { desde: a.desde ?? null, hasta: a.hasta ?? null },
    descripcion: a.desc ?? '',
    probabilidad: a.probabilidad ?? null,
    comentario: a.comentario ?? null,
    origenXml: a.origenXml ?? null,
    createdAt: now
  }))

  const out = {
    lastRunAt: now,
    total: tasks.length,
    items: tasks
  }

  await writeJson(prealertPath, out)
  console.log(`[PREALERT] ✅ prealert_ui.json generado (${tasks.length} tarea(s)).`)
}

run().catch(err => {
  console.error('[PREALERT] ❌ Error en prealert.ts:', err)
  process.exit(1)
})
