import React, { useEffect, useState } from 'react';

interface Aviso {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  nivel: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  nivel_num: 'NORMAL' | 'MEDIA' | 'CRÍTICA';
  f_inicio: string;
  f_fin: string;
}

const AvisosAEMET: React.FC = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAvisos = async () => {
      try {
        const response = await fetch('/data/agent_ui.json');
        const data = await response.json();
        setAvisos(data);
      } catch (error) {
        console.error('Error cargando avisos AEMET:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvisos();
    const interval = setInterval(loadAvisos, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const zonaFromSubzona = (subzona: string) => subzona.slice(0, 2);
  const avisosPorZona: Record<string, Aviso[]> = {};

  avisos.forEach((aviso) => {
    const zona = zonaFromSubzona(aviso.subzona);
    if (!avisosPorZona[zona]) avisosPorZona[zona] = [];
    avisosPorZona[zona].push(aviso);
  });

  const getColorClass = (nivel: string) => {
    switch (nivel) {
      case 'rojo': return 'bg-red-50 border-red-200 text-red-900';
      case 'naranja': return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'amarillo': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default: return 'bg-green-50 border-green-200 text-green-900';
    }
  };

  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case 'rojo': return 'bg-red-100 text-red-800 border-red-300';
      case 'naranja': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'amarillo': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getEtiquetaNivel = (nivel: string) => {
    switch (nivel) {
      case 'rojo': return 'CRÍTICO';
      case 'naranja': return 'IMPORTANTE';
      case 'amarillo': return 'MEDIO';
      default: return 'NORMAL';
    }
  };

  const nivelPrioridad = { rojo: 4, naranja: 3, amarillo: 2, verde: 1 };

  const zonas = Object.keys(avisosPorZona).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando avisos AEMET...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">📊</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Avisos AEMET</h1>
                  <p className="text-gray-600 mt-1">Avisos meteorológicos oficiales por subzona</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3">
                <div className="text-sm text-blue-700 font-medium">
                  {avisos.length} avisos activos
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Actualizado en tiempo real
                </div>
              </div>
            </div>
          </div>

          {/* Grid de zonas */}
          {zonas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin avisos activos</h3>
              <p className="text-gray-600">No hay avisos meteorológicos destacables en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {zonas.map((zona) => {
                const avisosZona = avisosPorZona[zona];
                const avisosRelevantes = avisosZona.filter((a) => a.nivel !== 'verde');

                return (
                  <div key={zona} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header de zona */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Zona {zona}</h3>
                        <div className="bg-white rounded-lg px-3 py-1 border border-gray-200">
                          <span className="text-sm font-medium text-gray-600">{avisosRelevantes.length} avisos</span>
                        </div>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6">
                      {avisosRelevantes.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-green-600 text-xl">✅</span>
                          </div>
                          <p className="text-gray-600 font-medium">Sin avisos destacables</p>
                          <p className="text-sm text-gray-500 mt-1">Situación meteorológica normal</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Array.from(new Set(avisosRelevantes.map((a) => a.subzona))).map((subzona) => {
                            const avisosSub = avisosRelevantes.filter((a) => a.subzona === subzona);
                            const maxAviso = avisosSub.reduce((prev, curr) =>
                              nivelPrioridad[curr.nivel] > nivelPrioridad[prev.nivel] ? curr : prev
                            );

                            return (
                              <div key={subzona} className={`rounded-xl border-2 p-4 ${getColorClass(maxAviso.nivel)}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-sm">Subzona {subzona}</span>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getNivelBadge(maxAviso.nivel)}`}>
                                      {getEtiquetaNivel(maxAviso.nivel)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <p className="font-medium text-sm">{maxAviso.fenomeno}</p>
                                  <p className="text-xs opacity-75">{maxAviso.areaDesc}</p>
                                  <div className="text-xs opacity-75">
                                    <span className="font-medium">Vigencia:</span><br />
                                    {new Date(maxAviso.f_inicio).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} - {new Date(maxAviso.f_fin).toLocaleString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer informativo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Información sobre los avisos</h4>
                  <p className="text-sm text-blue-800">
                    Los avisos mostrados son datos oficiales de la Agencia Estatal de Meteorología (AEMET). 
                    Se actualizan automáticamente cada 60 minutos desde las fuentes oficiales.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AvisosAEMET;