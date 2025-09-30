import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Aviso {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  nivel: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  f_inicio?: string;
  f_fin?: string;
}

interface Evaluacion {
  subzona: string;
  areaDesc: string;
  nivel_riesgo: 'BAJO' | 'MODERADO' | 'ALTO';
  score_ia: number;
  fenomeno_principal: string;
  generatedAt?: string;
  trend?: 'UP' | 'DOWN' | 'SAME' | 'NEW';
  details?: {
    counts: { verde: number; amarillo: number; naranja: number; rojo: number };
    time_weight: number;
  };
  reasons?: string[];
  window?: { onsetSoonest?: string; expiresLatest?: string; imminenceHours?: number; durationHours?: number };
}

const INPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'agent_ui.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'risk_eval.json');
const OUTPUT_PREV_PATH = path.join(__dirname, '..', 'public', 'data', 'risk_eval.prev.json');
const CONFIG_PATH = path.join(__dirname, '..', 'public', 'data', 'risk_config.json');

type RiskConfig = {
  version?: number;
  imminenceHoursThreshold: number; // p. ej., 6
  longDurationHoursThreshold: number; // p. ej., 12
  multiplicityStep: number; // p. ej., 0.25
  multiplicityMaxBonus: number; // p. ej., 1
};

function loadConfig(): RiskConfig {
  const defaults: RiskConfig = {
    imminenceHoursThreshold: 6,
    longDurationHoursThreshold: 12,
    multiplicityStep: 0.25,
    multiplicityMaxBonus: 1
  };
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch {}
  return defaults;
}

function toLevel(score: number): 1 | 2 | 3 | 4 {
  const n = Math.round(score);
  if (n <= 1) return 1;
  if (n >= 4) return 4;
  if (n === 2) return 2;
  return 3;
}

function agruparPorSubzona(avisos: Aviso[]): Record<string, Aviso[]> {
  const out: Record<string, Aviso[]> = {};
  for (const a of avisos) {
    if (!out[a.subzona]) out[a.subzona] = [];
    out[a.subzona].push(a);
  }
  return out;
}

