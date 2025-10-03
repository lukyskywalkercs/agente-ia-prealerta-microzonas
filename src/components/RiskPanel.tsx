import React, { useEffect, useState } from 'react';
import { getAemetStatus } from '../lib/getAemetStatus';

export const RiskPanel: React.FC = () => {
  const [estado, setEstado] = useState<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('SIN_AVISOS');

  useEffect(() => {
    getAemetStatus().then(setEstado);
  }, []);

  if (estado === 'ERROR_API') {
    return (
      <div className="p-3 rounded border border-red-400 bg-red-50 text-red-700">
        ⚠️ Error al consultar datos oficiales de AEMET. No se puede evaluar el riesgo meteorológico.
      </div>
    );
  }

  if (estado === 'SIN_AVISOS') {
    return (
      <div className="p-3 rounded border border-green-400 bg-green-50 text-green-700">
        ✅ Evaluación IA: No hay riesgo meteorológico relevante detectado.
      </div>
    );
  }

  return (
    <div className="p-3 rounded border border-yellow-400 bg-yellow-50 text-yellow-800">
      ⚠️ Hay avisos activos. Revisa el listado de AEMET para detalles.
    </div>
  );
};
