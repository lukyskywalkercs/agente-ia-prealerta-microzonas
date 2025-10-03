import React, { useEffect, useState } from 'react';
import { RiskPanel } from '../components/RiskPanel'

const RiesgoPage: React.FC = () => {
  const [now, setNow] = useState<string>(new Date().toLocaleString());
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toLocaleString()), 1000 * 60);
    fetch('/data/aemet_meta.json')
      .then(r => r.json())
      .then(meta => { if (meta?.lastRunAt) setLastRunAt(new Date(meta.lastRunAt).toLocaleString()); })
      .catch(() => {});
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-white rounded shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-yellow-700">
        Evaluador de riesgo: explicación rápida
      </h2>
      <div className="rounded-lg border bg-yellow-50 border-yellow-100 p-4 mb-6 text-sm text-gray-800">
        <div className="mb-3 text-xs text-gray-700">
          Hora actual: <span className="font-medium">{now}</span>
          {lastRunAt && (<>
            <span className="mx-2">·</span>
            Última ejecución datos AEMET: <span className="font-medium">{lastRunAt}</span>
          </>)}
        </div>
        <p className="mb-2"><strong>¿Qué es?</strong> Un “semáforo” que ordena las subzonas de AEMET por prioridad y te dice <em>por qué</em>.</p>
        <p className="mb-2"><strong>Qué usa:</strong> los avisos oficiales (CAP) y sus horas de inicio/fin.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div>
            <p className="font-medium mb-1">Leyenda</p>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-red-700 font-semibold">ALTO</span>: hay naranja o rojo.</li>
              <li><span className="text-yellow-700 font-semibold">MODERADO</span>: hay amarillo.</li>
              <li><span className="text-green-700 font-semibold">BAJO</span>: solo verde o sin aviso.</li>
              <li>Flechas: ↑ sube, ↓ baja, “nuevo” aparece ahora.</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Motivos que verás</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Empieza pronto: “Comienza en X h”.</li>
              <li>Durará: “Duración ≥ Y h”.</li>
              <li>Varios avisos a la vez en la subzona.</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">No sustituye a los avisos oficiales. Te ayuda a saber <em>dónde mirar primero</em>.</p>
        <details className="mt-3 cursor-pointer">
          <summary className="text-xs text-gray-700">Ver variables públicas del cálculo</summary>
          <pre className="text-[11px] bg-white/60 p-2 rounded mt-2 overflow-auto">{`Se publican en /data/risk_config.json:
- imminenceHoursThreshold (horas para marcar inminente)
- longDurationHoursThreshold (horas para marcar larga duración)
- multiplicityStep (incremento por multiplicidad/inminencia/duración)
- multiplicityMaxBonus (tope por multiplicidad)
Fuentes de datos:
- Avisos oficiales AEMET (CAP/XML) → /data/agent_ui.json
- Parámetros públicos → /data/risk_config.json`}</pre>
        </details>
      </div>

      <RiskPanel />
    </div>
  );
};

export default RiesgoPage;
