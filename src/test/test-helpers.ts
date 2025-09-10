import { screen } from '@testing-library/react'
import { vitest } from 'vitest'

// Axios-like helpers
export type AxiosResponse<T> = { data: T; headers: Record<string, unknown> }

export const makeAxiosResponse = <T,>(data: T): AxiosResponse<T> => ({ data, headers: {} })

export const makeAxiosError = (status: number) => ({ isAxiosError: true as const, response: { status } })

export const makeCanceledError = () => ({ isAxiosError: true as const, code: 'ERR_CANCELED', name: 'CanceledError' })

// Language helpers
export const setLanguage = async (lang: 'en' | 'es') => {
  const { useLanguageStore } = await import('../stores/useLanguageStore')
  useLanguageStore.getState().setLanguage(lang)
}

// DOM testing helpers
export const selectButtonByName = (name: RegExp) => screen.getByRole('button', { name })

export const getSubmitButton = (container: HTMLElement): HTMLButtonElement => {
  const btn = container.querySelector('button[type="submit"]') as HTMLButtonElement | null
  if (!btn) throw new Error('Submit button not found')
  return btn
}

export const makePdfBlob = () => new Blob(['fake pdf content'], { type: 'application/pdf' })

export const withBlobUrlSpies = async (run: () => Promise<void> | void) => {
  const createUrlSpy = vitest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
  const revokeSpy = vitest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  try {
    await run()
  } finally {
    createUrlSpy.mockRestore()
    revokeSpy.mockRestore()
  }
}