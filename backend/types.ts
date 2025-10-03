export type Nivel = '—' | 'amarillo' | 'naranja' | 'rojo'

export type Aviso = {
  subzona: string
  areaDesc: string
  fenomeno?: string
  nivel: Nivel
  nivel_num?: string
  f_inicio?: string
  f_fin?: string
}
