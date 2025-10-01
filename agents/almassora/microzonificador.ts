// agents/almassora/microzonificador.ts

import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';

// ✅ Emula __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📁 Rutas absolutas válidas con ESM
const INPUT_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'agent_ui.json');
const OUTPUT_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'alerta_almassora.json');

export async function runMicrozonificador() {
  try {
    const raw = fs.readFileSync(INPUT_PATH, 'utf-8');
    const avisos = JSON.parse(raw);

    const subzonaObjetivo = '771204';
    const ahora = new Date().toISOString();

    const avisosFiltrados = avisos.filter((a: any) => a.subzona === subzonaObjetivo);

    if (!avisosFiltrados.length) {
      const sinAvisos = {
        activo: false,
        subzona: subzonaObjetivo,
        vigencia: { inicio: '', fin: '' },
        fenomenos: [],
        centros_afectados: [],
        caminos_afectados: [],
        zonas_riesgo_intersectadas: [],
        fuente: 'AEMET / Agente IA',
        generated_at: ahora,
        notas: ['No hay avisos meteorológicos activos para esta subzona en el momento de la última descarga.']
      };
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sinAvisos, null, 2));
      console.log('📭 Sin avisos activos para Almassora (771204)');
      return;
    }

    const inicio = avisosFiltrados.map((a: any) => a.f_inicio).sort()[0];
    const fin = avisosFiltrados.map((a: any) => a.f_fin).sort().slice(-1)[0];
    const fenomenos = [...new Set(avisosFiltrados.map((a: any) => a.fenomeno || a.evento || 'Desconocido'))];

    const resultado = {
      activo: true,
      subzona: subzonaObjetivo,
      vigencia: { inicio, fin },
      fenomenos,
      centros_afectados: [], // ← pendiente
      caminos_afectados: [], // ← pendiente
      zonas_riesgo_intersectadas: [], // ← pendiente
      fuente: 'AEMET / Agente IA',
      generated_at: ahora,
      notas: [
        'Se han detectado avisos meteorológicos activos para esta subzona.',
        'Este agente IA no sustituye a los canales oficiales.'
      ]
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(resultado, null, 2));
    console.log('✅ Generado alerta_almassora.json con avisos activos');
  } catch (err) {
    console.error('❌ Error al ejecutar el microzonificador:', err);
  }
}
