import { describe, it, expect, beforeEach } from 'vitest'

import { useBrochureStore } from '../useBrochureStore'
import type { LanguageStore } from '../../types'

const resetStore = () => {
  const s = useBrochureStore.getState()
  useBrochureStore.setState({
    companyName: '',
    url: '',
    language: 'en',
    brochure: '',
    brochureType: 'professional',
    cacheKey: '',
    setBrochure: s.setBrochure,
    setUrl: s.setUrl,
    setLanguage: s.setLanguage,
    setBrochureType: s.setBrochureType,
    setCompanyName: s.setCompanyName,
    setCacheKey: s.setCacheKey,
    setLastSubmission: s.setLastSubmission,
  })
}

describe('useBrochureStore - setLastSubmission', () => {
  beforeEach(() => {
    resetStore()
  })

  it('actualiza companyName, url, language y brochureType correctamente', () => {
    const payload = {
      companyName: 'Globex Corp',
      url: 'https://globex.com',
      language: 'es' as LanguageStore,
      brochureType: 'funny' as const,
    }

    useBrochureStore.getState().setLastSubmission(payload)

    const state = useBrochureStore.getState()
    expect(state.companyName).toBe(payload.companyName)
    expect(state.url).toBe(payload.url)
    expect(state.language).toBe(payload.language)
    expect(state.brochureType).toBe(payload.brochureType)

    // Campos no afectados por setLastSubmission permanecen intactos
    expect(state.brochure).toBe('')
    expect(state.cacheKey).toBe('')
  })

  it('sobrescribe valores previos cuando se invoca nuevamente', () => {
    useBrochureStore.getState().setLastSubmission({
      companyName: 'First',
      url: 'https://first.example',
      language: 'en',
      brochureType: 'professional',
    })

    useBrochureStore.getState().setLastSubmission({
      companyName: 'Second LLC',
      url: 'https://second.example',
      language: 'es',
      brochureType: 'funny',
    })

    const state = useBrochureStore.getState()
    expect(state.companyName).toBe('Second LLC')
    expect(state.url).toBe('https://second.example')
    expect(state.language).toBe('es')
    expect(state.brochureType).toBe('funny')
  })
})