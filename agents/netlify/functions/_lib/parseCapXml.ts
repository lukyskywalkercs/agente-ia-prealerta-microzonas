// netlify/functions/_lib/parseCapXml.ts
import { parseStringPromise } from 'xml2js';

export interface Aviso {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  f_inicio?: string;
  f_fin?: string;
}

export async function parseCapXml(xml: string): Promise<Aviso[]> {
  const parsed = await parseStringPromise(xml, { explicitArray: false });

  // El CAP de AEMET puede venir como <alert> único o como colección.
  const alertsRaw = parsed?.alerts?.alert ?? parsed?.alert;
  if (!alertsRaw) return [];

  const alerts: any[] = Array.isArray(alertsRaw) ? alertsRaw : [alertsRaw];
  const out: Aviso[] = [];

  for (const alert of alerts) {
    const info = alert?.info;
    if (!info) continue;

    const event = info.event ?? 'Desconocido';
    const areasRaw = info.area ? (Array.isArray(info.area) ? info.area : [info.area]) : [];

    for (const area of areasRaw) {
      const areaDesc = area?.areaDesc ?? 'Área sin nombre';
      const geocodes = area?.geocode ? (Array.isArray(area.geocode) ? area.geocode : [area.geocode]) : [];

      // En CAP de AEMET suelen usar valueName "ID_ZONA" o similar
      const subzona =
        geocodes.find((g: any) => g?.valueName === 'ID_ZONA')?.value ??
        geocodes.find((g: any) => g?.valueName === 'IBERMET-Subzona')?.value ??
        '000000';

      out.push({
        subzona,
        areaDesc,
        fenomeno: event,
        f_inicio: info.onset,
        f_fin: info.expires,
      });
    }
  }
  return out;
}
