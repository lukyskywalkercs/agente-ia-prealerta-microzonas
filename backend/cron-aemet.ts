
// backend/cron-aemet.ts
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import decompress from 'decompress';
import { parseCapXml } from './parseCapXml';
import { runMicrozonificador } from '../agents/almassora/microzonificador';

const AEMET_API_KEY = process.env.AEMET_API_KEY || '';
const FECHA = new Date().toISOString().split('T')[0];
const AREA = '77'; // Comunitat Valenciana

const TMP_DIR = path.join('tmp/');
const OUTPUT_UI = path.join('public/data/agent_ui.json');
const OUTPUT_ALMASSORA = path.join('public/data/alerta_almassora.json');

export async function runOnce() {
  console.log(`🚀 Inicio cron AEMET · ${new Date().toISOString()}`);

  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  try {
    const url = `https://opendata.aemet.es/opendata/api/avisos_cap/archivo/fechaini/${FECHA}/fechafin/${FECHA}/area/${AREA}?api_key=${AEMET_API_KEY}`;
    const { data: meta } = await axios.get(url);
    if (!meta?.datos) throw new Error('No se pudo obtener la URL del archivo');

    const { data: fileData } = await axios.get(meta.datos, { responseType: 'arraybuffer' });
    const tarPath = path.join(TMP_DIR, 'aemet.tar.gz');
    fs.writeFileSync(tarPath, fileData);

    const files = await decompress(tarPath, TMP_DIR);
    const xmlFile = files.find(f => f.path.endsWith('.xml'));
    if (!xmlFile) throw new Error('No se encontró XML dentro del archivo');

    const xmlPath = path.join(TMP_DIR, xmlFile.path);
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const avisos = parseCapXml(xmlContent);

    fs.writeFileSync(OUTPUT_UI, JSON.stringify(avisos, null, 2));
    console.log(`📦 Guardado ${OUTPUT_UI} con ${avisos.length} avisos`);

    const almassora = runMicrozonificador(avisos);
    fs.writeFileSync(OUTPUT_ALMASSORA, JSON.stringify(almassora, null, 2));
    console.log(`📦 Guardado ${OUTPUT_ALMASSORA}`);

  } catch (err: any) {
    console.error('❌ Error en cron-aemet.ts:', err.message);
  } finally {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
    console.log('🧹 Limpieza completada: tmp/');
  }
}

// Ejecutar directamente si se lanza como script
if (require.main === module) {
  runOnce();
}
