import { ParseReportResponse } from './api'
import { CategoryKey } from '@/constants/categories'
import { ReportType } from './types'

const KEYWORDS: Record<CategoryKey, string[]> = {
  basura: ['basura', 'residuo', 'botadero', 'desperdicio', 'suciedad', 'basurero', 'recojo', 'recogen', 'bote', 'inmundicia', 'desmonte'],
  obra: ['obra', 'construcci', 'paviment', 'paralizada', 'abandonada', 'contratista', 'obreros', 'maquinaria'],
  agua: ['agua', 'tuber', 'fuga', 'inundaci', 'desag', 'alcantarilla', 'ca', 'sunass', 'sedapal'],
  luz: ['luz', 'alumbrado', 'poste', 'foco', 'lámpara', 'oscuro', 'oscuridad', 'iluminaci'],
  ambiente: ['contaminaci', 'humo', 'smog', 'tóxico', 'ruido', 'quema', 'veneno'],
  pista: ['pista', 'vereda', 'bache', 'hoyo', 'asfalto', 'grieta', 'socav', 'calzada', 'vía'],
  parque: ['parque', 'jardín', 'área verde', 'plaza', 'grass', 'juegos', 'lozas'],
  seguridad: ['robo', 'asalto', 'delincuenci', 'inseguridad', 'pandilla', 'ladron', 'extorsi'],
  propuesta: ['propuesta', 'ciclovía', 'bicicleta', 'sería bueno', 'necesitamos', 'deberían', 'quisiera', 'sugiero', 'podría haber'],
  otro: [],
}

const PROPUESTA_PHRASES = [
  'sería bueno', 'necesitamos', 'deberían', 'quisiera', 'sugiero',
  'podría haber', 'propuesta', 'mejorar', 'implementar', 'instalar',
]

const URGENCY_HIGH = ['urgente', 'peligro', 'accidente', 'herido', 'emergencia', 'riesgo', 'daño', 'derrumbe']
const URGENCY_LOW = ['leve', 'pequeño', 'poco', 'mínimo', 'leve']

const CATEGORY_TITLES: Record<CategoryKey, string> = {
  basura:    'Acumulación de residuos sin recoger',
  obra:      'Obra pública paralizada o abandonada',
  agua:      'Problema con servicio de agua o desagüe',
  luz:       'Falla en el alumbrado público',
  ambiente:  'Foco de contaminación ambiental',
  pista:     'Deterioro de pista o vereda',
  parque:    'Descuido en área verde o parque',
  seguridad: 'Problema de inseguridad ciudadana',
  propuesta: 'Propuesta de mejora vecinal',
  otro:      'Problema en la vía pública',
}

const CATEGORY_TEMPLATES: Record<CategoryKey, (t: string) => string> = {
  basura:    (t) => `Se reporta acumulación de residuos sólidos en la zona sin recolección. ${clip(t)}`,
  obra:      (t) => `Se reporta obra pública con irregularidades en su ejecución. ${clip(t)}`,
  agua:      (t) => `Se reporta problema con el servicio de agua potable o alcantarillado. ${clip(t)}`,
  luz:       (t) => `Se reporta falla en el sistema de alumbrado público de la zona. ${clip(t)}`,
  ambiente:  (t) => `Se reporta situación de contaminación ambiental que afecta a la comunidad. ${clip(t)}`,
  pista:     (t) => `Se reporta deterioro en infraestructura vial que representa un peligro. ${clip(t)}`,
  parque:    (t) => `Se reporta área verde o espacio público en estado de abandono. ${clip(t)}`,
  seguridad: (t) => `Se reporta problema de inseguridad que requiere atención de las autoridades. ${clip(t)}`,
  propuesta: (t) => `Propuesta ciudadana para mejorar el barrio: ${clip(t)}`,
  otro:      (t) => t,
}

function clip(text: string, max = 120): string {
  return text.length > max ? text.substring(0, max) + '...' : text
}

function detectCategory(text: string): { category: CategoryKey; type: ReportType } {
  const lower = text.toLowerCase()

  if (PROPUESTA_PHRASES.some((w) => lower.includes(w))) {
    return { category: 'propuesta', type: 'propuesta' }
  }

  const scores: Record<string, number> = {}
  for (const [cat, kws] of Object.entries(KEYWORDS)) {
    scores[cat] = kws.filter((kw) => lower.includes(kw)).length
  }
  const best = Object.entries(scores).sort(([, a], [, b]) => b - a)[0]
  const category = best[1] > 0 ? (best[0] as CategoryKey) : 'otro'
  return { category, type: 'denuncia' }
}

function detectUrgency(text: string): 'alta' | 'media' | 'baja' {
  const lower = text.toLowerCase()
  if (URGENCY_HIGH.some((w) => lower.includes(w))) return 'alta'
  if (URGENCY_LOW.some((w) => lower.includes(w))) return 'baja'
  return 'media'
}

function extractAddressHint(text: string): string | null {
  const patterns = [
    /(?:en|en la|en el|calle|av\.?|avenida|jr\.?|jirón|pasaje|esquina)\s+([A-ZÁÉÍÓÚa-záéíóúñ][^.,\n]{3,40})/i,
    /([A-ZÁÉÍÓÚa-záéíóúñ].{2,20}\s+\d{2,4})/i,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]?.trim()) return m[1].trim()
  }
  return null
}

export interface MockAIResult extends ParseReportResponse {
  type: ReportType
}

export function parseReportLocally(text: string): MockAIResult {
  const { category, type } = detectCategory(text)
  const urgency = detectUrgency(text)
  const addressHint = extractAddressHint(text)

  const missingFields: string[] = []
  if (!addressHint) missingFields.push('location')

  return {
    category,
    type,
    title: CATEGORY_TITLES[category],
    description: CATEGORY_TEMPLATES[category](text),
    address_hint: addressHint,
    missing_fields: missingFields,
    missing_question: missingFields.length > 0 ? '¿En qué dirección o zona exacta ocurre esto?' : null,
    estimated_duration: null,
    urgency,
  }
}

export const CATEGORY_META: Record<CategoryKey, { icon: string; color: string; label: string }> = {
  obra:      { icon: '🏗️', color: '#F59E0B', label: 'Obra paralizada' },
  basura:    { icon: '🗑️', color: '#84CC16', label: 'Basura' },
  agua:      { icon: '💧', color: '#3B82F6', label: 'Agua / Desagüe' },
  luz:       { icon: '💡', color: '#EAB308', label: 'Alumbrado' },
  ambiente:  { icon: '🌿', color: '#22C55E', label: 'Contaminación' },
  pista:     { icon: '🛣️', color: '#6B7280', label: 'Pista / Vereda' },
  parque:    { icon: '🌳', color: '#10B981', label: 'Parque / Área verde' },
  seguridad: { icon: '🚨', color: '#EF4444', label: 'Inseguridad' },
  propuesta: { icon: '💡', color: '#8B5CF6', label: 'Propuesta' },
  otro:      { icon: '📋', color: '#6B7280', label: 'Otro' },
}
