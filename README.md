# 🌧️ Agente IA de Prealerta Meteorológica — Atención específica: Microzona 771204 (Almassora)

Sistema inteligente de vigilancia meteorológica conectado en tiempo real a los avisos oficiales de AEMET (formato CAP), que detecta, filtra y muestra los riesgos meteorológicos activos para la provincia de Castelló con seguimiento específico a la microzona 771204 (Almassora), basada en datos oficiales, sin simulaciones ni datos inventados.

---

## ⚙️ Arquitectura del sistema

- **Frontend:** React + Vite
- **Backend:** Functions serverless en Netlify (`cronAemet`, `cronAlmassora`)
- **Procesamiento de datos:**
  - Descarga real del XML CAP desde AEMET (área 77)
  - Parser CAP XML → `agent_ui.json`
  - Microzonificador por subzona → `alerta_almassora.json`
- **Datos oficiales:** AEMET OpenData (avisos meteorológicos CAP)
- **Panel informativo:** Muestra tarjetas estáticas (normativa, centros críticos, caminos, etc.) incluso si no hay avisos

---

## 🚀 ¿Cómo se activa el sistema?

El sistema **no requiere intervención manual**.

- Cada vez que alguien entra en la web, se ejecuta el cron automáticamente (`/.netlify/functions/cronAemet`)
- Se descargan los datos reales de AEMET
- Se procesan y se actualizan los ficheros visibles por el frontend:
  - `public/data/agent_ui.json` (avisos generales)
  - `public/data/alerta_almassora.json` (filtrado microzona 771204)

Si la clave de AEMET caduca o la API no responde, se muestra un aviso de error automático en toda la web.

---

## 📁 Estructura relevante

- public/data/*.json ← generado automáticamente
- src/components/AemetStatusBanner.tsx ← banner global
- src/components/AvisoAlmassora.tsx ← visor de microzona
- backend/cron-aemet.ts ← descarga y parseo
- agents/almassora/microzonificador.ts ← filtra subzona
- netlify/functions/cronAemet.ts ← activa desde tráfico
- vite.config.ts ← copia automática de los JSON

## 🛠 Instalación local (desarrollo)

git clone https://github.com/tu_usuario/agente-ia-prealerta-microzonas.git
cd agente-ia-prealerta-microzonas
npm install
npm run dev
Abre en http://localhost:5173

🧱 Build para producción

npm run build
Este comando:

Genera el frontend en dist/

Copia automáticamente los JSON desde public/data/ a dist/data/ gracias a vite-plugin-static-copy

☁️ Despliegue en Netlify

Conectado al repositorio GitHub

Build command: npm run build

Publish directory: dist

Functions directory: netlify/functions

Variable de entorno necesaria:

AEMET_API_KEY=TU_CLAVE_REAL
Netlify detectará cada git push y hará el deploy automático.

✅ Comprobación en producción
Asegúrate de que estas URLs devuelven JSON y no HTML:

https://tusitio.netlify.app/data/agent_ui.json
https://tusitio.netlify.app/data/alerta_almassora.json

🚨 Advertencias
El sistema no sustituye a los canales oficiales de AEMET, Protección Civil ni 112.

No se muestran datos si no hay avisos activos.

Todos los datos mostrados son reales, procesados automáticamente desde CAP XML oficial.

📄 Licencia
Este proyecto es de uso libre bajo licencia MIT, siempre que se respete el origen oficial de los datos (AEMET) y no se utilicen los avisos para decisiones críticas sin validación oficial.

✉️ Contacto
Autor: Lucas Chabrera Querol - lucas@lindinformatica.com - www.lindinformatica.com
Proyecto piloto de microzonificación meteorológica en Castellón — 2025