import React, { useEffect, useState } from 'react';
import { getAemetStatus } from '../lib/getAemetStatus';

type Aviso = {
  subzona: string;
  areaDesc: string;
  fenomeno?: string;
  nivel: 'amarillo' | 'naranja' | 'rojo';
  f_inicio?: string;
  f_fin?: string;
};

export const AvisosAEMET: React.FC = () => {
  const [estado, setEstado] = useState<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('SIN_AVISOS');
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    (async () => {
      const st = await getAemetStatus();
      setEstado(st);

      if (st === 'CON_AVISOS') {
        const res = await fetch('/data/agent_ui.json', { cache: 'no-store' });
        const ct = res.headers.get('Content-Type') || '';
        if (!res.ok || !ct.includes('application/json')) {
          setEstado('ERROR_API');
          return;
        }
        const data = await res.json();
        setAvisos(Array.isArray(data.avisos) ? data.avisos : []);
      }
    })();
  }, []);

  if (estado === 'ERROR_API') {
    return (
      <div className="p-3 rounded border border-red-400 bg-red-50 text-red-700">
        ⚠️ Error al consultar datos oficiales de AEMET: No se pudo verificar el estado de los datos.
      </div>
    );
  }

  if (estado === 'SIN_AVISOS') {
    return (
      <div className="p-3 rounded border border-green-400 bg-green-50 text-green-700">
        ✅ No hay avisos meteorológicos activos publicados por AEMET.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {avisos.map((a, i) => (
        <div
          key={i}
          className={`p-3 rounded border-l-4 ${
            a.nivel === 'rojo'
              ? 'border-red-500 bg-red-50'
              : a.nivel === 'naranja'
              ? 'border-orange-400 bg-orange-50'
              : 'border-yellow-300 bg-yellow-50'
          }`}
        >
          <p className="font-semibold">{a.areaDesc}</p>
          {a.fenomeno && <p>{a.fenomeno}</p>}
          <p className="text-sm text-gray-600">
            {a.f_inicio ? `Desde: ${a.f_inicio}` : ''} {a.f_fin ? `· Hasta: ${a.f_fin}` : ''}
          </p>
        </div>
      ))}
    </div>
  );
};
