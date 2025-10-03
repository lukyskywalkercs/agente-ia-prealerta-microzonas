import React, { useEffect, useState } from 'react';
import { getAemetStatus } from '../lib/getAemetStatus';

type Alerta = {
  subzona: string;
  activo: boolean;
  nivel: '—' | 'amarillo' | 'naranja' | 'rojo';
};

export const AvisoAlmassora: React.FC = () => {
  const [estado, setEstado] = useState<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('SIN_AVISOS');
  const [alerta, setAlerta] = useState<Alerta | null>(null);

  useEffect(() => {
    (async () => {
      const st = await getAemetStatus();
      setEstado(st);

      // Si la API falla, no intentes leer alerta_almassora.json
      if (st === 'ERROR_API') return;

      // Carga alerta solo si la API está OK
      const res = await fetch('/data/alerta_almassora.json', { cache: 'no-store' });
      const ct = res.headers.get('Content-Type') || '';
      if (!res.ok || !ct.includes('application/json')) {
        setEstado('ERROR_API');
        return;
      }
      const data = await res.json();
      setAlerta(data);
    })();
  }, []);

  if (estado === 'ERROR_API') {
    return (
      <div className="p-3 rounded border border-red-400 bg-red-50 text-red-700">
        ⚠️ Error al consultar datos oficiales de AEMET: No se pudo verificar el estado de los datos (Microzona 771204).
      </div>
    );
  }

  if (!alerta || alerta.nivel === '—' || estado === 'SIN_AVISOS') {
    return (
      <div className="p-3 rounded border border-green-400 bg-green-50 text-green-700">
        ✅ No hay avisos meteorológicos activos para la subzona 771204<br />
        ⚠️ Confirmado por el agente IA: sin avisos naranja ni rojo válidos para esta subzona.
      </div>
    );
  }

  return (
    <div className="p-3 rounded border-l-4 border-orange-400 bg-orange-50 text-orange-800">
      ⚠️ Aviso activo en Almassora (771204) · Nivel: {alerta.nivel.toUpperCase()}
    </div>
  );
};
