import { parseStringPromise } from 'xml2js';

export type Nivel = 'amarillo' | 'naranja' | 'rojo' | 'verde' | '';

export interface Aviso {
  subzona: string;         // p.ej. "771204"
  areaDesc: string;        // p.ej. "Litoral sur de Castellón"
  fenomeno: string;        // p.ej. "Temperaturas máximas"
  fenomeno_cod?: string;   // p.ej. "AT"
  nivel: Nivel;            // amarillo | naranja | rojo | verde | ''
  f_inicio: string;        // ISO string o vacío
  f_fin: string;           // ISO string o vacío
  effective?: string;      // effective si viene
  severity?: string;
  urgency?: string;
  certainty?: string;
}

/** Devuelve el valor de un parámetro por valueName, robusto para objeto o array */
function getParametro(param: any, name: string): string {
  if (!param) return '';
  const list = Array.isArray(param) ? param : [param];
  const found = list.find((p) => p?.valueName === name);
  const v = found?.value ?? '';
  return typeof v === 'string' ? v : (Array.isArray(v) ? v[0] : '');
}

/** Normaliza string potencialmente array/objeto a string */
function s(x: any): string {
  if (typeof x === 'string') return x;
  if (x == null) return '';
  if (Array.isArray(x)) return s(x[0]);
  return String(x);
}

/** Extrae [cod, etiqueta] de "AT;Temperaturas máximas" */
function splitFen(value: string): { cod?: string; label?: string } {
  if (!value) return {};
  const [cod, label] = value.split(';');
  return {
    cod: cod?.trim() || undefined,
    label: label?.trim() || undefined,
  };
}

export async function parseCapXml(xml: string): Promise<Aviso[]> {
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
    trim: true,
  });

  const alert = parsed?.alert;
  if (!alert) return [];

  const infosRaw = alert.info ? (Array.isArray(alert.info) ? alert.info : [alert.info]) : [];
  // Solo español
  const infos = infosRaw.filter((i: any) => s(i.language) === 'es-ES');

  const out: Aviso[] = [];
  const dedupe = new Set<string>();

  for (const info of infos) {
    const param = info.parameter;
    const eventText = s(info.event);
    const fenParam = getParametro(param, 'AEMET-Meteoalerta fenomeno'); // "AT;Temperaturas máximas"
    const { cod: fenCod, label: fenLabel } = splitFen(fenParam);

    // fenómeno: primero event, si no, label del parámetro
    const fenomeno = eventText || fenLabel || 'Fenómeno no especificado';

    // nivel real
    const nivelRaw = getParametro(param, 'AEMET-Meteoalerta nivel').toLowerCase();
    const nivel: Nivel =
      nivelRaw === 'rojo' ? 'rojo' :
      nivelRaw === 'naranja' ? 'naranja' :
      nivelRaw === 'amarillo' ? 'amarillo' :
      nivelRaw === 'verde' ? 'verde' : '';

    // Fechas
    const f_inicio = s(info.onset) || s(info.effective) || '';
    const f_fin = s(info.expires) || '';

    // Áreas
    const areas = info.area ? (Array.isArray(info.area) ? info.area : [info.area]) : [];
    for (const area of areas) {
      const areaDesc = s(area.areaDesc);
      const geocodes = area.geocode ? (Array.isArray(area.geocode) ? area.geocode : [area.geocode]) : [];
      const subzona = s(geocodes.find((g: any) => s(g.valueName) === 'AEMET-Meteoalerta zona')?.value);

      if (!subzona) continue;

      // Excluye VERDE y vacíos
      if (!nivel || nivel === 'verde') continue;

      const key = `${subzona}|${fenomeno}|${nivel}|${f_inicio}|${f_fin}`;
      if (dedupe.has(key)) continue;
      dedupe.add(key);

      out.push({
        subzona,
        areaDesc,
        fenomeno,
        fenomeno_cod: fenCod,
        nivel,
        f_inicio,
        f_fin,
        effective: s(info.effective),
        severity: s(info.severity),
        urgency: s(info.urgency),
        certainty: s(info.certainty),
      });
    }
  }

  // Orden estable
  out.sort((a, b) => a.subzona.localeCompare(b.subzona) || s(a.f_inicio).localeCompare(s(b.f_inicio)));
  return out;
}
