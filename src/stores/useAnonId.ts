import {create} from 'zustand'
import {persist} from 'zustand/middleware'


interface AnonIdState {
  anonId: string
  setAnonId: (anonId: string) => void
}

export const useAnonIdStore = create<AnonIdState>()(
  persist(
    (set) => ({
      anonId: '',
      setAnonId: (anonId) => set({ anonId }),
    }),
    {
      name: 'anon-user-id-storage', // unique name for the storage
    },
  ),
)
