import React from 'react';

const TarjetaRutasAlternativas: React.FC = () => (
  <div className="bg-white border rounded-lg p-4 shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">🛣️ Rutas alternativas seguras</h3>
    <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
      <li>CV-18 acceso Castelló por vial norte</li>
      <li>Camí la Mar en zona NO industrial</li>
      <li>Salida por carretera Betxí - Vila-real</li>
    </ul>
    <p className="text-xs text-gray-500 mt-2">
      Útiles en caso de corte en zonas inundables.
    </p>
  </div>
);

export default TarjetaRutasAlternativas;