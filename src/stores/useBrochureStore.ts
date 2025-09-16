import {create} from 'zustand'
import type { LanguageStore, BrochureType } from '../types'

export interface BrochureState {
  companyName: string
  url: string
  language: LanguageStore
  brochure: string
  brochureType: BrochureType
  cacheKey: string
  setBrochure: (brochure: string) => void
  setCompanyName: (companyName: string) => void
  setCacheKey: (cacheKey: string) => void
  setUrl: (url: string) => void
  setLanguage: (language: LanguageStore) => void
  setBrochureType: (brochureType: BrochureType) => void
  setLastSubmission: (payload: { companyName: string; url: string; language: LanguageStore; brochureType: BrochureType }) => void
}

export const useBrochureStore = create<BrochureState>((set) => {
  return {
    companyName: '',
    url: '',
    language: 'en',
    brochure: '',
    brochureType: 'professional',
    cacheKey: '',
    setBrochure: (brochure) => set({ brochure }),
    setUrl: (url) => set({ url }),
    setLanguage: (language) => set({ language }),
    setBrochureType: (brochureType) => set({ brochureType }),
    setCompanyName: (companyName) => set({ companyName }),
    setCacheKey: (cacheKey) => set({ cacheKey }),
    setLastSubmission: ({ companyName, url, language, brochureType }) => set({ companyName, url, language, brochureType }),
  }
})