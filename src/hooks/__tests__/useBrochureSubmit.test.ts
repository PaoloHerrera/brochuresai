import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import axios from 'axios'

import { useBrochureSubmit } from '../useBrochureSubmit'
import { useBrochureStore } from '../../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../../stores/useBrochuresRemaining'
import { useAnonUserIdStore } from '../../stores/useAnonUserId'
import type { LanguageStore } from '../../stores/useLanguageStore'
import { makeAxiosResponse, makeAxiosError, makeCanceledError } from '../../test/test-helpers'

vi.mock('axios', () => {
  const post = vi.fn()
  const mocked = {
    default: { post },
    post,
    isAxiosError: (err: unknown) => !!err && typeof err === 'object' && 'isAxiosError' in err,
  }
  return mocked as unknown as typeof axios
})

const asAxios = () => (axios as unknown as { post: ReturnType<typeof vi.fn> })

// Tipos auxiliares para respuestas simuladas de la API y fábrica de respuestas
interface ApiGenerateResponse {
  brochure: string
  cache_key: string
  brochures_remaining: number
}

const makePayload = (overrides?: Partial<{ companyName: string; url: string; language: LanguageStore; brochureType: 'professional' }>) => ({
  companyName: 'Acme Inc',
  url: 'https://acme.com',
  language: 'en' as LanguageStore,
  brochureType: 'professional' as const,
  ...overrides,
})

const resetStores = () => {
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
  useBrochuresRemainingStore.setState({ brochuresRemaining: 0, setBrochuresRemaining: useBrochuresRemainingStore.getState().setBrochuresRemaining })
  useAnonUserIdStore.setState({ anonUserId: '', setAnonUserId: useAnonUserIdStore.getState().setAnonUserId })
}

describe('useBrochureSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
    useAnonUserIdStore.getState().setAnonUserId('anon-123')
  })

  it('éxito: retorna success=true y actualiza stores (brochure, cacheKey, remaining y lastSubmission)', async () => {
    const payload = makePayload()

    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>ok</body></html>',
        cache_key: 'cache-001',
        brochures_remaining: 2,
      })
    )

    const { result } = renderHook(() => useBrochureSubmit())

    expect(result.current.isLoading).toBe(false)

    let submitResult
    await act(async () => {
      submitResult = await result.current.submitBrochure(payload)
    })

    expect(submitResult).toEqual({ success: true })

    // isLoading vuelve a false tras finalizar
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Stores
    const bStore = useBrochureStore.getState()
    expect(bStore.brochure).toBe('<html><body>ok</body></html>')
    expect(bStore.cacheKey).toBe('cache-001')
    expect(bStore.companyName).toBe('Acme Inc')
    expect(bStore.url).toBe('https://acme.com')
    expect(bStore.language).toBe('en')
    expect(bStore.brochureType).toBe('professional')

    const remainingStore = useBrochuresRemainingStore.getState()
    expect(remainingStore.brochuresRemaining).toBe(2)
  })

  it('error 429: retorna success=false y no persiste lastSubmission ni actualiza stores', async () => {
    const payload = makePayload()

    asAxios().post.mockRejectedValueOnce(makeAxiosError(429))

    const { result } = renderHook(() => useBrochureSubmit())

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.submitBrochure(payload)
    })

    expect(submitResult).toMatchObject({ success: false, status: 429 })

    // isLoading vuelve a false tras finalizar
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Stores NO deben actualizarse en error 429
    const bStore = useBrochureStore.getState()
    expect(bStore.brochure).toBe('')
    expect(bStore.cacheKey).toBe('')
    // No se debe persistir la última sumisión
    expect(bStore.companyName).toBe('')
    expect(bStore.url).toBe('')
    expect(bStore.language).toBe('en')
    expect(bStore.brochureType).toBe('professional')

    const remainingStore = useBrochuresRemainingStore.getState()
    expect(remainingStore.brochuresRemaining).toBe(0)
  })

  it('error 500: retorna success=false con status=500 y no actualiza stores', async () => {
    const payload = makePayload()

    asAxios().post.mockRejectedValueOnce(makeAxiosError(500))

    const { result } = renderHook(() => useBrochureSubmit())

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.submitBrochure(payload)
    })

    expect(submitResult).toMatchObject({ success: false, status: 500 })

    // isLoading vuelve a false tras finalizar
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Stores NO deben actualizarse en error 500
    const bStore = useBrochureStore.getState()
    expect(bStore.brochure).toBe('')
    expect(bStore.cacheKey).toBe('')
    // No se debe persistir la última sumisión
    expect(bStore.companyName).toBe('')
    expect(bStore.url).toBe('')
    expect(bStore.language).toBe('en')
    expect(bStore.brochureType).toBe('professional')

    const remainingStore = useBrochuresRemainingStore.getState()
    expect(remainingStore.brochuresRemaining).toBe(0)
  })

  it('abort/cancelación: devuelve success=false sin status y no actualiza stores', async () => {
    const payload = makePayload()

    // Simulamos cancelación (AbortController) con un error Axios sin response
    asAxios().post.mockRejectedValueOnce(makeCanceledError())

    const { result } = renderHook(() => useBrochureSubmit())

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.submitBrochure(payload)
    })

    // success=false y status undefined (no response en cancelación)
    expect(submitResult).toEqual(expect.objectContaining({ success: false }))
    // Check that status is not present
    expect((submitResult as { status?: number }).status).toBeUndefined()

    // isLoading vuelve a false
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Stores NO deben actualizarse
    const bStore = useBrochureStore.getState()
    expect(bStore.brochure).toBe('')
    expect(bStore.cacheKey).toBe('')
    expect(bStore.companyName).toBe('')
    expect(bStore.url).toBe('')
    expect(bStore.language).toBe('en')
    expect(bStore.brochureType).toBe('professional')

    const remainingStore = useBrochuresRemainingStore.getState()
    expect(remainingStore.brochuresRemaining).toBe(0)
  })

  it('envía anon_id vacío si anonUserId no existe y aún así genera y actualiza stores', async () => {
    const payload = makePayload()

    // Forzar anonUserId vacío en el store
    useAnonUserIdStore.getState().setAnonUserId('')

    // Respuesta exitosa de la API
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>ok-empty-anon</body></html>',
        cache_key: 'cache-empty-anon',
        brochures_remaining: 2,
      })
    )

    const { result } = renderHook(() => useBrochureSubmit())

    let submitResult: unknown
    await act(async () => {
      submitResult = await result.current.submitBrochure(payload)
    })

    expect(submitResult).toEqual({ success: true })

    // Debe haberse llamado axios.post con anon_id vacío
    expect(asAxios().post).toHaveBeenCalledTimes(1)
    const firstCall = asAxios().post.mock.calls[0]
    const body = firstCall[1] as Record<string, unknown>
    expect(body.anon_id).toBe('')

    // Stores actualizadas
    const bStore = useBrochureStore.getState()
    expect(bStore.brochure).toBe('<html><body>ok-empty-anon</body></html>')
    expect(bStore.cacheKey).toBe('cache-empty-anon')

    const remainingStore = useBrochuresRemainingStore.getState()
    expect(remainingStore.brochuresRemaining).toBe(2)
  })
})