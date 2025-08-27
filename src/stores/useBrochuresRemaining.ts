import {create} from 'zustand'

interface BrochuresRemainingState {
  brochuresRemaining: number
  setBrochuresRemaining: (brochuresRemaining: number) => void
}


export const useBrochuresRemainingStore = create<BrochuresRemainingState>()(
  (set) => ({
    brochuresRemaining: 0,
    setBrochuresRemaining: (brochuresRemaining) => set({ brochuresRemaining }),
  }),
)