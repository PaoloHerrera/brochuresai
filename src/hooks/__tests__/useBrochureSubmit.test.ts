import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
// axios import eliminado: no se usa en este archivo

import { useBrochureSubmit } from '../useBrochureSubmit'
import { useBrochureStore } from '../../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../../stores/useBrochuresRemaining'
import { useAnonIdStore } from '../../stores/useAnonId'
import type { LanguageStore } from '../../types'
import { makeAxiosResponse, makeAxiosError, makeCanceledError, asAxios, resetStores } from '../../test/test-helpers'

// asAxios centralizado en test-helpers

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

// resetStores centralizado en test-helpers

describe('useBrochureSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
    // Para este archivo, los casos de error esperan remaining=0 al final (no update); ajustamos el valor base a 0
    useBrochuresRemainingStore.getState().setBrochuresRemaining(0)
    useAnonIdStore.getState().setAnonId('anon-123')
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

  it('envía anon_id vacío si anonId no existe y aún así genera y actualiza stores', async () => {
    const payload = makePayload()

    // Forzar anonId vacío en el store
    useAnonIdStore.getState().setAnonId('')

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