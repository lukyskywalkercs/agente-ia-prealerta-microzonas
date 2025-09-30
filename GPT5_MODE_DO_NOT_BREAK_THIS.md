# GPT5_MODE_DO_NOT_BREAK_THIS.md

🚨 INSTRUCCIONES OBLIGATORIAS PARA CURSOR / IA AUTOMÁTICA

Este proyecto fue desarrollado con lógica de alto nivel validada por GPT‑5.  
Cualquier IA que intervenga (CURSOR, Copilot, Replit o similar) **debe respetar estrictamente esta lógica previa**.

---

## 🎯 Principios fundamentales
## 🧠 Subzonas

- Las subzonas no son fijas ni codificadas a mano.
- Se descubren al analizar los archivos XML de AEMET (CAP).
- El agente guarda cada subzona descubierta en `agents/memory/known_subzones.json`.
- Aunque una subzona no aparezca hoy en `aemet_avisos.json`, **puede volver a aparecer**.
- No se debe asumir que “no existe” una zona solo porque no tenga avisos activos ahora.

- Este agente trabaja exclusivamente con **datos oficiales de AEMET** (CAP/XML).
- Funciona en modo **truth-only** (sin alucinaciones, sin IA generativa).
- Todos los niveles de riesgo deben respetar la política:
  - `verde` → `NORMALIDAD`
  - `amarillo` → `MEDIA`
  - `naranja` → `MEDIA` (prealerta)
  - `rojo` → `CRÍTICO`
- No se permiten niveles inventados ni adaptaciones arbitrarias.

---

## 🛠️ Lo que NO se puede hacer

- ❌ No modificar estructuras de archivos como `aemet_avisos.json`, `agent_ui.json`, `aemet_meta.json`
- ❌ No eliminar lógica de deduplicación, memoria por subzona ni trazabilidad
- ❌ No modificar rutas de salida (`public/data/...`, `agents/memory/...`)
- ❌ No inventar zonas o códigos no presentes en `allowed_areas.json`
- ❌ No usar predicciones, inferencias ni LLM sin control

---

## 📌 Archivos clave del sistema

- `agents/policies.yaml`
- `agents/zones/allowed_areas.json`
- `agents/memory/state.json`
- `backend/cron-aemet.ts`
- `src/components/visualization/AvisosAEMET.tsx`
- `agents.md`

---

## ✅ En caso de duda

- No actuar
- No inventar
- No completar "por ayudar"
- Pedir confirmación al humano

Este agente IA ya funciona correctamente. El objetivo es **no romper nada.**
