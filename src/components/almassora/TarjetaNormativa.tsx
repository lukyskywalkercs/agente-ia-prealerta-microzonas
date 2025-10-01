import React from 'react';

const TarjetaNormativa: React.FC = () => (
  <div className="bg-white border rounded-lg p-4 shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Normativa legal aplicable</h3>
    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
      <li>Decreto 30/2015 de Emergencias de la Comunitat Valenciana</li>
      <li>PATRICOVA - Plan de Acción Territorial frente a Inundaciones</li>
      <li>Directrices del Sistema Nacional de Protección Civil</li>
      <li>Orden 3/2019 sobre planes de autoprotección en centros educativos</li>
    </ul>
  </div>
);

export default TarjetaNormativa;