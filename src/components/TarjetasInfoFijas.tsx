// src/components/TarjetasInfoFijas.tsx
import React from 'react';

const TarjetasInfoFijas: React.FC = () => {
  const tarjetas = [
    {
      titulo: 'Normativa legal aplicable',
      contenido: `Ley 13/2010 de protección civil y gestión de emergencias de la Comunitat Valenciana.
Reglamento PATRICOVA.
Plan Especial frente al Riesgo de Inundaciones de la Generalitat (PEIN).`
    },
    {
      titulo: 'Zonas inundables oficiales (PATRICOVA)',
      contenido: `La microzona 771204 incluye tramos en riesgo medio y alto de inundación según el PATRICOVA.
Consultar visor oficial para más detalle.`,
    },
    {
      titulo: 'Centros críticos para alertar',
      contenido: `Incluyen colegios, centros de salud y residencias próximos a zonas inundables.
Requieren aviso prioritario y planificación de evacuación.`,
    },
    {
      titulo: 'Caminos rurales críticos',
      contenido: `Ejemplos: Camí la Mar, Camí Om Blanc, Vial accés Polígon Ramonet.
Suelen quedar intransitables durante lluvias intensas.`,
    },
    {
      titulo: 'Puntos de vigilancia reforzada',
      contenido: `Barranco de la Vila, pasos subterráneos CV-18, zonas deprimidas del casco urbano.
Supervisión preferente por Policía Local y Protección Civil.`,
    },
    {
      titulo: 'Rutas alternativas seguras',
      contenido: `Evite zonas de riesgo y utilice: CV-18, N-340 y caminos elevados al oeste del núcleo urbano.`,
    },
  ];

  return (
    <div className="grid gap-4">
      {tarjetas.map((t, i) => (
        <div key={i} className="bg-white shadow border-l-4 border-blue-900 p-4 rounded">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">{t.titulo}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{t.contenido}</p>
        </div>
      ))}
    </div>
  );
};

export default TarjetasInfoFijas;
