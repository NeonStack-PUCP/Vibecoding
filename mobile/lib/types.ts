import { CategoryKey } from '@/constants/categories'

export type ReportType = 'denuncia' | 'propuesta'

export type ReportStatus = 'pending' | 'active' | 'pending_response' | 'resolved'

export interface StateDataResult {
  found: boolean
  source: string
  data?: Record<string, unknown>
}

export interface InfobrasResult extends StateDataResult {
  code?: string
  name?: string
  budget?: number
  progressPct?: number
  daysWithoutMovement?: number
  contractor?: string
}

export interface MefResult extends StateDataResult {
  assigned?: number
  executed?: number
  executionPct?: number
}

export interface OefaResult extends StateDataResult {
  previousInspections?: number
  lastInspectionDate?: string
}

export interface GeoResult extends StateDataResult {
  entity?: string
  district?: string
  province?: string
  region?: string
}

export interface StateData {
  infobras?: InfobrasResult
  mef?: MefResult
  oefa?: OefaResult
  geo?: GeoResult
  responsibleEntity?: string
  responsibleChannel?: string
}

export interface Report {
  id: string
  type: ReportType
  category: CategoryKey
  title: string
  description: string
  latitude: number
  longitude: number
  address: string
  photoUrl: string
  status: ReportStatus
  supportCount: number
  stateData?: StateData
  expedienteUrl?: string
  responsibleEntity?: string
  responsibleChannel?: string
  collectiveRequestSent: boolean
  createdAt: string
}

export interface CreateReportPayload {
  type: ReportType
  category: CategoryKey
  title: string
  description: string
  latitude: number
  longitude: number
  photoUrl: string
}

export interface SupportPayload {
  citizenName: string
}

export interface SupportResponse {
  supportCount: number
  collectiveRequestSent: boolean
  message?: string
}

export interface ReportsListResponse {
  reports: Report[]
  total: number
}

// Form state for multi-step report creation
export interface ReportFormState {
  step: 1 | 2 | 3 | 4 | 5
  type: ReportType
  category: CategoryKey | null
  photoUri: string | null
  photoUrl: string | null
  latitude: number | null
  longitude: number | null
  address: string
  title: string
  description: string
}
