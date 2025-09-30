// scripts/check-subzona-6908.ts
import * as fs from 'node:fs/promises'
import * as path from 'path'

const filePath = path.join('public', 'data', 'aemet_avisos.json')

async function run() {
  const raw = await fs.readFile(filePath, 'utf8')
  const avisos = JSON.parse(raw)
  const sub = avisos.filter((a: any) => a.subzona === '6908')
  console.log(`📍 ${sub.length} aviso(s) para subzona 6908:`)
  console.log(JSON.stringify(sub, null, 2))
}

run()
