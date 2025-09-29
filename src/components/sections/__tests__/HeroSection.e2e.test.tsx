import { describe, it, expect, beforeEach, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../../test/test-utils'
import { HeroSection } from '../HeroSection'
import type { AxiosResponse } from '../../../test/test-helpers'
import {
  asAxios,
  resetStores,
  setLanguage,
  fillFormEN,
  getSelectedTabKey,
  makePdfBlob,
} from '../../../test/test-helpers'

interface ApiGenerateResponse {
  brochure: string
  cache_key: string
  brochures_remaining: number
}

describe('HeroSection - flujo E2E formulario → generar → preview → descargar', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    resetStores()
    await setLanguage('en')
  })

  it('genera el brochure, activa la pestaña Preview y permite descargar el PDF', async () => {
    // 1) Mock de generación
    asAxios().post.mockResolvedValueOnce(
      ({
        data: {
          brochure: '<html><body>preview E2E</body></html>',
          cache_key: 'cache-e2e-001',
          brochures_remaining: 2,
        },
        headers: {},
      }) as unknown as AxiosResponse<ApiGenerateResponse>
    )

    const { container } = renderWithProviders(<HeroSection />)

    // 2) Rellenar formulario y enviar
    const { submitBtn } = await fillFormEN(container, { name: 'Acme', url: 'https://acme.com' })
    await userEvent.click(submitBtn)

    // 3) Cambia a pestaña preview
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-preview'))

    // Esperar a que termine la carga del brochure
    await waitFor(() => {
      const loadingMessage = container.ownerDocument.querySelector('[data-testid="sparkles-icon"]')
      expect(loadingMessage).not.toBeInTheDocument()
    })

    // 4) Preparar mock de descarga PDF con Content-Disposition
    const pdfBlob = makePdfBlob()
    asAxios().post.mockResolvedValueOnce(
      ({
        data: pdfBlob,
        headers: { 'content-disposition': 'attachment; filename="brochure-Acme.pdf"' },
      }) as unknown as AxiosResponse<Blob>
    )

    // Espiar URL methods para confirmar creación y revocación del blob URL
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-e2e')
    const revokeUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    // 5) Click en botón de descarga (solo cuando no está en loading)
    const downloadBtn = container.ownerDocument.querySelector('button[aria-label="Download PDF"]') as HTMLButtonElement
    expect(downloadBtn).toBeTruthy()
    await userEvent.click(downloadBtn)

    // 6) Verificaciones: llamada al endpoint de descarga con el cacheKey correcto y uso de URL APIs
    await waitFor(() => {
      expect(asAxios().post).toHaveBeenCalledTimes(2)
      const secondCall = asAxios().post.mock.calls[1]
      expect(String(secondCall[0])).toMatch(/download_brochure_pdf/i)
      expect(secondCall[1]).toMatchObject({ cache_key: 'cache-e2e-001' })
      expect(createUrlSpy).toHaveBeenCalledTimes(1)
      expect(revokeUrlSpy).toHaveBeenCalledTimes(1)
    })

    // Restaurar spies locales
    createUrlSpy.mockRestore()
    revokeUrlSpy.mockRestore()
  })
})