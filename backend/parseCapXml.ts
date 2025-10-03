import { parseStringPromise } from 'xml2js'

export type Aviso = {
  subzona: string
  areaDesc: string
  nivel: string
  nivel_num: 'NORMAL' | 'MEDIA' | 'CRÍTICA'
  activo: boolean
  f_inicio?: string
  f_fin?: string
  fenomeno?: string
  comentario?: string
  probabilidad?: string
}

// Mapeo de severidad CAP a nivel numérico
const SEVERIDAD_MAP: Record<string, 'NORMAL' | 'MEDIA' | 'CRÍTICA'> = {
  'Minor': 'NORMAL',
  'Moderate': 'MEDIA',
  'Severe': 'CRÍTICA',
  'Extreme': 'CRÍTICA',
}

export async function parseCapXml(xml: string): Promise<Aviso[]> {
  const parsed = await parseStringPromise(xml)

  const alert = parsed.alert
  if (!alert || !alert.info) return []

  const resultados: Aviso[] = []

  for (const info of alert.info) {
    const areaList = info.area || []
    const fenomeno = info.event?.[0] || ''
    const comentario = info?.description?.[0] || ''
    const severidad = info.severity?.[0] || 'Minor'
    const nivel_num = SEVERIDAD_MAP[severidad] || 'NORMAL'
    const probabilidad = info.parameter?.find((p: any) => p.valueName?.[0] === 'probabilidad')?.value?.[0]
    const f_inicio = info.effective?.[0]
    const f_fin = info.expires?.[0]

    for (const area of areaList) {
      const geos = area.geocode || []
      const codigo = geos.find((g: any) => g.valueName?.[0] === 'CAPV_SIG')?.value?.[0]

      if (!codigo) continue

      const areaDesc = area.areaDesc?.[0] || ''

      const aviso: Aviso = {
        subzona: codigo,
        areaDesc,
        nivel: severidad,
        nivel_num,
        activo: isActivo(f_inicio, f_fin),
        f_inicio,
        f_fin,
        fenomeno,
        comentario,
        probabilidad,
      }

      resultados.push(aviso)
    }
  }

  return resultados
}

function isActivo(f_inicio?: string, f_fin?: string): boolean {
  const ahora = new Date()
  const ini = f_inicio ? new Date(f_inicio) : null
  const fin = f_fin ? new Date(f_fin) : null

  if (ini && ahora < ini) return false
  if (fin && ahora > fin) return false
  return true
}
