import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AxiosResponse } from '../../test/test-helpers'
import { asAxios, makeAxiosError, makeTimeoutError } from '../../test/test-helpers'
import { getBrochuresRemaining } from '../getBrochuresRemaining'
import type { GetBrochuresRemainingResponse } from '../../types'

const resp = (data: unknown) => ({ data, headers: {} }) as unknown as AxiosResponse<unknown>

describe('getBrochuresRemaining service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('success: retorna success=true con data y llama a /get_remaining con anon_id', async () => {
    asAxios().get.mockResolvedValueOnce(
      resp({ brochures_remaining: 3, anon_id: 'abc' } satisfies GetBrochuresRemainingResponse)
    )
    const result = await getBrochuresRemaining('abc')
    expect(result).toEqual({ success: true, data: { brochures_remaining: 3, anon_id: 'abc' } })

    expect(asAxios().get).toHaveBeenCalledTimes(1)
    const call = asAxios().get.mock.calls[0]
    expect(String(call[0])).toMatch(/get_remaining/i)
    expect(call[1]).toMatchObject({ params: { anon_id: 'abc' } })
  })

  it('success: permite anon_id nulo', async () => {
    asAxios().get.mockResolvedValueOnce(
      resp({ brochures_remaining: 1, anon_id: '' } satisfies GetBrochuresRemainingResponse)
    )
    const result = await getBrochuresRemaining(null)
    expect(result.success).toBe(true)
    expect(asAxios().get).toHaveBeenCalledWith(expect.stringMatching(/get_remaining/i), expect.objectContaining({ params: { anon_id: null } }))
  })

  it('error 500: retorna success=false', async () => {
    asAxios().get.mockRejectedValueOnce(makeAxiosError(500))
    const result = await getBrochuresRemaining('abc')
    expect(result).toMatchObject({ success: false })
  })

  it('timeout: retorna success=false', async () => {
    asAxios().get.mockRejectedValueOnce(makeTimeoutError())
    const result = await getBrochuresRemaining('abc')
    expect(result).toMatchObject({ success: false })
  })
})