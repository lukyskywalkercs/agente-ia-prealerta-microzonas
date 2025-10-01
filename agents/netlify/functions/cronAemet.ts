// netlify/functions/cronAemet.ts
import { Handler } from '@netlify/functions';
import axios from 'axios';
import decompress from 'decompress';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { parseCapXml } from './_lib/parseCapXml';
import { runMicrozonificador } from './_lib/microzonizador';

const AEMET_API_KEY = process.env.AEMET_API_KEY || '';

export const handler: Handler = async () => {
  // Seguridad: sin API key no seguimos (modo absoluto)
  if (!AEMET_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true, message: 'Falta AEMET_API_KEY en variables de entorno' })
    };
  }

  const fechaHoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const area = '77'; // Comunitat Valenciana
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aemet-'));

  try {
    const url = `https://opendata.aemet.es/opendata/api/avisos_cap/archivo/fechaini/${fechaHoy}/fechafin/${fechaHoy}/area/${area}?api_key=${AEMET_API_KEY}`;
    const { data: resMeta } = await axios.get(url, { timeout: 20000 });

    const datosUrl = resMeta?.datos;
    if (!datosUrl) throw new Error('Enlace de descarga no disponible en respuesta AEMET');

    const { data: rawData } = await axios.get(datosUrl, { responseType: 'arraybuffer', timeout: 30000 });

    const tarPath = path.join(tmpDir, 'avisos.tar.gz');
    fs.writeFileSync(tarPath, rawData);

    const files = await decompress(tarPath, tmpDir);
    const xmlEntry = files.find(f => f.path.toLowerCase().endsWith('.xml'));
    if (!xmlEntry) throw new Error('No se encontró archivo XML dentro del .tar.gz');

    const xmlPath = path.join(tmpDir, xmlEntry.path);
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');

    const avisos = await parseCapXml(xmlContent); // datos reales
    const now = new Date().toISOString();

    const alerta_almassora = runMicrozonificador(avisos);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        agent_ui: avisos,
        alerta_almassora,
        generated_at: now
      })
    };
  } catch (err: any) {
    const msg = err?.message ?? 'Error desconocido';
    console.error('❌ cronAemet fallo:', msg);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: true, message: msg })
    };
  } finally {
    // Limpieza estricta de temporales
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};
