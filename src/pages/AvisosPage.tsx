import React from 'react';
import { AvisosAEMET } from '../components/AvisosAEMET';

const AvisosPage: React.FC = () => {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Avisos meteorológicos</h1>
      <AvisosAEMET />
    </main>
  );
};

export default AvisosPage;
