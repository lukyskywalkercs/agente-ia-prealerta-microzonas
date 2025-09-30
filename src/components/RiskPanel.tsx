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

  useEffect(() => {
    fetch('/data/risk_eval.json')
      .then((res) => res.json())
      .then((data: Evaluacion[]) => setDatos(data))
      .catch((err) => console.error('Error cargando risk_eval.json', err));
  }, []);

  const niveles = ['ALTO', 'MODERADO', 'BAJO'] as const;

  const getColor = (nivel: string) => {
    switch (nivel) {
      case 'ALTO': return 'border-red-600 bg-red-100';
      case 'MODERADO': return 'border-yellow-500 bg-yellow-100';
      default: return 'border-green-600 bg-green-100';
    }
  };

  const ordenar = (a: Evaluacion, b: Evaluacion) => b.score_ia - a.score_ia || a.subzona.localeCompare(b.subzona);
  const filtrados = datos.filter(d => {
    if (!onlyImminent) return true;
    const h = d.window?.imminenceHours;
    return typeof h === 'number' && h <= 3;
  });
  const contar = (nivel: Evaluacion['nivel_riesgo']) => filtrados.filter(d => d.nivel_riesgo === nivel).length;

  // Escala auxiliar: muestra también 0–20 redondeado (0 = BAJO, 20 = ALTO)
  const toScale20 = (score14: number) => {
    // score14 en [1..4] → [0..20]
    const s = ((score14 - 1) / 3) * 20;
    return Math.round(s);
  };

  const [cfg, setCfg] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-bold mb-4 text-blue-900">
        Agente IA Evaluador de Riesgo (no oficial)
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        Este panel resume el riesgo por subzona y añade el porqué: multiplicidad de avisos, inminencia y duración. Complementa la información oficial de AEMET.
      </p>

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

      {cfg && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p className="text-sm font-medium text-gray-800 mb-2">Parámetros públicos del cálculo</p>
          <div className="grid md:grid-cols-4 gap-3 text-sm">
            <label className="flex items-center gap-2">Inminencia (h)
              <input className="w-20 border rounded px-2 py-1" type="number" value={cfg.imminenceHoursThreshold}
                onChange={(e) => setCfg({ ...cfg, imminenceHoursThreshold: Number(e.target.value) })} />
            </label>
            <label className="flex items-center gap-2">Larga duración (h)
              <input className="w-24 border rounded px-2 py-1" type="number" value={cfg.longDurationHoursThreshold}
                onChange={(e) => setCfg({ ...cfg, longDurationHoursThreshold: Number(e.target.value) })} />
            </label>
            <label className="flex items-center gap-2">Paso multiplicidad
              <input className="w-24 border rounded px-2 py-1" type="number" step="0.05" value={cfg.multiplicityStep}
                onChange={(e) => setCfg({ ...cfg, multiplicityStep: Number(e.target.value) })} />
            </label>
            <label className="flex items-center gap-2">Tope bonus
              <input className="w-20 border rounded px-2 py-1" type="number" step="0.1" value={cfg.multiplicityMaxBonus}
                onChange={(e) => setCfg({ ...cfg, multiplicityMaxBonus: Number(e.target.value) })} />
            </label>
          </div>
          <div className="mt-3">
            <button disabled={saving} onClick={saveCfg} className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando…' : 'Guardar y recalcular ahora'}
            </button>
          </div>
        </div>
      )}

      {filtrados.length === 0 ? (
        <p className="text-sm text-gray-500">✅ Sin riesgos detectados en ninguna subzona.</p>
      ) : (
        (
          simpleMode ? (
            <div className="grid md:grid-cols-3 gap-4">
              {(['ALTO','MODERADO','BAJO'] as const).map(nivel => (
                <div key={nivel} className={`p-5 rounded-xl border shadow ${getColor(nivel)}`}>
                  <p className="text-sm text-gray-700">Riesgo {nivel}</p>
                  <p className="text-3xl font-semibold text-gray-900">{contar(nivel)}</p>
                  <div className="mt-3 space-y-2">
                    {filtrados.filter(d => d.nivel_riesgo === nivel).sort(ordenar).slice(0,5).map(z => (
                      <div key={z.subzona} className="text-sm text-gray-800 flex justify-between gap-3">
                        <span>Subzona {z.subzona}</span>
                        <span className="text-xs text-gray-600">{toScale20(z.score_ia)}/20</span>
                        {typeof z.window?.imminenceHours === 'number' && <span className="text-xs text-gray-600">{Math.max(0, z.window!.imminenceHours!)} h</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-gray-700">
                    {nivel === 'ALTO' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Evita desplazamientos innecesarios</li>
                        <li>Asegura objetos en terrazas/balcones</li>
                        <li>Sigue indicaciones oficiales</li>
                      </ul>
                    )}
                    {nivel === 'MODERADO' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Revisa la previsión de tu subzona</li>
                        <li>Planifica rutas alternativas</li>
                        <li>Ten a mano teléfono de emergencias</li>
                      </ul>
                    )}
                    {nivel === 'BAJO' && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Situación normal</li>
                        <li>Manténte informado</li>
                      </ul>
                    )}
                  </div>
                  <div className="mt-3">
                    <button className="text-xs text-blue-700 hover:underline" onClick={() => setSimpleMode(false)}>Ver detalle</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            niveles.map((nivel) => {
              const grupo = filtrados.filter(d => d.nivel_riesgo === nivel).sort(ordenar);
              if (grupo.length === 0) return null;
              return (
                <div key={nivel} className="mb-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-2">Nivel {nivel}</h3>
                  <div className="grid gap-3">
                    {grupo.map((zona) => (
                      <div key={zona.subzona} className={`p-4 rounded border-l-4 shadow-sm ${getColor(nivel)}`}>
                        <p className="text-sm font-bold text-gray-800">Subzona {zona.subzona}</p>
                        <p className="text-sm text-gray-700">{zona.areaDesc}</p>
                        <p className="text-sm font-medium mt-1">Fenómeno principal: {zona.fenomeno_principal}</p>
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                          Riesgo IA: {zona.nivel_riesgo} (score {zona.score_ia.toFixed(2)} · {toScale20(zona.score_ia)}/20)
                          {zona.trend === 'UP' && <span className="text-red-700">↑</span>}
                          {zona.trend === 'DOWN' && <span className="text-green-700">↓</span>}
                          {zona.trend === 'NEW' && <span className="text-yellow-700">nuevo</span>}
                        </p>
                        {zona.reasons && zona.reasons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {zona.reasons.map((r: string, idx: number) => (
                              <span key={idx} className="text-xs bg-black/5 text-gray-800 px-2 py-0.5 rounded-full">{r}</span>
                            ))}
                          </div>
                        )}
                        {zona.window && (
                          <p className="text-[11px] text-gray-500 mt-2">
                            {zona.window.onsetSoonest && <>Inicio: {new Date(zona.window.onsetSoonest).toLocaleString()} · </>}
                            {zona.window.expiresLatest && <>Fin: {new Date(zona.window.expiresLatest).toLocaleString()}</>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )
        )
      )}
    </div>
  );
};

export default RiskPanel;
