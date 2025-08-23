import {create} from 'zustand'

interface BrochureState {
  companyName: string
  brochure: string
  cacheKey: string
  setBrochure: (brochure: string) => void
  setCompanyName: (companyName: string) => void
  setCacheKey: (cacheKey: string) => void
}

export const useBrochureStore = create<BrochureState>((set) => {
  return {
    companyName: '',
    brochure: '',
    cacheKey: '',
    setBrochure: (brochure) => set({ brochure }),
    setCompanyName: (companyName) => set({ companyName }),
    setCacheKey: (cacheKey) => set({ cacheKey }),
  }
})