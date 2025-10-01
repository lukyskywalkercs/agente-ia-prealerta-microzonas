
import React, { useEffect, useState } from 'react';

interface Evaluacion {
  subzona: string;
  areaDesc: string;
  nivel_riesgo: 'BAJO' | 'MODERADO' | 'ALTO';
  score_ia: number;
  fenomeno_principal: string;
  generatedAt?: string;
  trend?: 'UP' | 'DOWN' | 'SAME' | 'NEW';
  details?: { counts: { verde: number; amarillo: number; naranja: number; rojo: number }; time_weight: number };
  reasons?: string[];
  window?: { onsetSoonest?: string; expiresLatest?: string; imminenceHours?: number; durationHours?: number };
}

const RiskPanel: React.FC = () => {
  const [datos, setDatos] = useState<Evaluacion[]>([]);
  const [simpleMode, setSimpleMode] = useState(true);
  const [onlyImminent, setOnlyImminent] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [cfg, setCfg] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/data/risk_eval.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('El archivo recibido no es JSON');
        }
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Contenido JSON inválido');
        setDatos(data);
      } catch (err: any) {
        console.warn('⚠️ Error cargando risk_eval.json:', err.message);
        setErrorCarga(err.message);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    fetch('/api/risk-config').then(r => r.json()).then(setCfg).catch(() => setCfg(null));
  }, []);

  const saveCfg = async () => {
    if (!cfg) return;
    setSaving(true);
    try {
      await fetch('/api/risk-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) });
      await fetch('/api/risk-recalc', { method: 'POST' });
      const fresh = await fetch('/data/risk_eval.json').then(r => r.json());
      setDatos(fresh);
    } finally {
      setSaving(false);
    }
  };

  const niveles = ['ALTO', 'MODERADO', 'BAJO'] as const;
  const getColor = (nivel: string) => {
    switch (nivel) {
      case 'ALTO': return 'border-red-600 bg-red-100';
      case 'MODERADO': return 'border-yellow-500 bg-yellow-100';
      default: return 'border-green-600 bg-green-100';
    }
  };
  const ordenar = (a: Evaluacion, b: Evaluacion) => b.score_ia - a.score_ia || a.subzona.localeCompare(b.subzona);
  const filtrados = datos.filter(d => !onlyImminent || (typeof d.window?.imminenceHours === 'number' && d.window.imminenceHours <= 3));
  const contar = (nivel: Evaluacion['nivel_riesgo']) => filtrados.filter(d => d.nivel_riesgo === nivel).length;
  const toScale20 = (score14: number) => Math.round(((score14 - 1) / 3) * 20);

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Agente IA Evaluador de Riesgo (no oficial)</h2>
      <p className="text-sm text-gray-600 mb-6">
        Este panel resume el riesgo por subzona y añade el porqué: multiplicidad de avisos, inminencia y duración.
        Complementa la información oficial de AEMET.
      </p>

      {errorCarga && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded text-sm mb-6">
          ⚠️ Error cargando datos de evaluación IA: {errorCarga}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={simpleMode} onChange={(e) => setSimpleMode(e.target.checked)} />
            Modo sencillo
          </label>
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" checked={onlyImminent} onChange={(e) => setOnlyImminent(e.target.checked)} />
            Solo empieza en ≤ 3 h
          </label>
        </div>
        <div className="text-xs text-gray-600 hidden md:block">
          ALTO: actúa ya · MODERADO: estate atento · BAJO: normalidad · Escala: 1–4 (≈ 0–20)
        </div>
      </div>

      {/* Resto de visualización (cards, detalles) permanece igual */}
    </div>
  );
};

export default RiskPanel;
