export type CategoryKey =
  | 'obra'
  | 'basura'
  | 'agua'
  | 'luz'
  | 'ambiente'
  | 'pista'
  | 'parque'
  | 'seguridad'
  | 'propuesta'
  | 'otro'

export interface Category {
  key: CategoryKey
  label: string
  icon: string
  description: string
  stateSources: string[]
}

export const CATEGORIES: Category[] = [
  {
    key: 'obra',
    label: 'Obra paralizada',
    icon: '🏗️',
    description: 'Construcción o mejora pública sin avance',
    stateSources: ['INFOBRAS', 'MEF/SIAF', 'SEACE'],
  },
  {
    key: 'basura',
    label: 'Basura',
    icon: '🗑️',
    description: 'Acumulación de residuos o botadero ilegal',
    stateSources: ['MINAM', 'SIGERSOL'],
  },
  {
    key: 'agua',
    label: 'Agua / Desagüe',
    icon: '💧',
    description: 'Corte de servicio, fuga o contaminación',
    stateSources: ['SUNASS'],
  },
  {
    key: 'luz',
    label: 'Alumbrado',
    icon: '💡',
    description: 'Poste o zona sin luz pública',
    stateSources: ['OSINERGMIN'],
  },
  {
    key: 'ambiente',
    label: 'Contaminación',
    icon: '🌿',
    description: 'Humo, ruido o residuos tóxicos',
    stateSources: ['OEFA'],
  },
  {
    key: 'pista',
    label: 'Pista / Vereda',
    icon: '🛣️',
    description: 'Bache, hueco o infraestructura dañada',
    stateSources: ['GeoPerú'],
  },
  {
    key: 'parque',
    label: 'Parque / Área verde',
    icon: '🌳',
    description: 'Espacio público descuidado o peligroso',
    stateSources: ['GeoPerú'],
  },
  {
    key: 'seguridad',
    label: 'Inseguridad',
    icon: '🚨',
    description: 'Zona peligrosa o incidente de seguridad',
    stateSources: ['GeoPerú'],
  },
  {
    key: 'propuesta',
    label: 'Propuesta',
    icon: '💡',
    description: 'Mejora que quieres para tu barrio',
    stateSources: ['INVIERTE.pe', 'MEF'],
  },
  {
    key: 'otro',
    label: 'Otro',
    icon: '📋',
    description: 'Otro tipo de problema o propuesta',
    stateSources: [],
  },
]

export const MAX_SUPPORT_THRESHOLD = 15
