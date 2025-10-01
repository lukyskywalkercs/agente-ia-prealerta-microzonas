import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import decompress from 'decompress';
import { parseCapXml, Aviso, Nivel } from './parseCapXml';

dotenv.config({ path: '.env.local' });

const AEMET_API_KEY = process.env.AEMET_API_KEY;
const AREA = '77';

const TMP_DIR = 'tmp';
const OUT_DIR = 'public/data';
const OUT_AGENT = path.join(OUT_DIR, 'agent_ui.json');
const OUT_ALMASSORA = path.join(OUT_DIR, 'alerta_almassora.json');

function ensureDirs() {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function nivelMax(niveles: Nivel[]): Nivel | undefined {
  const order: Record<Nivel, number> = { '': 0, verde: 1, amarillo: 2, naranja: 3, rojo: 4 };
  let best: Nivel | undefined = undefined;
  let bestScore = -1;
  for (const n of niveles) {
    const sc = order[n] ?? 0;
    if (sc > bestScore) { best = n; bestScore = sc; }
  }
  return best;
}

async function run() {
  if (!AEMET_API_KEY) {
    console.error('❌ Falta AEMET_API_KEY');
    return;
  }

  const metaUrl = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/${AREA}?api_key=${AEMET_API_KEY}`;
  console.log('📡 URL AEMET:', metaUrl);

  ensureDirs();

  try {
    // 1) Metadatos
    const meta = await axios.get(metaUrl, { timeout: 15000 });
    const datosUrl = meta.data?.datos;
    if (!datosUrl) throw new Error('No se pudo obtener la URL de datos');

    console.log('📥 Enlace datos:', datosUrl);

    // 2) Descargar .tar.gz
    const tarPath = path.join(TMP_DIR, 'aemet.tar.gz');
    const bin = await axios.get(datosUrl, { responseType: 'arraybuffer', timeout: 20000 });
    fs.writeFileSync(tarPath, bin.data);
    console.log('📦 .tar.gz guardado');

    // 3) Descomprimir y localizar XML
    const files = await decompress(tarPath, TMP_DIR);
    const xmlEntry = files.find(f => f.path.endsWith('.xml'));
    if (!xmlEntry) throw new Error('No se encontró XML dentro del .tar.gz');
    const xml = xmlEntry.data.toString('utf8');
    console.log('📄 XML cargado, longitud:', xml.length);

    // 4) Parsear y filtrar (ya excluye VERDE y no-ES)
    const avisos: Aviso[] = await parseCapXml(xml);

    // 5) Guardar agent_ui.json
    const payload = { generated_at: new Date().toISOString(), avisos };
    fs.writeFileSync(OUT_AGENT, JSON.stringify(payload, null, 2));
    console.log(`✅ Generado ${OUT_AGENT} con ${avisos.length} avisos (sin VERDE)`);

    // 6) Almassora 771204 (nivel máximo + ventana total + fenómenos)
    const z = avisos.filter(a => a.subzona === '771204');
    const nivelTop = nivelMax(z.map(a => a.nivel));
    const vigIni = z.length ? z.map(a => a.f_inicio).filter(Boolean).sort()[0] : '';
    const vigFin = z.length ? z.map(a => a.f_fin).filter(Boolean).sort().slice(-1)[0] : '';

    const alerta = {
      activo: z.length > 0,
      subzona: '771204',
      nivel: nivelTop, // ← el frontend puede usar esto para color
      vigencia: { inicio: vigIni || '', fin: vigFin || '' },
      fenomenos: z.map(a => ({ descripcion: a.fenomeno, nivel: a.nivel, inicio: a.f_inicio, fin: a.f_fin })),
      centros_afectados: [],
      caminos_afectados: [],
      zonas_riesgo_intersectadas: [],
      fuente: 'AEMET / Agente IA',
      generated_at: new Date().toISOString(),
      notas: z.length
        ? ['⚠️ Se han detectado avisos meteorológicos activos para esta subzona.']
        : ['No hay avisos meteorológicos activos para esta subzona.']
    };

    fs.writeFileSync(OUT_ALMASSORA, JSON.stringify(alerta, null, 2));
    console.log(`✅ Generado ${OUT_ALMASSORA} (activo=${alerta.activo ? 'sí' : 'no'}, nivel=${alerta.nivel || '—'})`);

  } catch (err: any) {
    console.error('❌ Error cron AEMET:', err?.message || err);
  }
}

// Ejecutar siempre en CLI
run();
