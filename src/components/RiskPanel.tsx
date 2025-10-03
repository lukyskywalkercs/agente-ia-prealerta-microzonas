import { useEffect, useState } from "react";

type Evaluacion = {
  subzona: string;
  nivel: "ALTO" | "MODERADO" | "BAJO";
  puntuacion: number;
  fenomeno_principal: string;
};

export default function RiskPanel() {
  const [riesgos, setRiesgos] = useState<Evaluacion[]>([]);
  const [status, setStatus] = useState<"CARGANDO" | "CON_RIESGO" | "SIN_RIESGO" | "ERROR_API">("CARGANDO");

  useEffect(() => {
    const loadRiesgos = async () => {
      try {
        const res = await fetch("/data/risk_eval.json", {
          headers: { "Cache-Control": "no-cache" },
        });

        const contentType = res.headers.get("Content-Type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error(`Respuesta no válida: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Estructura de datos incorrecta");
        }

        if (data.length === 0) {
          setStatus("SIN_RIESGO");
        } else {
          setRiesgos(data);
          setStatus("CON_RIESGO");
        }
      } catch (err) {
        console.error("❌ Error cargando evaluación de riesgo IA:", err);
        setStatus("ERROR_API");
      }
    };

    loadRiesgos();
  }, []);

  if (status === "CARGANDO") {
    return <p className="text-sm text-gray-500">Cargando evaluación de riesgo IA...</p>;
  }

  if (status === "ERROR_API") {
    return (
      <div className="text-red-600 font-semibold bg-red-100 p-4 rounded-md border border-red-300">
        ⚠️ No se ha podido obtener la evaluación de riesgo de la IA. 
        <br />Compruebe la conexión o el estado de los datos.
      </div>
    );
  }

  if (status === "SIN_RIESGO") {
    return (
      <div className="text-green-700 font-semibold bg-green-100 p-4 rounded-md border border-green-300">
        ✅ Evaluación IA: No hay riesgo meteorológico relevante detectado.
      </div>
    );
  }

  // status === "CON_RIESGO"
  return (
    <div className="space-y-4">
      {riesgos.map((r, index) => (
        <div
          key={index}
          className={`p-4 rounded-md shadow border-l-4 ${
            r.nivel === "ALTO"
              ? "border-red-600 bg-red-100 text-red-800"
              : r.nivel === "MODERADO"
              ? "border-orange-500 bg-orange-100 text-orange-900"
              : "border-green-500 bg-green-100 text-green-900"
          }`}
        >
          <p className="font-semibold">Subzona {r.subzona}</p>
          <p className="text-sm">
            Riesgo: <strong>{r.nivel}</strong> · IA Score: {r.puntuacion.toFixed(2)}
          </p>
          <p className="text-sm">Causa principal: {r.fenomeno_principal || "—"}</p>
          <p className="text-xs italic text-gray-500">* Evaluación generada automáticamente por IA (no oficial)</p>
        </div>
      ))}
    </div>
  );
}
