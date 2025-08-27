import {create} from 'zustand'
import {persist} from 'zustand/middleware'


interface AnonUserIdState {
  anonUserId: string
  setAnonUserId: (anonUserId: string) => void
}

export const useAnonUserIdStore = create<AnonUserIdState>()(
  persist(
    (set) => ({
      anonUserId: '',
      setAnonUserId: (anonUserId) => set({ anonUserId }),
    }),
    {
      name: 'anon-user-id-storage', // unique name for the storage
    },
  ),
)
