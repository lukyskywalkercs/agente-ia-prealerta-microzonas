import React from 'react';

const TarjetaVigilanciaReforzada: React.FC = () => (
  <div className="bg-white border rounded-lg p-4 shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">👮‍♂️ Vigilancia reforzada</h3>
    <p className="text-sm text-gray-700 mb-1">
      Aunque no haya aviso, se mantiene patrullaje en:
    </p>
    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
      <li>Zona del río Millars</li>
      <li>Polígono Ramonet</li>
      <li>Colegios con riesgo de acceso dificultado</li>
    </ul>
    <p className="text-xs text-gray-500 mt-2">
      Según protocolo de vigilancia preventiva de Protección Civil.
    </p>
  </div>
);

export default TarjetaVigilanciaReforzada;