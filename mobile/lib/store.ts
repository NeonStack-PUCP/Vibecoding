import { create } from 'zustand'
import { Report } from './types'

interface AppStore {
  reportCache: Record<string, Report>
  userReports: Report[]
  cacheReport: (report: Report) => void
  getCachedReport: (id: string) => Report | undefined
  addUserReport: (report: Report) => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  reportCache: {},
  userReports: [],

  cacheReport: (report) =>
    set((state) => ({
      reportCache: { ...state.reportCache, [report.id]: report },
    })),

  getCachedReport: (id) => get().reportCache[id],

  addUserReport: (report) => {
    set((state) => ({
      userReports: [report, ...state.userReports],
      reportCache: { ...state.reportCache, [report.id]: report },
    }))
  },
}))
