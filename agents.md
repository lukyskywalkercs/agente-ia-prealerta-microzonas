# Agente IA · Lector de Avisos Meteorológicos AEMET

## 👤 Nombre del agente
Agente IA AEMET

---

## 🧠 Descripción funcional

Este agente autónomo consulta la API oficial de AEMET cada 10 minutos, descarga los avisos meteorológicos en formato `.tar.gz` (CAP/XML), los interpreta por subzonas, los clasifica en niveles de severidad (`NORMALIDAD`, `MEDIA`, `CRÍTICO`) y expone los datos de forma estructurada para otros sistemas y usuarios.

Se ha diseñado bajo principios de:

- Resiliencia ante errores o desconexiones
- Trazabilidad completa de datos procesados
- Separación de responsabilidades (cron / memoria / UI)
- Preparación para operar en red de múltiples agentes IA

---

## 🔄 Entradas automáticas

- API oficial de AEMET (áreas como 77, 61…)
- Archivos `.tar.gz` que contienen avisos XML con codificación CAP

---

## 🧩 Procesos del agente

- Descompresión automática del archivo TAR o GZIP
- Decodificación UTF-8 / ISO-8859-15
- Análisis del XML y extracción de eventos
- Clasificación por subzonas con nivel más severo consolidado
- Deduplicación exacta por clave (`subzona|evento|desde|hasta|nivel`)
- Memoria por subzona con cooldown entre cambios
- Detección de cambios entre ciclos
- Generación de archivo de interfaz para frontend (`agent_ui.json`)
- Logs y trazabilidad (`aemet_meta.json`)

---

## 📂 Archivos generados

|Archivo| Descripción técnica                                
| `aemet_avisos.json`            | Salida principal con todos los avisos activos por subzona                           |
| `aemet_meta.json`              | Trazabilidad de cada ciclo (timestamp, endpoint, errores, logs)                     |
| `agent_ui.json`                | Estado resumido del agente para frontend: nivel por zona, prealertas, historial     |
| `memory/state.json`            | Memoria por subzona para detectar cambios y aplicar cooldown                        |

---

## 🖥️ Interfaz esperada (UI)

La interfaz actual muestra:

- Panel de estado del agente (última ejecución, cambios, áreas con aviso)
- Zona visual por área (`Zona 77 - Comunidad Valenciana`)
- Colores según severidad (`NORMALIDAD`, `MEDIA`, `CRÍTICO`)
- Bloque de subzonas y número de avisos
- Detalle colapsable con avisos informativos (nivel verde)
- Flujo de actualización automática sin interacción manual

---

## ❗ Qué NO debe tocarse (⚠️ muy importante)

Este agente está altamente optimizado. Para evitar roturas:

1. **NO modificar la estructura de `aemet_avisos.json`**
   - El frontend depende de sus claves
   - Otros agentes podrían estar escuchando este JSON como entrada

2. **NO cambiar las rutas de archivos**
   - `public/data/aemet_avisos.json`
   - `public/data/agent_ui.json`
   - `agents/memory/state.json`

3. **NO eliminar deduplicación**
   - Garantiza que no se muestren avisos duplicados de AEMET

4. **NO usar IA generativa sin capa de control**
   - Este agente debe funcionar en modo "datos oficiales". Nada inventado.

5. **NO modificar sin comprobar `/healthz` y `/capabilities`**
   - Otros agentes podrían integrarse vía eventos o REST

---

## 🧠 Capacidades del agente

- Emite eventos tipo: `weather.alert.created`, `weather.alert.updated`
- Soporta endpoint `/healthz` (estado) y `/capabilities` (qué puede hacer)
- Prepara datos para interoperar con otros agentes

---

## 🔄 ¿Cómo escala a sistema multiagente?

Este agente está preparado para integrarse en arquitecturas más complejas mediante:

- **Eventos estándar CloudEvents** con JSON Schema
- **Bus de eventos** (Redis Streams, NATS, Kafka) para desacoplar publicación y consumo
- **Catálogo de agentes** (registro de agentes activos con `/agent/capabilities`)
- **Handshake entre agentes IA** (`/agent/handshake` con JWT firmado)
- **Mensajería desacoplada** → produce eventos que otros pueden suscribirse
- **Memoria contextual compartida** si es necesario

Con esto, puede colaborar con agentes IA de:

- Inundaciones (NDWI/Sentinel)
- Incendios forestales
- Salud pública
- Sismología
- Logística y transporte
- Notificación ciudadana

---

## ⚙️ Stack técnico

- **Backend**: Node.js, cron, tar-stream, xml2js, dotenv
- **Frontend**: React, TypeScript, TailwindCSS
- **Datos**: OpenData API de AEMET
- **Almacenamiento**: JSON plano, estructura pública
- **Preparado para contenedorización**

---

## 🔒 Seguridad

- `.env.local` con clave API de AEMET (no versionado)
- `.gitignore` configurado para proteger secretos y datos locales
- Sistema robusto: si falla la descarga o no hay datos, genera JSON vacío sin inventar

---

## 📦 Estructura esperada

.
├── backend/
│ └── cron-aemet.ts
├── agents/
│ ├── memory/state.json
│ ├── brain.ts
│ └── policies.yaml
├── public/data/
│ ├── aemet_avisos.json
│ ├── aemet_meta.json
│ └── agent_ui.json
├── src/components/
│ └── visualization/AvisosAEMET.tsx
├── .env.local
├── README.md
├── agents.md


---

## ✅ Estado actual

- Código funcional y validado
- Interfaz operativa con actualización en tiempo real
- Trazabilidad completa por archivo
- Memoria por subzona activa
- Detección de prealertas y consolidación por área
- Preparado para demo, integración o escalado

---

## 🗺️ Descubrimiento de subzonas

- El sistema mantiene una memoria estructurada de todas las subzonas que ha visto alguna vez activas.
- Esta memoria está en `agents/memory/known_subzones.json` y se actualiza automáticamente.
- El agente IA no debe inventar zonas nuevas por su cuenta, pero sí debe recordar las que ya ha procesado.
- Si una subzona no está en los avisos activos pero sí en la memoria, se considera **válida**.


## ✉️ Contacto

Desarrollado por: **Lucas Chabrera Querol**  
GitHub: [https://github.com/lukyskywalkercs](https://github.com/lukyskywalkercs)
