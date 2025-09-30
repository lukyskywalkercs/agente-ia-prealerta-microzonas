import { promises as fs } from 'fs';
import * as path from 'path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'agents', 'almassora', 'data');

const files = [
  'centros_vulnerables.json',
  'caminos_criticos.json',
  'zonas_riesgo.geojson'
];

async function main() {
  let ok = true;
  for (const f of files) {
    const p = path.join(DATA_DIR, f);
    try {
      const raw = await fs.readFile(p, 'utf-8');
      const parsed = JSON.parse(raw);
      if ((Array.isArray(parsed) && parsed.length === 0) ||
          (parsed?.features && Array.isArray(parsed.features) && parsed.features.length === 0)) {
        console.log(`WARN: ${f} vacío`);
      } else {
        console.log(`OK: ${f} presente`);
      }
    } catch (e) {
      console.log(`MISSING: ${f}`);
      ok = false;
    }
  }
  process.exitCode = ok ? 0 : 1;
}

main();

