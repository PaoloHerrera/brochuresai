import { useLanguageStore } from '../stores/useLanguageStore'

export const useTranslate = <T>(translations: Record<'en' | 'es', T>) => {
  const { language, setLanguage } = useLanguageStore()

  return {
    t: translations[language],
    language,
    setLanguage,
  }
}
