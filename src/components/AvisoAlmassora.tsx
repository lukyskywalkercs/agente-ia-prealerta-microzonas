import { useEffect, useState } from 'react';

interface AlertaAlmassora {
  activo: boolean;
  subzona: '771204';
  nivel?: 'naranja' | 'rojo';
  fenomenos?: string[];
  vigencia?: { inicio: string; fin: string };
  centros_afectados?: any[];
  caminos_afectados?: any[];
  zonas_riesgo_intersectadas?: any[];
  fuente: string;
  generated_at: string;
  notas?: string[];
}

export default function AvisoAlmassora() {
  const [alerta, setAlerta] = useState<AlertaAlmassora | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/alerta_almassora.json')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar alerta_almassora.json');
        return res.json();
      })
      .then(setAlerta)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!alerta) return <div className="text-gray-600">Cargando alerta meteorológica...</div>;

  const formatoFecha = (iso: string | undefined) =>
    iso ? new Date(iso).toLocaleString('es-ES') : 'No disponible';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-8">
      <h1 className="text-lg font-semibold text-gray-800 mb-3">
        Alerta meteorológica en Almassora
      </h1>

      {alerta.activo ? (
        <>
          <p className="mb-2 text-sm text-gray-700">
            <strong>Nivel:</strong>{' '}
            <span
              className={
                alerta.nivel === 'rojo' ? 'text-red-600 font-bold' : 'text-orange-500 font-bold'
              }
            >
              {alerta.nivel?.toUpperCase()}
            </span>
          </p>

          <p className="mb-2 text-sm text-gray-700">
            <strong>Fenómenos:</strong>{' '}
            {alerta.fenomenos?.length ? alerta.fenomenos.join(', ') : 'Sin especificar'}
          </p>

          <p className="mb-2 text-sm text-gray-700">
            <strong>Desde:</strong> {formatoFecha(alerta.vigencia?.inicio)}<br />
            <strong>Hasta:</strong> {formatoFecha(alerta.vigencia?.fin)}
          </p>

          <p className="mb-2 text-sm text-gray-700">
            <strong>Centros afectados:</strong> {alerta.centros_afectados?.length || 0}<br />
            <strong>Caminos afectados:</strong> {alerta.caminos_afectados?.length || 0}
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-700">No hay avisos meteorológicos activos para esta subzona.</p>
      )}

      <div className="mt-4 text-xs text-gray-500 border-t pt-2">
        Fuente: {alerta.fuente}<br />
        Generado: {formatoFecha(alerta.generated_at)}
        {alerta.notas?.length ? (
          <ul className="mt-1 list-disc list-inside">
            {alerta.notas.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

