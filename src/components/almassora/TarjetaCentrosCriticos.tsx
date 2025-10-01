import React from 'react';

const TarjetaCentrosCriticos: React.FC = () => (
  <div className="bg-white border rounded-lg p-4 shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">🏫 Centros críticos a alertar</h3>
    <p className="text-sm text-gray-700 mb-2">
      Centros que deben ser alertados incluso sin aviso meteorológico activo:
    </p>
    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
      <li>CEIP Regina Violant</li>
      <li>IES Álvaro Falomir</li>
      <li>Residencia Santa Rosa Molas</li>
      <li>Residencia Municipal de Almassora</li>
    </ul>
    <p className="text-xs text-gray-500 mt-2">
      Criterio basado en cercanía a zonas de riesgo y tipo de ocupantes.
    </p>
  </div>
);

export default TarjetaCentrosCriticos;