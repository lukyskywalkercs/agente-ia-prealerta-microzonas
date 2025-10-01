import React, { useEffect, useState } from 'react';
import TarjetasFijasAlmassora from './almassora/TarjetasFijasAlmassora';

type Vigencia = { inicio: string; fin: string };

interface AlertaAlmassora {
  activo: boolean;
  subzona: string;
  nivel?: string;
  fenomenos?: string[];
  descripcion?: string;
  vigencia: Vigencia;
  notas?: string[];
  generated_at?: string;
}

const AvisoAlmassora: React.FC = () => {
  const [alerta, setAlerta] = useState<AlertaAlmassora | null>(null);
  const [fechaConsulta, setFechaConsulta] = useState<string>("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/.netlify/functions/cronAemet', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data?.alerta_almassora) {
          setAlerta(data.alerta_almassora as AlertaAlmassora);
        } else {
          setAlerta({
            activo: false,
            subzona: '771204',
            vigencia: { inicio: '', fin: '' },
            notas: ['No se recibió información de alerta para esta microzona.']
          });
        }
      } catch {
        setAlerta({
          activo: false,
          subzona: '771204',
          vigencia: { inicio: '', fin: '' },
          notas: ['Error al consultar el servicio de avisos.']
        });
      } finally {
        setFechaConsulta(new Date().toLocaleString('es-ES'));
      }
    };
    cargar();
  }, []);

  const renderAlertaActiva = () => {
    if (!alerta) return null;

    const color =
      alerta.nivel === 'rojo' ? '#e02424' :
      alerta.nivel === 'naranja' ? '#f97316' :
      alerta.nivel === 'amarillo' ? '#eab308' :
      '#2563eb';

    return (
      <div className="space-y-4">
        {(alerta.fenomenos?.length ? alerta.fenomenos : ['Aviso activo']).map((fen, i) => (
          <div key={i} className="border-l-4 p-4 shadow rounded bg-white" style={{ borderColor: color }}>
            <p className="text-lg font-semibold">{fen}</p>
            <p className="text-sm text-gray-600">
              Desde: {alerta.vigencia?.inicio || '—'} | Hasta: {alerta.vigencia?.fin || '—'}
            </p>
            {alerta.descripcion && <p className="text-sm mt-2">{alerta.descripcion}</p>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Microzona 771204 — Almassora</h1>

      {fechaConsulta && (
        <p className="text-sm text-gray-600 mb-4">Última consulta: {fechaConsulta}</p>
      )}

      {alerta?.activo ? (
        renderAlertaActiva()
      ) : (
        <>
          <p className="text-green-700 font-medium mb-4">
            ✅ No hay avisos activos para esta microzona.
          </p>
          <TarjetasFijasAlmassora />
        </>
      )}
    </div>
  );
};

export default AvisoAlmassora;
