import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import TarjetasFijasAlmassora from '../components/almassora/TarjetasFijasAlmassora';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Alerta {
  activo: boolean;
  subzona: string;
  vigencia: { inicio: string; fin: string };
  fenomenos: string[];
  centros_afectados: any[];
  caminos_afectados: any[];
  zonas_riesgo_intersectadas: any[];
  fuente: string;
  generated_at: string;
  notas?: string[];
}

const formatDate = (iso?: string): string => {
  if (!iso || iso.trim() === '' || iso === 'Invalid Date') return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('es-ES');
};

const Microzona771204Page: React.FC = () => {
  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [zonasRiesgo, setZonasRiesgo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const centro: [number, number] = [39.9426, -0.0656];

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch('/data/alerta_almassora.json');
        if (res.ok) setAlerta(await res.json());

        const zonas = await fetch('/data/zonas_inundables_almassora.geojson');
        if (zonas.ok) setZonasRiesgo(await zonas.json());
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">📍 Microzona 771204 · Almassora</h1>

        {alerta?.generated_at && (
          <div className="mb-4 text-sm text-gray-600">
            <strong>Última descarga de avisos:</strong> {formatDate(alerta.generated_at)}
          </div>
        )}

        <div className="bg-white shadow border rounded p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {alerta?.activo
              ? `🟠 Alerta Activa · ${alerta.fenomenos?.join(', ') || 'Fenómeno no especificado'}`
              : '✅ No hay avisos meteorológicos activos para la subzona 771204'}
          </h2>

          {alerta?.activo && (
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Desde:</strong> {formatDate(alerta.vigencia?.inicio)}</p>
              <p><strong>Hasta:</strong> {formatDate(alerta.vigencia?.fin)}</p>
              <p><strong>Centros afectados:</strong> {alerta.centros_afectados?.length || 0}</p>
              <p><strong>Caminos afectados:</strong> {alerta.caminos_afectados?.length || 0}</p>
            </div>
          )}

          {!alerta?.activo && (
            <>
              <p className="text-green-700 text-sm mt-2">
                ⚠️ Confirmado por el agente IA: sin avisos naranja ni rojo válidos para esta subzona.
              </p>

              {/* Mostrar tarjetas fijas siempre que NO haya alerta */}
              <div className="mt-6">
                <TarjetasFijasAlmassora />
              </div>
            </>
          )}

          {Array.isArray(alerta?.notas) && alerta.notas.length > 0 && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 p-2 rounded text-sm text-yellow-800">
              {alerta.notas.map((n, i) => <p key={i}>⚠️ {n}</p>)}
            </div>
          )}
        </div>

        <div className="h-[500px] border rounded overflow-hidden">
          <MapContainer center={centro} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {alerta?.activo && (
              <Circle
                center={centro}
                radius={600}
                pathOptions={{
                  color: '#f97316',
                  fillColor: '#f97316',
                  fillOpacity: 0.25,
                  weight: 2,
                }}
              />
            )}

            {zonasRiesgo?.features?.map((zona: any, i: number) => {
              const tipo = zona?.geometry?.type;
              const coords = zona?.geometry?.coordinates;
              if (!tipo || !coords) return null;

              if (tipo === 'Polygon' && Array.isArray(coords[0])) {
                return (
                  <Polygon
                    key={`poly-${i}`}
                    positions={coords[0].map((c: number[]) => [c[1], c[0]])}
                    pathOptions={{ color: '#2563eb', weight: 2, opacity: 0.4, fillOpacity: 0.2 }}
                  >
                    <Popup>
                      <strong>{zona.properties?.nombre || 'Zona de riesgo'}</strong>
                    </Popup>
                  </Polygon>
                );
              }

              return null;
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Microzona771204Page;
