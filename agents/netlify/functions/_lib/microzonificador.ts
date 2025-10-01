// netlify/functions/_lib/microzonizador.ts
import type { Aviso } from './parseCapXml';

export function runMicrozonificador(avisos: Aviso[]) {
  const subzonaObjetivo = '771204';
  const ahora = new Date().toISOString();

  const avisosFiltrados = avisos.filter(a => a.subzona === subzonaObjetivo);

  if (!avisosFiltrados.length) {
    return {
      activo: false,
      subzona: subzonaObjetivo,
      vigencia: { inicio: '', fin: '' },
      fenomenos: [],
      centros_afectados: [],
      caminos_afectados: [],
      zonas_riesgo_intersectadas: [],
      fuente: 'AEMET / Agente IA',
      generated_at: ahora,
      notas: [
        'No hay avisos meteorológicos activos para esta subzona en el momento de la última descarga.'
      ]
    };
  }

  const inicio = avisosFiltrados.map(a => a.f_inicio ?? '').filter(Boolean).sort()[0] ?? '';
  const fin = avisosFiltrados.map(a => a.f_fin ?? '').filter(Boolean).sort().slice(-1)[0] ?? '';
  const fenomenos = [...new Set(avisosFiltrados.map(a => a.fenomeno))];

  return {
    activo: true,
    subzona: subzonaObjetivo,
    vigencia: { inicio, fin },
    fenomenos,
    centros_afectados: [],
    caminos_afectados: [],
    zonas_riesgo_intersectadas: [],
    fuente: 'AEMET / Agente IA',
    generated_at: ahora,
    notas: [
      'Se han detectado avisos meteorológicos activos para esta subzona.',
      'Este agente IA no sustituye a los canales oficiales.'
    ]
  };
}
