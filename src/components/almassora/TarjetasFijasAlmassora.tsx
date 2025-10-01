import React from 'react';

const TarjetasFijasAlmassora: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      
      <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-1">📜 Normativa Legal</h3>
        <p className="text-sm text-gray-700">
          Esta microzona se rige por el marco normativo del Plan Especial ante el Riesgo de Inundaciones
          (PATRICOVA) de la Generalitat Valenciana.
        </p>
      </div>

      <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-1">🌊 Zonas Inundables</h3>
        <p className="text-sm text-gray-700">
          El mapa superior muestra las zonas con peligro potencial de inundación en esta microzona,
          basadas en datos oficiales del visor cartográfico de la CHJ y PATRICOVA.
        </p>
      </div>

      <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-1">🏫 Centros Críticos</h3>
        <p className="text-sm text-gray-700">
          Aunque no hay avisos activos, se mantienen identificados centros educativos y residencias
          que deben ser alertados ante riesgo elevado.
        </p>
      </div>

      <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-1">🚧 Caminos Inundables</h3>
        <p className="text-sm text-gray-700">
          No se han detectado actualmente caminos cortados. Se recomienda revisar rutas alternativas en caso de activación.
        </p>
      </div>

      <div className="bg-white border border-blue-200 rounded p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 mb-1">👁️‍🗨️ Vigilancia Preventiva</h3>
        <p className="text-sm text-gray-700">
          Se mantiene vigilancia reforzada en puntos críticos si el nivel de aviso cambia a naranja o rojo.
        </p>
      </div>

    </div>
  );
};

export default TarjetasFijasAlmassora;