import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { type AvisoCAP } from '../../backend/parseCapXml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'agent_ui.json');
const OUT_PATH = path.join(__dirname, '..', '..', 'public', 'data', 'alerta_almassora.json');
function runMicrozonificador() {
  const avisos: AvisoCAP[] = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  const ahora = new Date();

  const filtrados = avisos.filter(
    (a) => a.subzona === '771204' && ['naranja', 'rojo'].includes(a.nivel) && new Date(a.f_fin) >= ahora
  );

  if (filtrados.length === 0) {
    const output = {
      activo: false,
      subzona: '771204',
      vigencia: { inicio: '', fin: '' },
      fenomenos: [],
      centros_afectados: [],
      caminos_afectados: [],
      zonas_riesgo_intersectadas: [],
      fuente: 'AEMET / Agente IA',
      generated_at: new Date().toISOString(),
      notas: [
        'No hay avisos meteorológicos activos para esta subzona en el momento de la última descarga.'
      ]
    };
    fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
    return;
  }

  const actual = filtrados[0];
  const output = {
    activo: true,
    subzona: '771204',
    vigencia: {
      inicio: actual.f_inicio,
      fin: actual.f_fin
    },
    fenomenos: [actual.fenomeno],
    centros_afectados: [],
    caminos_afectados: [],
    zonas_riesgo_intersectadas: [],
    fuente: 'AEMET / Agente IA',
    generated_at: new Date().toISOString(),
    notas: []
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
}

runMicrozonificador();
