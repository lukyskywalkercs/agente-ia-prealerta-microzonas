import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import fetch from 'node-fetch'

const ZONAS = ['77', '75']
const API_KEY = process.env.AEMET_API_KEY
const ENDPOINT_TEMPLATE = process.env.AEMET_CAP_ENDPOINT_TEMPLATE

if (!API_KEY || !ENDPOINT_TEMPLATE) {
  console.error('❌ AEMET_API_KEY o AEMET_CAP_ENDPOINT_TEMPLATE no definidos.')
  process.exit(1)
}

console.log('🚦 Verificación de estado API AEMET')

for (const zona of ZONAS) {
  const url = `${ENDPOINT_TEMPLATE.replace('{area}', zona)}?api_key=${API_KEY}`
  console.log(`🔍 Verificando zona ${zona}...`)

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(json => {
      const datos = (json as any).datos
      console.log(`✅ Zona ${zona} responde correctamente: ${datos}`)
    })
    .catch(err => {
      console.error(`💥 Error al consultar zona ${zona}:`, err.message)
    })
}
