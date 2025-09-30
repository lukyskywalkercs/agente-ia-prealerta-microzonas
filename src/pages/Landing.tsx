import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="bg-nasa-gray min-h-screen text-nasa-black">
      {/* Título visible en fondo claro */}
      <header className="bg-nasa-gray py-12 border-b border-gray-300">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold tracking-wide text-nasa-blue">
            Agente IA de Emergencias
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-700">
            Sistema técnico de análisis meteorológico y riesgo microzonificado con datos oficiales de AEMET.
          </p>
        </div>
      </header>

      {/* Secciones funcionales */}
      <main className="container mx-auto px-6 py-16">
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-nasa-blue mb-8 border-b-2 border-nasa-red inline-block pb-2">
            Funcionalidades principales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Avisos AEMET */}
            <div className="card-nasa">
              <h3 className="text-xl font-bold text-nasa-blue mb-2">Avisos AEMET</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Visualiza los avisos oficiales emitidos por AEMET, con códigos de severidad y zona.
              </p>
              <Link to="/avisos" className="btn-primary">Ver avisos</Link>
            </div>

            {/* Evaluación IA */}
            <div className="card-nasa">
              <h3 className="text-xl font-bold text-nasa-blue mb-2">Evaluación IA</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Cálculo automático del riesgo en cada subzona usando métricas objetivas y trazables.
              </p>
              <Link to="/riesgo" className="btn-primary">Ver evaluación</Link>
            </div>

            {/* Microzona */}
            <div className="card-nasa">
              <h3 className="text-xl font-bold text-nasa-blue mb-2">Microzona 771204</h3>
              <p className="text-gray-700 mb-4 text-sm">
                Análisis geográfico de Almassora con centros vulnerables, caminos críticos y zonas PATRICOVA.
              </p>
              <Link to="/microzona-771204" className="btn-primary">Ver microzona</Link>
            </div>
          </div>
        </section>

        {/* Sobre el sistema */}
        <section>
          <h2 className="text-3xl font-semibold text-nasa-blue mb-8 border-b-2 border-nasa-red inline-block pb-2">
            Sobre el sistema
          </h2>

          <div className="card-nasa">
            <p className="text-gray-700 mb-6 text-sm">
              Este sistema combina fuentes oficiales como AEMET, normativa legal de la Comunidad Valenciana y cartografía de riesgo
              para generar alertas de preemergencia adaptadas a entornos urbanos, educativos y residenciales.
              Toda la información es analizada por módulos IA preparados para apoyar decisiones técnicas.
            </p>

            <Link to="/sobre" className="btn-primary">Más información</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-nasa-black text-nasa-gray text-sm text-center py-8 mt-16">
        <p>
          © {new Date().getFullYear()} Agente IA de Emergencias · Proyecto técnico basado en datos oficiales
        </p>
        <p className="mt-2">
          Consultar siempre con <span className="text-nasa-red font-bold">AEMET</span> o Protección Civil antes de tomar decisiones.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
