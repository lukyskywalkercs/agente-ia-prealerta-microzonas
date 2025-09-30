import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-blue-600 font-semibold border-b-2 border-blue-600 px-2 py-1'
      : 'text-gray-600 hover:text-blue-600 px-2 py-1';

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-lg font-bold text-gray-800">⚡ Agente IA Emergencias</div>
        <div className="flex space-x-4 text-sm">
          <NavLink to="/" className={linkClass}>Inicio</NavLink>
          <NavLink to="/avisos" className={linkClass}>Avisos AEMET</NavLink>
          <NavLink to="/riesgo" className={linkClass}>Evaluación IA</NavLink>
          <NavLink to="/microzona-771204" className={linkClass}>Microzona 771204</NavLink>
          <NavLink to="/sobre" className={linkClass}>Sobre el Proyecto</NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
