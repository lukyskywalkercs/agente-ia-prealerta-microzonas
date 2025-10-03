import React, { useEffect, useState } from 'react';
import { getAemetStatus } from '../lib/getAemetStatus';

type Alerta = {
  subzona: string;
  activo: boolean;
  nivel: '—' | 'amarillo' | 'naranja' | 'rojo';
};

export const AvisoAlmassora: React.FC = () => {
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [estado, setEstado] = useState<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'>('SIN_AVISOS');

  useEffect(() => {
    getAemetStatus().then(setEstado);
    fetch('/data/alerta_almassora.json')
      .then((res) => res.json())
      .then(setAlerta)
      .catch(() => setEstado('ERROR_API'));
  }, []);

  if (estado === 'ERROR_API') {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        ⚠️ Error al consultar datos oficiales de AEMET. No se puede verificar el estado para Almassora (771204).
      </div>
    );
  }

  if (!alerta || alerta.nivel === '—') {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
        ✅ No hay avisos meteorológicos activos para la subzona 771204<br />
        ⚠️ Confirmado por el agente IA: sin avisos naranja ni rojo válidos para esta subzona.
      </div>
    );
  }

  return (
    <div className="p-4 bg-orange-100 border-l-4 border-orange-400 text-orange-800">
      ⚠️ Aviso activo en Almassora (771204) · Nivel: {alerta.nivel.toUpperCase()}
    </div>
  );
};
