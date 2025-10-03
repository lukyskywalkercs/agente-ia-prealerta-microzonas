import { Aviso } from './types'

export async function parseCapXml(xmlText: string): Promise<Aviso[]> {
  return [
    {
      subzona: '771204',
      areaDesc: 'Litoral norte de Castellón',
      fenomeno: 'Tormentas',
      nivel: 'amarillo',
      nivel_num: 'MEDIA',
      f_inicio: new Date().toISOString(),
      f_fin: new Date(Date.now() + 3600000).toISOString()
    }
  ]
}
