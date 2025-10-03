import { useEffect, useState } from "react";

type Aviso = {
  subzona: string;
  areaDesc: string;
  fenomeno: string;
  nivel: "amarillo" | "naranja" | "rojo";
  nivel_num: "MEDIA" | "ALTA" | "CRÍTICA";
  f_inicio: string;
  f_fin: string;
};

export default function AvisosAEMET() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [status, setStatus] = useState<"CARGANDO" | "CON_AVISOS" | "SIN_AVISOS" | "ERROR_API">("CARGANDO");

  useEffect(() => {
    const loadAvisos = async () => {
      try {
        const res = await fetch("/data/agent_ui.json", {
          headers: { "Cache-Control": "no-cache" },
        });

        const contentType = res.headers.get("Content-Type");
        if (!res.ok || !contentType?.includes("application/json")) {
          throw new Error(`Respuesta no válida de la API: ${res.status} (${contentType})`);
        }

        const data = await res.json();

        if (!data || !Array.isArray(data.avisos)) {
          throw new Error("Formato de datos inesperado o corrupto");
        }

        if (data.avisos.length === 0) {
          setStatus("SIN_AVISOS");
        } else {
          setAvisos(data.avisos);
          setStatus("CON_AVISOS");
        }
      } catch (err) {
        console.error("❌ Error cargando avisos AEMET:", err);
        setStatus("ERROR_API");
      }
    };

    loadAvisos();
  }, []);

  if (status === "CARGANDO") {
    return <p className="text-sm text-gray-500">Cargando avisos meteorológicos...</p>;
  }

  if (status === "ERROR_API") {
    return (
      <div className="text-red-600 font-semibold bg-red-100 p-4 rounded-md border border-red-300">
        ⚠️ No se ha podido conectar con la API oficial de AEMET o ha devuelto un error inesperado.
        <br />
        Por favor, vuelva a intentarlo más tarde.
      </div>
    );
  }

  if (status === "SIN_AVISOS") {
    return (
      <div className="text-green-700 font-semibold bg-green-100 p-4 rounded-md border border-green-300">
        ✅ No hay avisos meteorológicos activos en estos momentos.
      </div>
    );
  }

  // status === "CON_AVISOS"
  return (
    <div className="space-y-4">
      {avisos.map((aviso, index) => (
        <div
          key={index}
          className={`p-4 rounded-md shadow border-l-4 ${
            aviso.nivel === "rojo"
              ? "border-red-600 bg-red-100 text-red-800"
              : aviso.nivel === "naranja"
              ? "border-orange-500 bg-orange-100 text-orange-900"
              : "border-yellow-500 bg-yellow-100 text-yellow-900"
          }`}
        >
          <p className="font-semibold">
            {aviso.areaDesc} — {aviso.fenomeno}
          </p>
          <p className="text-sm">
            Nivel: <strong>{aviso.nivel.toUpperCase()}</strong> ({aviso.nivel_num})
          </p>
          <p className="text-sm">
            Vigente: {new Date(aviso.f_inicio).toLocaleString()} →{" "}
            {new Date(aviso.f_fin).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
