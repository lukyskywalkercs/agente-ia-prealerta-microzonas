import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';

import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import AvisosPage from './pages/AvisosPage';
import RiesgoPage from './pages/RiesgoPage';
import SobrePage from './pages/SobrePage';
import Microzona771204Page from './pages/Microzona771204Page';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900">
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
