// agents/brain.ts
// Agente principal: consolida avisos reales de AEMET en memoria viva y genera agent_ui.json
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

type SubzonaState = {
  estado: Nivel
  lastUpdate: string
  avisos?: AvisoAEMET[]
}

type MemoryState = Record<string, SubzonaState>

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Rutas de archivos (relativas al repositorio)
const avisosPath   = path.join(__dirname, '..', 'public', 'data', 'aemet_avisos.json')
const uiPath       = path.join(__dirname, '..', 'public', 'data', 'agent_ui.json')
const memoryPath   = path.join(__dirname, 'memory', 'state.json')

const rank: Record<Nivel, number> = { 'CRÍTICA': 0, 'MEDIA': 1, 'NORMALIDAD': 2 }

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

async function run() {
  console.log('[AGENTE] 🧠 Iniciando agente principal (brain.ts)…')

  // 1) Cargar avisos reales y memoria previa
  const avisos = await readJsonSafe<AvisoAEMET[]>(avisosPath, [])
  const memory = await readJsonSafe<MemoryState>(memoryPath, {})

  const nowIso = new Date().toISOString()

  // 2) Integrar avisos en memoria (subzona si existe, si no zona)
  for (const aviso of avisos) {
    const key = aviso.subzona || aviso.zona || 'desconocida'
    const current = memory[key]
    const newNivel = aviso.nivel

    if (!current || rank[newNivel] < rank[current.estado]) {
      memory[key] = { estado: newNivel, lastUpdate: nowIso, avisos: [aviso] }
    } else if (current && rank[newNivel] === rank[current.estado]) {
      const list = current.avisos ?? []
      const idx = list.findIndex(a => a.id === aviso.id)
      if (idx >= 0) list[idx] = aviso
      else list.push(aviso)
      memory[key].avisos = list
      memory[key].lastUpdate = nowIso
    }
  }

  // 3) Depurar memoria: eliminar avisos antiguos que ya no estén activos en aemet_avisos.json
  const activeIds = new Set(avisos.map(a => a.id))
  for (const k of Object.keys(memory)) {
    if (memory[k].avisos) {
      memory[k].avisos = memory[k].avisos!.filter(a => activeIds.has(a.id))
      if (memory[k].avisos!.length === 0) {
        memory[k].estado = 'NORMALIDAD'
        memory[k].lastUpdate = nowIso
      }
    }
  }

  // 4) Guardar memoria viva
  await writeJson(memoryPath, memory)

  // 5) Generar UI compacta por clave (subzona/zona) con la peor severidad vigente
  const ui: { lastRunAt: string; areas: Record<string, SubzonaState> } = {
    lastRunAt: nowIso,
    areas: {}
  }

  // Seleccionar la peor severidad por clave
  for (const [key, state] of Object.entries(memory)) {
    if (!ui.areas[key]) ui.areas[key] = { estado: 'NORMALIDAD', lastUpdate: nowIso, avisos: [] }
    const current = ui.areas[key]
    if (rank[state.estado] < rank[current.estado]) {
      ui.areas[key] = {
        estado: state.estado,
        lastUpdate: nowIso,
        avisos: (state.avisos ?? []).slice().sort((a, b) => rank[a.nivel] - rank[b.nivel])
      }
    }
  }

  await writeJson(uiPath, ui)
  console.log('[AGENTE] ✅ Memoria actualizada y agent_ui.json generado.')
}

run().catch(err => {
  console.error('[AGENTE] ❌ Error en brain.ts:', err)
  process.exit(1)
})
