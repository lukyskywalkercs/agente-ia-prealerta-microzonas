import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
import decompress from 'decompress';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { parseCapXml, type AvisoCAP } from './parseCapXml.js';
import { runMicrozonificador } from '../agents/almassora/microzonificador'; // ⬅️ nuevo

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY = process.env.AEMET_API_KEY;
const AREA_CODES = ['77', '69'];
const TMP_DIR = path.join(__dirname, '..', 'tmp');
const OUT_DIR = path.join(__dirname, '..', 'public', 'data');
const FILE_NAME = 'agent_ui.json';
const LOG_FILE = path.join(__dirname, '..', 'logs', 'cron.log');

function log(linea: string) {
  const ts = dayjs().format('YYYY-MM-DD HH:mm:ss');
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.appendFileSync(LOG_FILE, `[${ts}] ${linea}\n`);
  console.log(linea);
}

function limpiarTmp() {
  if (fs.existsSync(TMP_DIR)) fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });
  log('🧹 Limpieza completada: tmp/');
}

function listarXmlRecursivo(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listarXmlRecursivo(full));
    else if (/\.xml$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function descargarYProcesarArea(area: string): Promise<AvisoCAP[]> {
  try {
    const url = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/${area}?api_key=${API_KEY}`;
    const meta = await axios.get(url);
    const downloadUrl = meta.data?.datos;
    if (!downloadUrl) {
      log(`⚠️ Zona ${area}: meta sin 'datos'`);
      return [];
    }

    const resp = await axios.get(downloadUrl, { responseType: 'arraybuffer', validateStatus: () => true });
    if (resp.status >= 400) {
      log(`❌ Zona ${area}: descarga datos HTTP ${resp.status}`);
      return [];
    }

    const contentType = String(resp.headers['content-type'] || '').toLowerCase();

    const areaDir = path.join(TMP_DIR, `area_${area}`);
    fs.mkdirSync(areaDir, { recursive: true });

    const avisos: AvisoCAP[] = [];

    if (contentType.includes('xml') || downloadUrl.toLowerCase().endsWith('.xml')) {
      const xmlPath = path.join(areaDir, `avisos_${area}.xml`);
      fs.writeFileSync(xmlPath, resp.data);
      const parsed = await parseCapXml(xmlPath);
      avisos.push(...parsed);
    } else {
      const archivePath = path.join(areaDir, `avisos_${area}`);
      const ext = contentType.includes('zip') ? '.zip'
                 : contentType.includes('gzip') || contentType.includes('tar') ? '.tar.gz'
                 : '.bin';
      const fullArchive = archivePath + ext;
      fs.writeFileSync(fullArchive, resp.data);

      await decompress(fullArchive, areaDir);
      const xmls = listarXmlRecursivo(areaDir);
      for (const xp of xmls) {
        const parsed = await parseCapXml(xp);
        avisos.push(...parsed);
      }
    }

    log(`✅ Zona ${area} procesada con ${avisos.length} avisos`);
    return avisos;
  } catch (e: any) {
    log(`❌ Zona ${area}: ${e.message}`);
    return [];
  }
}

function guardarJSON(data: AvisoCAP[]) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, FILE_NAME);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  log(`📦 Guardado ${FILE_NAME} con ${data.length} avisos`);
}

function ejecutarRiskEvaluator() {
  exec('npx tsx agents/risk_evaluator.ts', (error, stdout, stderr) => {
    if (error) { log(`❌ risk_evaluator.ts: ${error.message}`); return; }
    if (stderr) log(`⚠️ STDERR risk_evaluator.ts: ${stderr}`);
    log('✅ risk_evaluator.ts ejecutado con éxito');
  });
}

export async function runOnce() {
  log(`🚀 Inicio cron AEMET · ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`);
  limpiarTmp();

  const all: AvisoCAP[] = [];
  for (const area of AREA_CODES) {
    const a = await descargarYProcesarArea(area);
    all.push(...a);
  }

  guardarJSON(all);

  await runMicrozonificador(); // ⬅️ ¡ahora sí!

  ejecutarRiskEvaluator();
}

if (process.argv[1] && process.argv[1].endsWith('cron-aemet.ts')) {
  runOnce().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
