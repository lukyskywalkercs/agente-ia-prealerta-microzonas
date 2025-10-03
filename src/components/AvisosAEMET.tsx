import React, { useEffect, useState } from 'react';

type Aviso = {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  nivel: 'amarillo' | 'naranja' | 'rojo';
  nivel_num?: string;
  f_inicio?: string;
  f_fin?: string;
};

type AgentData = {
  generated_at: string;
  avisos: Aviso[];
};

export const AvisosAEMET: React.FC = () => {
  const [data, setData] = useState<AgentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/agent_ui.json', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          throw new Error(`Respuesta no válida de la API: ${res.status} (${res.headers.get('content-type')})`);
        }
        return res.json();
      })
      .then(setData)
      .catch(() => setError('⚠️ Error al consultar datos oficiales de AEMET'));
  }, []);

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>;
  }

  if (!data) {
    return <p className="text-gray-500">Cargando avisos...</p>;
  }

  if (data.avisos.length === 0) {
    return <p className="text-green-600">✅ No hay avisos meteorológicos activos para esta zona.</p>;
  }

  return (
    <div className="space-y-4">
      {data.avisos.map((aviso, idx) => (
        <div key={idx} className="p-4 border rounded shadow bg-white">
          <p><strong>Zona:</strong> {aviso.areaDesc} ({aviso.subzona})</p>
          <p><strong>Fenómeno:</strong> {aviso.fenomeno}</p>
          <p><strong>Nivel:</strong> {aviso.nivel.toUpperCase()}</p>
          <p><strong>Inicio:</strong> {aviso.f_inicio}</p>
          <p><strong>Fin:</strong> {aviso.f_fin}</p>
        </div>
      ))}
    </div>
  );
};
