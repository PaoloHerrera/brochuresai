import '@testing-library/jest-dom/vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils'
import { BrochurePreview } from '../BrochurePreview'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import { setLanguage, selectButtonByName, makePdfBlob, withBlobUrlSpies, resetStores, seedRegenerateEN, silenceToasts } from '../../../test/test-helpers'
import * as toasts from '../../../utils/toasts'
import { PREVIEW_TEXT } from '../../../lang/preview'

// Mock the useBrochureDownload hook
const mockDownloadPdf = vi.fn()
vi.mock('../../../hooks/useBrochureDownload', () => ({
  useBrochureDownload: () => ({
    isDownloading: false,
    downloadPdf: mockDownloadPdf,
  }),
}))

describe('BrochurePreview', () => {
  beforeEach(async () => {
    // Estado consistente: limpiar stores, idioma EN y semilla válida de preview
    resetStores()
    await setLanguage('en')
    mockDownloadPdf.mockReset()
    seedRegenerateEN()
    // Silenciar toasts por defecto; cada test que valide toasts usará su propio spy
    silenceToasts()
  })

  it('muestra textos traducidos en EN por defecto', () => {
    renderWithProviders(<BrochurePreview />)

    // The component doesn't render visible text, but has aria-labels and titles
    expect(selectButtonByName(/download pdf/i)).toBeInTheDocument()
    expect(selectButtonByName(/regenerate brochure/i)).toBeInTheDocument()
    expect(screen.getByTitle('Brochure preview')).toBeInTheDocument()
  })

  it('traduce a ES cuando se cambia el idioma', async () => {
    renderWithProviders(<BrochurePreview />)

    await act(async () => {
      await setLanguage('es')
      // Give React time to process all updates including LazyMotion
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    await waitFor(() => {
      expect(selectButtonByName(/descargar pdf/i)).toBeInTheDocument()
      expect(selectButtonByName(/volver a generar folleto/i)).toBeInTheDocument()
      expect(screen.getByTitle('Vista previa del folleto')).toBeInTheDocument()
    })
  })

  it('deshabilita el botón cuando no hay brochure', () => {
    // Reiniciar a estado vacío
    resetStores()
    renderWithProviders(<BrochurePreview />)

    // The download button should be disabled when there's no brochure/cache
    const downloadBtn = selectButtonByName(/download pdf/i)
    expect(downloadBtn).toBeDisabled()
  })

  it('muestra skeleton y no muestra iframe cuando isLoading es true', () => {
    renderWithProviders(<BrochurePreview isLoading />)

    // No debe renderizar el iframe de la vista previa mientras carga
    expect(screen.queryByTitle('Brochure preview')).not.toBeInTheDocument()

    // Los botones NO deben aparecer cuando está cargando
    expect(screen.queryByRole('button', { name: /download pdf/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /regenerate brochure/i })).not.toBeInTheDocument()
  })

  it('muestra mensaje de generación cuando isLoading es true', () => {
    renderWithProviders(<BrochurePreview isLoading />)

    // Debe mostrar el mensaje de generación
    expect(screen.getByText(/generating brochure/i)).toBeInTheDocument()
    
    // Debe mostrar el icono de Sparkles (como SVG, no img)
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
  })

  it('intenta descargar cuando hay cacheKey', async () => {
    // Mock successful download result
    mockDownloadPdf.mockResolvedValueOnce({
      success: true,
      blob: makePdfBlob(),
      filename: 'brochure.pdf',
    })

    await withBlobUrlSpies(async () => {
      renderWithProviders(<BrochurePreview />)

      // Click the download button specifically
      const downloadBtn = selectButtonByName(/download pdf/i)
      await userEvent.click(downloadBtn)

      // Wait for the download to complete
      await waitFor(() => {
        expect(mockDownloadPdf).toHaveBeenCalledWith('cache-prev')
      })
    })
  })

  it('muestra toast de error si la descarga falla (EN)', async () => {
    // Forzar fallo de descarga
    mockDownloadPdf.mockResolvedValueOnce({ success: false })

    // Espiar el toast y evitar ejecutar la implementación real
    const toastSpy = vi.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL')

    renderWithProviders(<BrochurePreview />)

    const downloadBtn = selectButtonByName(/download pdf/i)
    await userEvent.click(downloadBtn)

    await waitFor(() => {
      expect(mockDownloadPdf).toHaveBeenCalledWith('cache-prev')
      expect(toastSpy).toHaveBeenCalledWith(PREVIEW_TEXT.en.errorTitle, PREVIEW_TEXT.en.errorDescription)
      expect(createUrlSpy).not.toHaveBeenCalled()
    })

    toastSpy.mockRestore()
    createUrlSpy.mockRestore()
  })

  it('muestra toast traducido a ES si la descarga falla', async () => {
    // Forzar fallo de descarga
    mockDownloadPdf.mockResolvedValueOnce({ success: false })

    const toastSpy = vi.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})
    const createUrlSpy = vi.spyOn(URL, 'createObjectURL')

    renderWithProviders(<BrochurePreview />)

    await act(async () => {
      await setLanguage('es')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    const downloadBtn = selectButtonByName(/descargar pdf/i)
    await userEvent.click(downloadBtn)

    await waitFor(() => {
      expect(mockDownloadPdf).toHaveBeenCalledWith('cache-prev')
      expect(toastSpy).toHaveBeenCalledWith(PREVIEW_TEXT.es.errorTitle, PREVIEW_TEXT.es.errorDescription)
      expect(createUrlSpy).not.toHaveBeenCalled()
    })

    toastSpy.mockRestore()
    createUrlSpy.mockRestore()
  })
})