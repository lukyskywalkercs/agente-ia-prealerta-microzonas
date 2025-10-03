// src/lib/getAemetStatus.ts
export async function getAemetStatus(): Promise<'ERROR_API' | 'SIN_AVISOS' | 'CON_AVISOS'> {
    try {
      const res = await fetch('/data/agent_ui.json', { cache: 'no-store' })
      if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) {
        return 'ERROR_API'
      }
      const data = await res.json()
      if (!data || !Array.isArray(data.avisos)) return 'ERROR_API'
      return data.avisos.length === 0 ? 'SIN_AVISOS' : 'CON_AVISOS'
    } catch {
      return 'ERROR_API'
    }
  }
  