import React, { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

const sections = [
  { id: 'que-es', title: '¿Qué es un agente IA?' },
  { id: 'como-se-desarrolla', title: '¿Cómo se desarrolla?' },
  { id: 'facilita', title: '¿Qué facilita en emergencias?' },
  { id: 'ejemplo', title: 'Ejemplo práctico: Almassora' },
  { id: 'colaboracion', title: 'Colaboración y red de agentes' },
  { id: 'autor', title: 'Autor y contacto' },
];

const Sobre: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { threshold: 0.4, rootMargin: '0px 0px -40% 0px' }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const exportPDF = () => {
    if (contentRef.current) {
      html2pdf()
        .set({ filename: 'AgenteIA_Sobre.pdf', margin: 10 })
        .from(contentRef.current)
        .save();
    }
  };

  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      <header className="bg-[#0b3d91] text-white py-14 shadow">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold">Agente IA de Emergencias</h1>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Arquitectura técnica con IA al servicio de la prevención meteorológica microzonificada.
          </p>
          <button
            onClick={exportPDF}
            className="mt-6 bg-white text-[#0b3d91] font-semibold px-4 py-2 rounded shadow hover:bg-blue-50"
          >
            Descargar resumen en PDF
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto px-6 py-12 gap-12">
        <nav className="md:w-1/4 hidden md:block sticky top-24 self-start">
          <ul className="space-y-4 text-sm text-[#0b3d91]">
            {sections.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={`block px-2 py-1 rounded hover:underline ${
                    activeId === sec.id ? 'active-scrollspy' : ''
                  }`}
                >
                  {sec.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="md:w-3/4 space-y-24" ref={contentRef}>
          <section id="que-es">
            <h2 className="text-2xl font-bold mb-4">¿Qué es un agente IA?</h2>
            <p className="text-gray-700 text-justify">
              Un agente IA es un componente de software diseñado para actuar de forma autónoma ante eventos definidos. En
              el ámbito de emergencias, su función principal es filtrar información oficial, extraer lo relevante y
              generar respuestas útiles para ayudar en la toma de decisiones críticas.
            </p>
          </section>
          <section id="estructura-agente" className="pt-12">
  <h2 className="text-2xl font-bold mb-4">¿Por qué este sistema se considera un agente de inteligencia artificial?</h2>
  <p className="text-gray-700 text-justify mb-4">
    Este sistema no es una IA general, ni un chatbot, ni una red neuronal predictiva. Se trata de un agente autónomo con comportamiento inteligente aplicado a emergencias meteorológicas, basado en datos oficiales, reglas legales y lógica geográfica. Su arquitectura cumple los principios fundamentales de un agente IA:
  </p>

  <ul className="list-disc ml-6 text-gray-700 space-y-2">
    <li><strong>Percepción:</strong> interpreta avisos oficiales en formato CAP/XML de AEMET.</li>
    <li><strong>Razonamiento:</strong> cruza esos datos con cartografía, coordenadas de centros vulnerables y normativa legal.</li>
    <li><strong>Acción:</strong> genera recomendaciones en lenguaje natural y activa alertas en la interfaz.</li>
  </ul>

  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 space-y-2">
    <p><strong>¿Dónde entra la inteligencia artificial?</strong></p>
    <ul className="list-disc ml-4 space-y-1">
      <li>Procesamiento semántico de eventos descritos en lenguaje natural (tormentas, lluvias intensas, etc.)</li>
      <li>Evaluación automática del riesgo por subzona usando reglas inteligentes y fórmulas geográficas.</li>
      <li>Identificación autónoma de centros críticos afectados por fenómenos meteorológicos.</li>
      <li>Generación contextual de alertas y recomendaciones interpretables por humanos.</li>
    </ul>
  </div>

  <p className="text-gray-700 mt-6">
    Aunque este agente no usa modelos de IA generativa ni aprendizaje automático, sí actúa como un sistema experto
    **que razona y decide de forma autónoma** a partir de múltiples fuentes cruzadas. Cumple por tanto la definición operativa
    de un <strong>agente IA aplicado a la toma de decisiones en emergencias</strong>.
  </p>
</section>

          <section id="como-se-desarrolla">
            <h2 className="text-2xl font-bold mb-4">¿Cómo se desarrolla?</h2>
            <p className="text-gray-700 text-justify">
              Se programa un sistema que se conecta a fuentes oficiales (como AEMET, IGN, Protección Civil), descarga
              datos reales en tiempo real, los procesa mediante lógica definida (y eventualmente IA), y muestra los
              resultados en un frontend accesible. Todo el código está optimizado para alta fiabilidad y mínimo
              mantenimiento.
            </p>
          </section>

          <section id="facilita">
            <h2 className="text-2xl font-bold mb-4">¿Qué facilita en emergencias?</h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Monitorización automatizada de riesgos meteorológicos.</li>
              <li>Evaluación objetiva de zonas críticas mediante IA.</li>
              <li>Detección temprana de centros vulnerables afectados.</li>
              <li>Paneles visuales para rápida interpretación por personal técnico.</li>
              <li>Exportación de alertas y datos para documentación oficial.</li>
            </ul>
          </section>
          <section id="uso-ia">
  <h2 className="text-2xl font-bold mb-4">¿Dónde interviene la inteligencia artificial?</h2>
  <p className="text-gray-700 text-justify mb-4">
    Este sistema no es una simple automatización. Utiliza técnicas de inteligencia artificial en distintas fases del flujo de análisis:
  </p>

  <ul className="list-disc ml-6 text-gray-700 space-y-2">
    <li>
      <strong>Procesamiento semántico de alertas CAP (XML):</strong> El sistema interpreta lenguaje natural en descripciones
      de riesgo, eventos y zonas afectadas, usando modelos lingüísticos para categorizar fenómenos (ej. tormentas, lluvias
      intensas, etc.) y estimar su severidad.
    </li>
    <li>
      <strong>Evaluación de riesgo por subzona:</strong> Un agente IA analiza automáticamente los avisos activos y calcula
      un <em>riesgo ponderado</em> para cada subzona, en base a criterios de severidad, duración, y coincidencia con
      infraestructuras críticas. Este score se actualiza en tiempo real y se refleja visualmente.
    </li>
    <li>
      <strong>Detección de centros vulnerables afectados:</strong> El sistema cruza coordenadas geográficas con zonas de riesgo
      (GeoJSON PATRICOVA) y aplica algoritmos de distancia (Haversine) para detectar automáticamente qué colegios,
      residencias o caminos deben ser notificados.
    </li>
    <li>
      <strong>Recomendaciones IA:</strong> El agente es capaz de generar recomendaciones legales o logísticas en lenguaje natural
      (cerrar caminos, evacuar centros, activar planes municipales) basadas en los datos reales y reglas extraídas de la
      normativa vigente (Decreto 30/2015, PATRICOVA...).
    </li>
  </ul>

  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
    Este agente IA no predice el clima, sino que actúa como <strong>asistente autónomo para interpretar, analizar y
    recomendar acciones</strong> ante riesgos meteorológicos ya detectados oficialmente.
  </div>
</section>
<p className="text-gray-700 mt-4">
  Este proceso de cruce, evaluación y generación de recomendaciones se ejecuta <strong>de forma completamente automática</strong>,
  sin intervención humana, y representa un caso real de IA asistencial para la toma de decisiones en microzonas de riesgo.
</p>

          <section id="ejemplo">
            <h2 className="text-2xl font-bold mb-4">Ejemplo práctico: Almassora</h2>
            <p className="text-gray-700 text-justify mb-4">
              En el caso de Almassora (Castellón), el agente descarga automáticamente los avisos meteorológicos reales
              de la subzona 771204. Si se detecta un aviso naranja o rojo:
            </p>
            <ul className="list-decimal ml-6 text-gray-700 space-y-2">
              <li>Cruza el aviso con zonas de riesgo de inundación (PATRICOVA, cauces).</li>
              <li>Calcula qué colegios o caminos rurales están en riesgo.</li>
              <li>Genera un JSON con recomendaciones específicas para autoridades.</li>
              <li>Todo esto se actualiza cada hora de forma automática.</li>
            </ul>
          </section>
          <section id="colaboracion-agentes" className="pt-12">
  <h2 className="text-2xl font-bold mb-4">Colaboración entre agentes IA</h2>
  <p className="text-gray-700 text-justify mb-4">
    Este agente no está diseñado para trabajar de forma aislada. Forma parte de una red potencial de agentes IA que pueden
    colaborar entre sí mediante flujos estructurados de información. Cada agente puede especializarse en un ámbito — meteorología,
    logística, transporte, atención sanitaria, evacuación, etc. — y comunicarse con otros para mejorar la toma de decisiones.
  </p>

  <h3 className="text-lg font-semibold text-gray-800 mb-2">🔄 Ejemplo de integración sanitaria</h3>
  <p className="text-gray-700 text-justify mb-4">
    Ante una alerta meteorológica naranja o roja detectada en una zona con hospitales, residencias o infraestructuras críticas,
    este agente IA puede generar una recomendación dirigida a un <strong>agente IA hospitalario</strong>, indicando la necesidad de:
  </p>

  <ul className="list-disc ml-6 text-gray-700 space-y-2">
    <li>Verificar disponibilidad de quirófanos o camas para pacientes potencialmente afectados.</li>
    <li>Prealertar a servicios médicos y equipos de emergencia.</li>
    <li>Gestionar derivaciones en caso de cortes de acceso o evacuaciones.</li>
    <li>Priorizar recursos en función de la exposición de centros a zonas de alto riesgo.</li>
  </ul>

  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
    Este tipo de colaboración se realizaría mediante protocolos seguros, respetando en todo momento la <strong>confidencialidad
    médica y la normativa de protección de datos (LOPD, GDPR)</strong>. El sistema no accede directamente a datos clínicos, pero
    puede desencadenar flujos de alerta hacia sistemas autorizados.
  </div>

  <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">🌐 Hacia una red de agentes IA interoperables</h3>
  <p className="text-gray-700 text-justify mb-4">
    Esta arquitectura modular permite construir <strong>sistemas distribuidos de asistencia a la emergencia</strong>,
    donde cada agente opera con autonomía, pero comparte objetivos comunes:
  </p>

  <ul className="list-disc ml-6 text-gray-700 space-y-2">
    <li>Reducir tiempos de respuesta.</li>
    <li>Disminuir carga cognitiva sobre humanos responsables.</li>
    <li>Priorizar alertas relevantes.</li>
    <li>Facilitar decisiones justificadas basadas en datos reales.</li>
  </ul>

  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
    La IA no sustituye al personal técnico ni médico, pero lo <strong>asiste con información verificada, análisis cruzado
    y recomendaciones contextualizadas</strong>. Este proyecto representa un primer paso hacia una gestión de emergencias
    apoyada por agentes autónomos y coordinados.
  </div>
</section>


          <section id="autor">
            <h2 className="text-2xl font-bold mb-4">Autor y contacto</h2>
            <p className="text-gray-700">
              Desarrollado por <strong>Lucas Chabrera Querol</strong>, técnico en sistemas, desarrollador de agentes IA
              aplicados al ámbito de emergencias, salud, agricultura y más. 
            </p>
            <ul className="mt-4 text-sm text-blue-700 underline space-y-1">
              <li>
                📧 <a href="mailto:lucas@lindinformatica.com" target="_blank">lucas@lindinformatica.com</a>
              </li>
              <li>
                🌐 <a href="https://www.lindinformatica.com" target="_blank">www.lindinformatica.com</a>
              </li>
              <li>
                💻 <a href="https://github.com/lindinformatica" target="_blank">github.com/lindinformatica</a>
              </li>
            </ul>
          </section>

          <section id="legal">
            <h2 className="text-2xl font-bold mb-4">Proyección y legalidad</h2>
            <p className="text-gray-700">
              Este agente cumple con el objetivo de <strong>automatizar tareas repetitivas</strong> bajo criterios
              oficiales (CAP AEMET, PATRICOVA, planes municipales), sin interferir en decisiones humanas. El objetivo no
              es sustituir a nadie, sino ofrecer herramientas que garanticen decisiones más informadas y mejor
              documentadas.
            </p>
            <p className="mt-4 text-sm text-gray-500 italic">
              * Este sistema no sustituye la autoridad de AEMET, Protección Civil o Policía Local.
            </p>
          </section>
        </main>
      </div>

      <footer className="bg-[#0b3d91] text-white text-center py-6 mt-12">
        <p>© {new Date().getFullYear()} Lucas Chabrera Querol · Agente IA de Emergencias</p>
      </footer>
    </div>
  );
};

export default Sobre;
