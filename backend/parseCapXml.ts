import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

export interface AvisoCAP {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  nivel: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  nivel_num: 'NORMAL' | 'MEDIA' | 'CRITICA';
  f_efectiva: string;
  f_inicio: string;
  f_fin: string;
}

export function parseCapXml(xmlPath: string): AvisoCAP[] {
  const raw = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new XMLParser({ ignoreAttributes: false });
  const json = parser.parse(raw);

  const ahora = new Date();
  const avisos: AvisoCAP[] = [];

  const alertas = Array.isArray(json.alert) ? json.alert : [json.alert];

  for (const alert of alertas) {
    const info = alert.info;
    const area = info?.area;
    const parametroNivel = Array.isArray(info?.parameter)
      ? info.parameter.find((p: any) => p.valueName === 'nivel')
      : null;

    const subzona = area?.geocode?.value || '';
    const areaDesc = area?.areaDesc || '';
    const fenomeno = info?.event || '';
    const nivel = (parametroNivel?.value?.toLowerCase?.() || 'verde') as AvisoCAP['nivel'];
    const f_efectiva = alert?.sent || '';
    const f_inicio = info?.onset || '';
    const f_fin = info?.expires || '';

    const fin = f_fin ? new Date(f_fin) : null;
    if (!fin || fin < ahora) continue;

    const nivel_num: AvisoCAP['nivel_num'] =
      nivel === 'rojo' ? 'CRITICA' :
      nivel === 'naranja' || nivel === 'amarillo' ? 'MEDIA' :
      'NORMAL';

    avisos.push({
      subzona,
      areaDesc,
      fenomeno,
      nivel,
      nivel_num,
      f_efectiva,
      f_inicio,
      f_fin
    });
  }

  return avisos;
}
