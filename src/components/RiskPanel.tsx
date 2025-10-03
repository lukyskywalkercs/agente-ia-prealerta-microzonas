import React, { useEffect, useState } from 'react';
import { getAemetStatus } from '../lib/getAemetStatus';

type Evaluacion = {
  subzona: string;
  nivel_riesgo: 'ALTO' | 'MODERADO' | 'BAJO';
  puntuacion: number;
  fenomeno_principal?: string;
};

export const RiskPanel: React.FC = () => {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [estado, setEstado] = useState<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('SIN_AVISOS');

  useEffect(() => {
    getAemetStatus().then(setEstado);
    fetch('/data/risk_eval.json')
      .then((res) => res.json())
      .then(setEvaluaciones)
      .catch(() => setEvaluaciones([]));
  }, []);

  if (estado === 'ERROR_API') {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        ⚠️ Error al consultar datos oficiales de AEMET. No se puede evaluar el riesgo meteorológico.
      </div>
    );
  }

  if (evaluaciones.length === 0) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ Evaluación IA: No hay riesgo meteorológico relevante detectado.
      </div>
    );
  }

  const grupos = {
    ALTO: evaluaciones.filter((e) => e.nivel_riesgo === 'ALTO'),
    MODERADO: evaluaciones.filter((e) => e.nivel_riesgo === 'MODERADO'),
    BAJO: evaluaciones.filter((e) => e.nivel_riesgo === 'BAJO'),
  };

  return (
    <div className="space-y-4">
      {(['ALTO', 'MODERADO', 'BAJO'] as const).map((nivel) =>
        grupos[nivel].length > 0 ? (
          <div key={nivel}>
            <h3 className="font-bold text-lg mt-4">{nivel}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {grupos[nivel].map((evalItem) => (
                <div
                  key={evalItem.subzona}
                  className={`border rounded p-3 shadow ${
                    nivel === 'ALTO'
                      ? 'border-red-500 bg-red-50'
                      : nivel === 'MODERADO'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-green-500 bg-green-50'
                  }`}
                >
                  <p className="text-sm font-semibold">Subzona: {evalItem.subzona}</p>
                  <p className="text-sm">Puntuación IA: {evalItem.puntuacion}</p>
                  {evalItem.fenomeno_principal && (
                    <p className="text-sm italic">Fenómeno principal: {evalItem.fenomeno_principal}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};
