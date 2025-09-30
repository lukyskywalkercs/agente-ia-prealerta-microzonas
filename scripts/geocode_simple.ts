import fs from 'fs';
import path from 'path';
import axios from 'axios';

const INPUT = path.join('agents', 'almassora', 'data', 'centros_fuente.csv');
const OUTPUT = path.join('agents', 'almassora', 'data', 'centros_vulnerables.json');

type CentroRaw = {
  code: string;
  nombre: string;
  titularidad: string;
  direccion: string;
  cp: string;
  municipio: string;
  telefono: string;
};

function parseCSV(text: string): CentroRaw[] {
  const lines = text.trim().split('\n');
  lines.shift(); // remove header
  return lines.map(line => {
    // Manejo correcto de comas dentro de comillas
    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!matches || matches.length < 6) return null as any;

    const [code, nombre, titularidad, direccion, localitat, telefono] = matches.map(s =>
      s.replace(/^"|"$/g, '').trim()
    );

    const [cp, ...municipioParts] = localitat.split('-');
    const municipio = municipioParts.join('-').trim();

    return {
      code,
      nombre,
      titularidad,
      direccion,
      cp: cp.trim(),
      municipio,
      telefono
    };
  }).filter(Boolean);
}

async function geocodeAddress(addr: string): Promise<{ lat: number; lon: number } | null> {
  const url = 'https://nominatim.openstreetmap.org/search';
  try {
    const res = await axios.get(url, {
      params: {
        q: addr + ', España',
        format: 'json',
        limit: 1,
      },
      headers: { 'User-Agent': 'microzona-prealerta/1.0 (info@tudominio.es)' }
    });
    const arr = res.data as any[];
    if (arr.length > 0) {
      const r = arr[0];
      return { lat: parseFloat(r.lat), lon: parseFloat(r.lon) };
    }
  } catch (e: any) {
    console.error('geocode error', addr, e.message);
  }
  return null;
}

async function main() {
  const raw = fs.readFileSync(INPUT, 'utf-8');
  const centros = parseCSV(raw);
  const out: any[] = [];

  for (const c of centros) {
    const fullAddress = `${c.direccion}, ${c.cp} ${c.municipio}`;
    const geo = await geocodeAddress(fullAddress);
    if (geo) {
      out.push({
        code: c.code,
        nombre: c.nombre,
        tipo: /ceip|ies|fp|infantil|escola|coleg/i.test(c.nombre) ? 'educativo'
             : /residencia|geriátrica/i.test(c.nombre) ? 'asistencial'
             : 'otro',
        titularidad: c.titularidad,
        direccion: c.direccion,
        municipio: c.municipio,
        cp: c.cp,
        telefono: c.telefono,
        coordenadas: { lat: geo.lat, lon: geo.lon },
        fuente: 'nominatim-autogeo'
      });
    } else {
      console.warn(`❌ No geolocalizado: ${c.nombre} (${fullAddress})`);
    }
    await new Promise(r => setTimeout(r, 1100)); // respetar política Nominatim
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));
  console.log(`✅ Geocodificación completa. ${out.length} centros procesados`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
