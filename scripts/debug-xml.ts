// scripts/debug-xml.ts
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { XMLParser } from 'fast-xml-parser'

async function run() {
  const tempDir = process.env.TEMP || '/tmp'
  const files = await fs.readdir(tempDir)
  const xmlFile = files.find(f => f.startsWith('aemet_') && f.endsWith('.xml'))

  if (!xmlFile) {
    console.error('❌ No se encontró ningún XML extraído en el directorio temporal.')
    return
  }

  const fullPath = path.join(tempDir, xmlFile)
  console.log('📄 Archivo XML detectado:', fullPath)

  try {
    const xmlContent = await fs.readFile(fullPath, 'utf8')
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
    const json = parser.parse(xmlContent)

    const infos = json?.alert?.info
    const infoList = Array.isArray(infos) ? infos : [infos].filter(Boolean)

    let count = 0

    for (const info of infoList) {
      const areas = info?.area
      const areasArray = Array.isArray(areas) ? areas : [areas].filter(Boolean)

      for (const area of areasArray) {
        const areaDesc = area.areaDesc || ''
        const geocodes = Array.isArray(area.geocode) ? area.geocode : [area.geocode].filter(Boolean)

        const match7548 = geocodes.some(g => g?.value?.startsWith('7548'))

        if (areaDesc.includes('7548') || match7548) {
          count++
          console.log('---')
          console.log(`📍 areaDesc: ${areaDesc}`)
          for (const g of geocodes) {
            console.log(`  - ${g['@_valueName']}: ${g.value}`)
          }
        }
      }
    }

    if (count === 0) {
      console.log('🔍 No se encontró ninguna subzona ni zona que empiece por 7548.')
    } else {
      console.log(`✅ Total: ${count} zonas/subzonas relacionadas con "7548"`)
    }

  } catch (err) {
    console.error('❌ Error procesando XML:', err)
  }
}

run()
