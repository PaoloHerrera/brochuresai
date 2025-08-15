import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type LanguageStore = 'en' | 'es'

interface LanguageState {
  language: LanguageStore
  setLanguage: (language: LanguageStore) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage', // unique name for the storage
    },
  ),
)