function calcularEvaluacion(avisos: Aviso[]): Evaluacion[] {
  const niveles = { verde: 1, amarillo: 2, naranja: 3, rojo: 4 } as const;
  const riesgo_txt: Record<1|2|3|4, 'BAJO' | 'MODERADO' | 'ALTO'> = { 1: 'BAJO', 2: 'MODERADO', 3: 'ALTO', 4: 'ALTO' };

  const agrupados = agruparPorSubzona(avisos);
  const resultados: Evaluacion[] = [];

  const ahora = Date.now();
  const cfg = loadConfig();

  for (const subzona in agrupados) {
    const grupo = agrupados[subzona];

    // Conteo por nivel
    const counts = { verde: 0, amarillo: 0, naranja: 0, rojo: 0 } as {
      verde: number; amarillo: number; naranja: number; rojo: number;
    };
    for (const a of grupo) counts[a.nivel] += 1;

    // Base: nivel máximo
    const max = grupo.reduce((prev, curr) => niveles[curr.nivel] > niveles[prev.nivel] ? curr : prev);
    let score: number = niveles[max.nivel];

    // Multiplicidad: sumar multiplicityStep por cada aviso adicional >= amarillo (capado a multiplicityMaxBonus)
    const multiplicadores = counts.rojo + counts.naranja + counts.amarillo - 1;
    if (multiplicadores > 0) score += Math.min(cfg.multiplicityMaxBonus, multiplicadores * cfg.multiplicityStep);

    // Factor tiempo: si inicio en <= cfg.imminenceHoursThreshold, +cfg.multiplicityStep; si fin en >= cfg.longDurationHoursThreshold, +cfg.multiplicityStep
    const fechasValidas = grupo
      .map(g => ({
        inicio: g.f_inicio ? Date.parse(g.f_inicio) : NaN,
        fin: g.f_fin ? Date.parse(g.f_fin) : NaN
      }))
      .filter(t => !Number.isNaN(t.inicio) || !Number.isNaN(t.fin));

    let time_weight = 0;
    let onsetSoonest: number | undefined;
    let expiresLatest: number | undefined;
    for (const t of fechasValidas) {
      if (!Number.isNaN(t.inicio)) {
        const horasHastaInicio = (t.inicio - ahora) / 3600000;
        if (horasHastaInicio <= cfg.imminenceHoursThreshold) time_weight = Math.max(time_weight, cfg.multiplicityStep);
        if (onsetSoonest === undefined || t.inicio < onsetSoonest) onsetSoonest = t.inicio;
      }
      if (!Number.isNaN(t.fin)) {
        const horasHastaFin = (t.fin - ahora) / 3600000;
        if (horasHastaFin >= cfg.longDurationHoursThreshold) time_weight = Math.max(time_weight, cfg.multiplicityStep);
        if (expiresLatest === undefined || t.fin > expiresLatest) expiresLatest = t.fin;
      }
    }
    score += time_weight;

    // Normalizar score a [1,4]
    score = Math.max(1, Math.min(4, score));

    const nivelRedondeado = toLevel(score);

    // Motivos legibles
    const reasons: string[] = [];
    const totalSignificativos = counts.amarillo + counts.naranja + counts.rojo;
    if (counts.rojo > 0) reasons.push('Aviso rojo activo');
    if (counts.naranja > 0) reasons.push('Aviso naranja activo');
    if (counts.amarillo > 1) reasons.push(`${counts.amarillo} avisos amarillos simultáneos`);
    if (counts.naranja + counts.rojo + counts.amarillo > 1 && (counts.naranja + counts.rojo) > 0) {
      reasons.push('Multiplicidad de fenómenos en la subzona');
    }
    if (onsetSoonest !== undefined) {
      const imminenceHours = Math.round(((onsetSoonest - ahora) / 3600000) * 10) / 10;
      if (imminenceHours <= 6) reasons.push(`Comienza en ${Math.max(0, imminenceHours)} h`);
    }
    if (expiresLatest !== undefined && onsetSoonest !== undefined) {
      const durationHours = Math.max(0, Math.round(((expiresLatest - onsetSoonest) / 3600000) * 10) / 10);
      if (durationHours >= 12) reasons.push(`Duración ≥ ${durationHours} h`);
    }
    resultados.push({
      subzona,
      areaDesc: max.areaDesc,
      nivel_riesgo: riesgo_txt[nivelRedondeado],
      score_ia: Number(score.toFixed(2)),
      fenomeno_principal: max.fenomeno,
      generatedAt: new Date().toISOString(),
      details: { counts, time_weight },
      reasons,
      window: {
        onsetSoonest: onsetSoonest ? new Date(onsetSoonest).toISOString() : undefined,
        expiresLatest: expiresLatest ? new Date(expiresLatest).toISOString() : undefined,
        imminenceHours: onsetSoonest ? Math.round(((onsetSoonest - ahora) / 3600000) * 10) / 10 : undefined,
        durationHours: onsetSoonest && expiresLatest ? Math.max(0, Math.round(((expiresLatest - onsetSoonest) / 3600000) * 10) / 10) : undefined
      }
    });
  }

  return resultados;
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`❌ No se encuentra el archivo: ${INPUT_PATH}`);
    return;
  }

  const raw = fs.readFileSync(INPUT_PATH, 'utf-8');
  let avisos: Aviso[] = [];

  try {
    avisos = JSON.parse(raw);
  } catch (e) {
    console.error('❌ Error al parsear agent_ui.json:', e);
    return;
  }

  // Cargar evaluación previa para calcular trend
  let previa: Evaluacion[] = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try { previa = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8')); } catch {}
  }

  const evaluacion = calcularEvaluacion(avisos);

  const mapaPrev = new Map(previa.map(p => [p.subzona, p]));
  for (const e of evaluacion) {
    const p = mapaPrev.get(e.subzona);
    if (!p) { e.trend = 'NEW'; continue; }
    if (e.score_ia > p.score_ia) e.trend = 'UP';
    else if (e.score_ia < p.score_ia) e.trend = 'DOWN';
    else e.trend = 'SAME';
  }

  // Guardar copia previa y nueva
  try { if (fs.existsSync(OUTPUT_PATH)) fs.copyFileSync(OUTPUT_PATH, OUTPUT_PREV_PATH); } catch {}
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(evaluacion, null, 2));
  console.log(`✅ Evaluación de riesgo completada: ${evaluacion.length} zonas analizadas`);
}

main();
