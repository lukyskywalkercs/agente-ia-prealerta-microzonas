# 🌪️ Agente IA AEMET · Sistema de Avisos Meteorológicos y Microzonas Inteligentes

> ⚠️ **ESTE NO ES UN SISTEMA OFICIAL**
> 🚫 **NO USAR EN EMERGENCIAS REALES**
> 🧪 Proyecto técnico desarrollado por **Lucas Chabrera Querol** ([@lukyskywalkercs](https://github.com/lukyskywalkercs))

---

## 🧠 ¿Qué es este sistema?

Este repositorio contiene una plataforma completa para procesar, analizar y visualizar **avisos meteorológicos reales** de AEMET, incluyendo:

- Un **agente IA lector de avisos AEMET** que descarga y analiza datos oficiales en formato CAP/XML.
- Un **agente IA microzonificador** específico para la subzona 771204 (Almassora), que detecta avisos críticos y lanza prealertas a infraestructuras vulnerables.
- Una interfaz visual avanzada para interpretar los riesgos por zona.

> Este proyecto NO es oficial. Se ofrece como demostración técnica de un sistema escalable de agentes IA para gestión de emergencias.

---

## 🎯 Objetivo

- Automatizar la descarga y análisis de avisos de AEMET (zona 77 y 69)
- Clasificar por subzona los niveles reales (verde/amarillo/naranja/rojo)
- Evaluar el riesgo de forma automática por zona (`NORMALIDAD`, `MEDIA`, `CRÍTICA`)
- Detectar avisos activos en microzonas como **Almassora**
- Avisar a **centros vulnerables** según criterios legales
- Mostrar todo en una **interfaz elegante, clara y auditable**

---

## ✅ Características del agente AEMET

- 🔁 Consulta cada 10 minutos la API oficial de AEMET
- 📦 Procesa `.tar.gz` → `.xml` (CAP/XML) con decodificación ISO‑8859‑15
- 🧠 Clasifica por subzonas: severidad, evento, fechas, fenómeno, área, comentarios
- 🛡️ Política de verdad: solo datos oficiales, sin IA generativa, sin inventar
- 🧾 Auditoría completa (`aemet_meta.json`, `agent_ui.json`)
- 💾 Memoria por subzona (`state.json`) con cooldown
- 🧮 Severidad consolidada por clave `subzona|evento|inicio|fin`
- 📍 Detección de zonas con avisos y actualizaciones
- 💡 Interfaz UI con colores por nivel y trazabilidad

---

## 📍 Microzonas: agente IA de Almassora

> Subzona AEMET 771204

Este subagente especializado analiza si existe un aviso **naranja o rojo** en la subzona de Almassora y:

- Busca centros vulnerables (colegios, residencias) cercanos a zonas inundables oficiales (PATRICOVA)
- Calcula distancias reales a cauces y zonas de riesgo
- Genera recomendaciones automáticas y específicas
- Crea un JSON de prealerta (`alerta_almassora.json`)
- Lo representa en un mapa Leaflet con capas técnicas

---

## 🖥️ Interfaz web

- **React + TailwindCSS** con diseño inspirado en la NASA
- Visualización de zonas con avisos por severidad
- Página especial `/almassora` con evaluación microzonificada
- Página `/sobre` con explicación del sistema, su IA y su autor
- Tabs tipo scrollspy, accesibles y exportables

---

## 🧱 Tecnologías utilizadas

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + tsx + cron + axios + fast-xml-parser
- **Datos**: OpenData AEMET (https://opendata.aemet.es/)
- **Formatos**: XML CAP + JSON

---

## 📂 Estructura del proyecto

```
/backend/cron-aemet.ts              → descarga y descomprime los avisos CAP/XML oficiales
/backend/parseCapXml.ts             → parser real del formato CAP
/public/data/agent_ui.json          → interfaz del agente principal (avisos por zona)
/public/data/alerta_almassora.json  → resultado microzonificado (subzona 771204)
/src/pages/AlmassoraPage.tsx        → interfaz microzonificada
/src/pages/Sobre.tsx                → documentación visual del sistema y su IA
/scripts/geocode_simple.ts          → geolocaliza centros a partir de CSV
/agents/almassora/microzonificador.ts → lógica del agente IA microzonificado
```

---

## 🚫 ¿Qué NO es este proyecto?

- No es un sistema oficial
- No usa IA generativa para evaluar riesgos
- No está certificado por Protección Civil ni AEMET
- No debe usarse para tomar decisiones reales

---

## 🧠 ¿Por qué se considera agente IA?

- Toma decisiones automáticas basadas en condiciones reales
- Tiene memoria, lógica de actualización, deduplicación y evaluación
- Puede interoperar con otros agentes (sismos, incendios, salud pública)
- Su diseño sigue la arquitectura de agentes autónomos escalables

---

## 📤 Contacto del autor

Desarrollado por: **Lucas Chabrera Querol**  
📧 lucas@lindinformatica.com  
🌐 [www.lindinformatica.com](https://www.lindinformatica.com)  
🐙 GitHub: [@lukyskywalkercs](https://github.com/lukyskywalkercs)

---

## 📖 Licencia

MIT © Lucas Chabrera Querol  
Distribuido solo con fines educativos. No usar en emergencias reales.