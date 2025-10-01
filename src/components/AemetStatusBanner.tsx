// src/components/AemetStatusBanner.tsx
import React, { useEffect, useState } from 'react';

const AemetStatusBanner: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/agent_ui.json', { cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.error && typeof data.message === 'string') {
          setErrorMsg(data.message);
        }
      })
      .catch(() => {
        setErrorMsg('No se pudo verificar el estado de los datos de AEMET.');
      });
  }, []);

  if (!errorMsg) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 text-sm text-center shadow-md z-50">
      ⚠️ <strong>Error al consultar datos oficiales de AEMET:</strong> {errorMsg}
    </div>
  );
};

export default AemetStatusBanner;
