import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

import { useBrochureDownload } from '../useBrochureDownload'
import type { AxiosResponse } from '../../test/test-helpers'
import { asAxios, makeAxiosError, makeCanceledError, makePdfBlob } from '../../test/test-helpers'

const makeResponse = <T,>(data: T, headers: Record<string, unknown> = {}) => ({ data, headers }) as unknown as AxiosResponse<T>

describe('useBrochureDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('descarga con éxito y extrae filename desde Content-Disposition', async () => {
    const blob = makePdfBlob()
    asAxios().post.mockResolvedValueOnce(
      makeResponse(blob, { 'content-disposition': 'attachment; filename="brochure-Acme.pdf"' })
    )

    const { result } = renderHook(() => useBrochureDownload())

    let r
    await act(async () => {
      r = await result.current.downloadPdf('cache-123')
    })

    expect(r).toEqual({ success: true, blob, filename: 'brochure-Acme.pdf' })

    // Verifica la llamada y opciones
    expect(asAxios().post).toHaveBeenCalledTimes(1)
    const call = asAxios().post.mock.calls[0]
    expect(String(call[0])).toMatch(/download_brochure_pdf/i)
    expect(call[1]).toMatchObject({ cache_key: 'cache-123' })
    expect(call[2]).toMatchObject({ responseType: 'blob', headers: { Accept: 'application/pdf' } })

    await waitFor(() => expect(result.current.isDownloading).toBe(false))
  })

  it('usa filename por defecto cuando no hay Content-Disposition', async () => {
    const blob = makePdfBlob()
    asAxios().post.mockResolvedValueOnce(makeResponse(blob))

    const { result } = renderHook(() => useBrochureDownload())

    let r
    await act(async () => {
      r = await result.current.downloadPdf('cache-xyz')
    })

    expect(r).toEqual({ success: true, blob, filename: 'brochure.pdf' })
    await waitFor(() => expect(result.current.isDownloading).toBe(false))
  })

  it('propaga status en error 500 y retorna success=false', async () => {
    asAxios().post.mockRejectedValueOnce(makeAxiosError(500))

    const { result } = renderHook(() => useBrochureDownload())

    let r
    await act(async () => {
      r = await result.current.downloadPdf('cache-err')
    })

    expect(r).toMatchObject({ success: false, status: 500 })
    await waitFor(() => expect(result.current.isDownloading).toBe(false))
  })

  it('cancelación: retorna success=false sin status', async () => {
    asAxios().post.mockRejectedValueOnce(makeCanceledError())

    const { result } = renderHook(() => useBrochureDownload())

    let r
    await act(async () => {
      r = await result.current.downloadPdf('cache-cancel')
    })

    expect(r).toEqual(expect.objectContaining({ success: false }))
    expect((r as { status?: number }).status).toBeUndefined()
    await waitFor(() => expect(result.current.isDownloading).toBe(false))
  })
})