// scripts/validate_centros.ts

import fs from 'fs';
import path from 'path';

const IN = path.join('agents', 'almassora', 'data', 'centros_vulnerables.json');

// Bounding Box aproximado del término municipal de Almassora
const BBOX = {
  minLat: 39.91,
  maxLat: 39.98,
  minLon: -0.10,
  maxLon: -0.02,
};

type Centro = {
  nombre: string;
  coordenadas: { lat: number; lon: number };
};

const data: Centro[] = JSON.parse(fs.readFileSync(IN, 'utf-8'));

let ok = 0, out = 0;
for (const c of data) {
  const lat = c.coordenadas?.lat;
  const lon = c.coordenadas?.lon;
  const inZone = lat >= BBOX.minLat && lat <= BBOX.maxLat && lon >= BBOX.minLon && lon <= BBOX.maxLon;
  if (inZone) {
    ok++;
  } else {
    out++;
    console.warn(`⚠️ Fuera de Almassora: ${c.nombre} → (${lat}, ${lon})`);
  }
}

console.log(`\n✅ Centros dentro de Almassora: ${ok}`);
console.log(`❌ Centros fuera del municipio: ${out}`);
console.log(`📊 Total procesados: ${data.length}`);
