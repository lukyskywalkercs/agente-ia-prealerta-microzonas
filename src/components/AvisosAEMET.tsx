import React, { useEffect, useState } from 'react';
import { getAemetStatus } from '../lib/getAemetStatus';

type Aviso = {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  nivel: string;
  f_inicio: string;
  f_fin: string;
};

export const AvisosAEMET: React.FC = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [estado, setEstado] = useState<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('SIN_AVISOS');

  useEffect(() => {
    getAemetStatus().then(setEstado);
    fetch('/data/agent_ui.json')
      .then((res) => res.json())
      .then((data) => setAvisos(data.avisos || []))
      .catch(() => setEstado('ERROR_API'));
  }, []);

  if (estado === 'ERROR_API') {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        ⚠️ No se ha podido conectar con la API oficial de AEMET o ha devuelto un error inesperado. Por favor, vuelva a intentarlo más tarde.
      </div>
    );
  }

  if (estado === 'SIN_AVISOS') {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ No hay avisos meteorológicos activos publicados por AEMET.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {avisos.map((aviso, idx) => (
        <div
          key={idx}
          className={`border-l-4 p-4 ${
            aviso.nivel === 'rojo'
              ? 'border-red-500 bg-red-50'
              : aviso.nivel === 'naranja'
              ? 'border-orange-400 bg-orange-50'
              : 'border-yellow-300 bg-yellow-50'
          }`}
        >
          <p className="font-bold">{aviso.areaDesc}</p>
          <p>{aviso.fenomeno}</p>
          <p className="text-sm text-gray-600">
            Desde: {aviso.f_inicio} · Hasta: {aviso.f_fin}
          </p>
        </div>
      ))}
    </div>
  );
};
