import React from 'react';

const TarjetaCaminosCriticos: React.FC = () => (
  <div className="bg-white border rounded-lg p-4 shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">🚧 Caminos rurales críticos</h3>
    <p className="text-sm text-gray-700 mb-2">
      Estos caminos presentan riesgo de quedar anegados:
    </p>
    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
      <li>Camí Om Blanc</li>
      <li>Camí Benafelí</li>
      <li>Acceso Sur por Ramonet</li>
    </ul>
    <p className="text-xs text-gray-500 mt-2">
      Verificados por registros de emergencias previas.
    </p>
  </div>
);

export default TarjetaCaminosCriticos;