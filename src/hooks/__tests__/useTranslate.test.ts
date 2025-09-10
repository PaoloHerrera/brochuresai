import { describe, it, expect, beforeEach } from 'vitest'
import { useTranslate } from '../useTranslate'
import { renderHook, act } from '@testing-library/react'
import { useLanguageStore } from '../../stores/useLanguageStore'
import { setLanguage } from '../../test/test-helpers'

const TEXT = {
  en: { hello: 'Hello' },
  es: { hello: 'Hola' },
}

describe('useTranslate', () => {
  beforeEach(() => {
    useLanguageStore.setState({ language: 'en', setLanguage: useLanguageStore.getState().setLanguage })
  })

  it('retorna traducciones según idioma actual', () => {
    const { result } = renderHook(() => useTranslate(TEXT))
    expect(result.current.t.hello).toBe('Hello')
  })

  it('cambia traducción cuando se actualiza el idioma', async () => {
    const { result } = renderHook(() => useTranslate(TEXT))

    await act(async () => {
      await setLanguage('es')
    })

    expect(result.current.t.hello).toBe('Hola')
  })
})