import { screen } from '@testing-library/react'
import { vitest } from 'vitest'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import * as toasts from '../utils/toasts'
import { PREVIEW_TEXT } from '../lang/preview'
import { useBrochureStore } from '../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../stores/useBrochuresRemaining'
import { useAnonIdStore } from '../stores/useAnonId'

// Axios-like helpers
export type AxiosResponse<T> = { data: T; headers: Record<string, unknown> }

export const makeAxiosResponse = <T,>(data: T): AxiosResponse<T> => ({ data, headers: {} })

export const makeAxiosError = (status: number) => ({ isAxiosError: true as const, response: { status } })

export const makeCanceledError = () => ({ isAxiosError: true as const, code: 'ERR_CANCELED', name: 'CanceledError' })

export const makeTimeoutError = () => ({ isAxiosError: true as const, code: 'ECONNABORTED', message: 'timeout of Xms exceeded' })

// Exponer utilitario para acceder al mock de axios.post/get tipado
export const asAxios = () => (axios as unknown as { post: ReturnType<typeof vitest.fn>; get: ReturnType<typeof vitest.fn> })

// Toast helpers para silenciar en suites que no validan su contenido
export const silenceToasts = () => {
  const s1 = vitest.spyOn(toasts, 'showSuccessToast').mockImplementation(async () => {})
  const s2 = vitest.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})
  return {
    successSpy: s1,
    errorSpy: s2,
    restore: () => {
      s1.mockRestore()
      s2.mockRestore()
    },
  }
}

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

// Shared helpers (EN) for form filling and actions
export const fillFormEN = async (
  container: HTMLElement,
  { name = 'Acme Inc', url = 'https://acme.com' }: { name?: string; url?: string } = {}
) => {
  const nameInput = screen.getByPlaceholderText(/my company/i)
  const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i)
  await userEvent.clear(nameInput)
  await userEvent.type(nameInput, name)
  await userEvent.clear(urlInput)
  await userEvent.type(urlInput, url)
  const submitBtn = getSubmitButton(container)
  return { submitBtn }
}

export const clickRegenerateEN = async () => {
  const regenerateBtn = selectButtonByName(new RegExp(PREVIEW_TEXT.en.regenerateLabel, 'i'))
  await userEvent.click(regenerateBtn)
}

export const getSelectedTabKey = () => {
  const tabs = screen.getByTestId('hero-tabs') as HTMLElement
  return tabs.getAttribute('data-selected')
}

// Store helpers: estado inicial y semillas
export const resetStores = () => {
  useBrochureStore.setState({
    companyName: '',
    url: '',
    language: 'en',
    brochure: '',
    brochureType: 'professional',
    cacheKey: '',
    setBrochure: useBrochureStore.getState().setBrochure,
    setUrl: useBrochureStore.getState().setUrl,
    setLanguage: useBrochureStore.getState().setLanguage,
    setBrochureType: useBrochureStore.getState().setBrochureType,
    setCompanyName: useBrochureStore.getState().setCompanyName,
    setCacheKey: useBrochureStore.getState().setCacheKey,
    setLastSubmission: useBrochureStore.getState().setLastSubmission,
  })
  // En tests, por defecto dejamos "remaining" en un número positivo para no bloquear el submit
  useBrochuresRemainingStore.setState({
    brochuresRemaining: 3,
    setBrochuresRemaining: useBrochuresRemainingStore.getState().setBrochuresRemaining,
  })
  useAnonIdStore.setState({
    anonId: '',
    setAnonId: useAnonIdStore.getState().setAnonId,
  })
}

export const seedRegenerateEN = () => {
  useBrochureStore.setState({
    companyName: 'Acme Inc',
    url: 'https://acme.com',
    language: 'en',
    brochure: '<html><body>preview</body></html>',
    brochureType: 'professional',
    cacheKey: 'cache-prev',
    setBrochure: useBrochureStore.getState().setBrochure,
    setUrl: useBrochureStore.getState().setUrl,
    setLanguage: useBrochureStore.getState().setLanguage,
    setBrochureType: useBrochureStore.getState().setBrochureType,
    setCompanyName: useBrochureStore.getState().setCompanyName,
    setCacheKey: useBrochureStore.getState().setCacheKey,
    setLastSubmission: useBrochureStore.getState().setLastSubmission,
  })
}