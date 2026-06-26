import axios from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import {
  CreateReportPayload,
  Report,
  ReportsListResponse,
  SupportPayload,
  SupportResponse,
} from './types'

function resolveBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.apiUrl
  if (configured) return configured as string

  if (Platform.OS === 'android') {
    const isEmulator = !Constants.isDevice
    return isEmulator ? 'http://10.0.2.2:8000' : 'http://localhost:8000'
  }
  return 'http://localhost:8000'
}

export const BASE_URL = resolveBaseUrl()

const client = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail ?? err.message ?? 'Error de red'
    return Promise.reject(new Error(msg))
  },
)

// Use native fetch for multipart (axios transforms break FormData in React Native)
async function postMultipart<T>(path: string, formData: FormData, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      // Do NOT set Content-Type — fetch sets it automatically with the correct boundary
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body?.detail ?? `HTTP ${res.status}`)
    }
    return res.json() as Promise<T>
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  reports: {
    list: async (params: {
      lat: number
      lng: number
      radius?: number
      category?: string
    }): Promise<ReportsListResponse> => {
      const { data } = await client.get('/reports', { params })
      return data
    },

    get: async (id: string): Promise<Report> => {
      const { data } = await client.get(`/reports/${id}`)
      return data
    },

    create: async (payload: CreateReportPayload): Promise<Report> => {
      const { data } = await client.post('/reports', payload)
      return data
    },

    support: async (id: string, payload: SupportPayload): Promise<SupportResponse> => {
      const { data } = await client.post(`/reports/${id}/support`, payload)
      return data
    },
  },

  upload: {
    photo: async (uri: string): Promise<string> => {
      const formData = new FormData()
      formData.append('file', {
        uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as unknown as Blob)
      const result = await postMultipart<{ url: string }>('/upload/photo', formData)
      return result.url
    },
  },

  stateData: {
    query: async (params: {
      lat: number
      lng: number
      category: string
    }): Promise<Report['stateData']> => {
      const { data } = await client.get('/state-data/query', { params })
      return data
    },
  },

  ai: {
    parseReport: async (text: string, category = 'basura'): Promise<ParseReportResponse> => {
      const { data } = await client.post('/ai/parse-report', { text, category })
      return data
    },

    transcribe: async (audioUri: string): Promise<string> => {
      const ext = audioUri.split('.').pop()?.toLowerCase() ?? 'm4a'
      const mimeType = ext === 'mp4' ? 'audio/mp4' : ext === 'wav' ? 'audio/wav' : 'audio/m4a'
      const formData = new FormData()
      formData.append('file', {
        uri: audioUri,
        name: `audio_${Date.now()}.${ext}`,
        type: mimeType,
      } as unknown as Blob)
      const result = await postMultipart<{ text: string }>('/ai/transcribe', formData, 35000)
      return result.text
    },
  },
}

export interface ParseReportResponse {
  category: string
  title: string
  description: string
  address_hint: string | null
  missing_fields: string[]
  missing_question: string | null
  estimated_duration: string | null
  urgency: 'alta' | 'media' | 'baja'
}
