import React, { useState, useEffect } from 'react';

interface AlertaAlmassora {
  subzona: string;
  nivel: string;
  fenomeno: string;
  f_inicio: string;
  f_fin: string;
  centros_vulnerables: string[];
  caminos_criticos: string[];
  recomendacion: string;
  generado_en: string;
  activo: boolean;
}

interface CentroVulnerable {
  id: string;
  nombre: string;
  tipo: string;
  coordenadas: { lat: number; lon: number };
  direccion: string;
  vulnerabilidad: string;
  distancia_rio_millars: number;
  observaciones: string;
}

interface CaminoCritico {
  id: string;
  nombre: string;
  tipo: string;
  longitud_km: number;
  puntos_kilometricos: Array<{
    pk: number;
    coordenadas: { lat: number; lon: number };
    descripcion: string;
  }>;
  riesgo_inundacion: string;
  observaciones: string;
}

const AlmassoraPageSimple: React.FC = () => {
  const [alerta, setAlerta] = useState<AlertaAlmassora | null>(null);
  const [centros, setCentros] = useState<CentroVulnerable[]>([]);
  const [caminos, setCaminos] = useState<CaminoCritico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar alerta actual
        const alertaResponse = await fetch('/data/alerta_almassora.json');
        if (alertaResponse.ok) {
          const alertaData = await alertaResponse.json();
          setAlerta(alertaData);
        }

        // Cargar datos estáticos
        const centrosResponse = await fetch('/data/centros_vulnerables.json');
        if (centrosResponse.ok) {
          const centrosData = await centrosResponse.json();
          setCentros(centrosData.centros);
        }

        const caminosResponse = await fetch('/data/caminos_criticos.json');
        if (caminosResponse.ok) {
          const caminosData = await caminosResponse.json();
          setCaminos(caminosData.caminos);
        }

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
    
    // Actualizar cada 60 segundos
    const interval = setInterval(cargarDatos, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de Almassora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Almassora - Análisis Microzonificado</h1>
              <p className="text-gray-600 mt-1">Monitoreo en tiempo real de riesgos meteorológicos</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Última actualización: {alerta ? new Date(alerta.generado_en).toLocaleString() : 'N/A'}
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                alerta?.activo 
                  ? alerta.nivel === 'rojo' 
                    ? 'bg-red-100 text-red-800' 
                    : alerta.nivel === 'naranja'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {alerta?.activo ? `AVISO ${alerta.nivel.toUpperCase()}` : 'SIN AVISOS ACTIVOS'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Panel de información */}
          <div className="space-y-6">
            
            {/* Estado actual */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado Actual</h2>
              {alerta?.activo ? (
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Fenómeno:</span>
                    <p className="text-gray-900">{alerta.fenomeno}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Vigencia:</span>
                    <p className="text-sm text-gray-600">
                      {new Date(alerta.f_inicio).toLocaleString()} - {new Date(alerta.f_fin).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Recomendación:</span>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                      {alerta.recomendacion}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-green-500 text-4xl mb-2">✅</div>
                  <p className="text-gray-600">No hay avisos meteorológicos activos para Almassora</p>
                </div>
              )}
            </div>

            {/* Centros vulnerables afectados */}
            {alerta?.centros_vulnerables && alerta.centros_vulnerables.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Centros Afectados</h2>
                <div className="space-y-2">
                  {alerta.centros_vulnerables.map((centro, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">{centro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caminos críticos */}
            {alerta?.caminos_criticos && alerta.caminos_criticos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Caminos a Cerrar</h2>
                <div className="space-y-2">
                  {alerta.caminos_criticos.map((camino, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">{camino}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Panel de datos estáticos */}
          <div className="space-y-6">
            
            {/* Centros vulnerables */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Centros Vulnerables</h2>
              <div className="space-y-3">
                {centros.map((centro) => (
                  <div key={centro.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{centro.nombre}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        centro.vulnerabilidad === 'alta' ? 'bg-red-100 text-red-800' :
                        centro.vulnerabilidad === 'media' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {centro.vulnerabilidad}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{centro.direccion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Distancia al río: {centro.distancia_rio_millars}m
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Caminos críticos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Caminos Críticos</h2>
              <div className="space-y-3">
                {caminos.map((camino) => (
                  <div key={camino.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{camino.nombre}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        camino.riesgo_inundacion === 'alto' ? 'bg-red-100 text-red-800' :
                        camino.riesgo_inundacion === 'medio' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {camino.riesgo_inundacion}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Longitud: {camino.longitud_km}km
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PK: {camino.puntos_kilometricos.map(pk => pk.pk).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer explicativo */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Sistema de Análisis Microzonificado</h3>
            <p className="text-sm text-blue-800">
              Este agente IA monitoriza en tiempo real los avisos meteorológicos oficiales de AEMET en Almassora. 
              Detecta riesgos, cruza datos reales de infraestructuras vulnerables y zonas peligrosas, 
              y genera alertas específicas solo si un centro está realmente afectado (≤300m de zonas de riesgo).
            </p>
            <p className="text-xs text-blue-700 mt-2">
              <strong>No infiere ni simula.</strong> Solo trabaja con datos oficiales, mapas de riesgo y distancias geográficas reales. 
              Las alertas se actualizan automáticamente cada 60 minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlmassoraPageSimple;



