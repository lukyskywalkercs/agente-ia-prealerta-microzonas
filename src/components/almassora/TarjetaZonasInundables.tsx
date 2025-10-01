import React from 'react';

const TarjetaZonasInundables: React.FC = () => (
  <div className="bg-white border rounded-lg p-4 shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">🌊 Zonas inundables identificadas</h3>
    <p className="text-sm text-gray-700 mb-2">
      Se han cartografiado más de 10 zonas con riesgo de inundación, incluyendo:
    </p>
    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
      <li>Ribera del río Millars</li>
      <li>Barranco Om Blanc</li>
      <li>Cauce del Barranquet</li>
      <li>Área industrial Ramonet - Sector SUR</li>
    </ul>
    <p className="text-xs text-gray-500 mt-2">
      Fuente: PATRICOVA, cartografía municipal y registros históricos.
    </p>
  </div>
);

export default TarjetaZonasInundables;