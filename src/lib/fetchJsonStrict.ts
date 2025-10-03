// src/lib/fetchJsonStrict.ts
export async function fetchJsonStrict<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, { cache: 'no-store' })
    const ct = res.headers.get('content-type') || ''
  
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText || ''}`.trim())
    }
    if (!ct.toLowerCase().includes('application/json')) {
      // No intentes parsear JSON si es HTML; esto evita el "Unexpected token '<'"
      const head = (await res.text().catch(() => '')).slice(0, 400)
      throw new Error(`Respuesta no JSON (${ct}). Inicio:\n${head}`)
    }
    return res.json() as Promise<T>
  }
  