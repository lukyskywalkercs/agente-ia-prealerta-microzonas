import React from 'react';
import AvisosAEMET from '../components/AvisosAEMET';

const AvisosPage: React.FC = () => {
  return (
    <div className="bg-white rounded shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">
        Avisos oficiales de AEMET por subzona
      </h2>
      <AvisosAEMET />
    </div>
  );
};

export default AvisosPage;
