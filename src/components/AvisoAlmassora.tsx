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
}

const AvisoAlmassora: React.FC = () => {
  const [alerta, setAlerta] = useState<AlertaAlmassora | null>(null);
  const [fechaConsulta, setFechaConsulta] = useState<string>("");
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/data/alerta_almassora.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('El archivo recibido no es JSON');
        }

        const data = await res.json();

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setAlerta(data as AlertaAlmassora);
        } else {
          throw new Error('Contenido JSON inválido');
        }
      } catch (err: any) {
        console.warn('⚠️ Error cargando alerta Almassora:', err.message);
        setErrorCarga(err.message);
        setAlerta({
          activo: false,
          subzona: '771204',
          vigencia: { inicio: '', fin: '' },
          notas: ['No se pudo cargar el estado de la alerta. Intente más tarde.']
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

      {errorCarga && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 mb-4 text-sm rounded">
          ⚠️ Error cargando datos: {errorCarga}
        </div>
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
