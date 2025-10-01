// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import AemetStatusBanner from './components/AemetStatusBanner';

import Landing from './pages/Landing';
import AvisosPage from './pages/AvisosPage';
import RiesgoPage from './pages/RiesgoPage';
import SobrePage from './pages/SobrePage';
import Microzona771204Page from './pages/Microzona771204Page';

const App: React.FC = () => {
  // 🔁 Lanza el cron de AEMET al abrir la web
  useEffect(() => {
    fetch('/.netlify/functions/cronAemet', { method: 'POST' })
      .then((res) => res.ok && console.log('✅ Cron AEMET activado'))
      .catch(() => console.warn('⚠️ No se pudo lanzar el cron AEMET'));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        {/* ⚠️ Muestra errores de AEMET si existen */}
        <AemetStatusBanner />

        <Navbar />

        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/avisos" element={<AvisosPage />} />
            <Route path="/riesgo" element={<RiesgoPage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/microzona-771204" element={<Microzona771204Page />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
