import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../test/test-utils'
import { BrochurePreview } from '../BrochurePreview'
import { useBrochureStore } from '../../../stores/useBrochureStore'
import { describe, beforeEach, it, expect, vi } from 'vitest'
import type { BrochureState } from '../../../stores/useBrochureStore'
import { setLanguage, selectButtonByName, makePdfBlob, withBlobUrlSpies } from '../../../test/test-helpers'

// Mock the useBrochureDownload hook
const mockDownloadPdf = vi.fn()
vi.mock('../../../hooks/useBrochureDownload', () => ({
  useBrochureDownload: () => ({
    isDownloading: false,
    downloadPdf: mockDownloadPdf,
  }),
}))

// Helper para estado inicial del store
const setupStore = () => {
  const { setBrochure, setCacheKey, setCompanyName } = useBrochureStore.getState() as BrochureState
  setCompanyName('Acme Inc')
  setBrochure('<html><body><h1>Preview</h1></body></html>')
  setCacheKey('cache-123')
}

describe('BrochurePreview', () => {
  beforeEach(async () => {
    // reset store state between tests
    useBrochureStore.setState({ companyName: '', brochure: '', cacheKey: '' })

    // Reset language to English before each test
    await setLanguage('en')

    // Reset mocks
    mockDownloadPdf.mockReset()

    setupStore()
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
    useBrochureStore.setState({ companyName: '', brochure: '', cacheKey: '' })
    renderWithProviders(<BrochurePreview />)

    // The download button should be disabled when there's no brochure/cache
    const downloadBtn = selectButtonByName(/download pdf/i)
    expect(downloadBtn).toBeDisabled()
  })

  it('muestra skeleton y no muestra iframe cuando isLoading es true', () => {
    renderWithProviders(<BrochurePreview isLoading />)

    // No debe renderizar el iframe de la vista previa mientras carga
    expect(screen.queryByTitle('Brochure preview')).not.toBeInTheDocument()

    // Mientras carga, el botón de descarga debe estar deshabilitado
    const downloadBtn = selectButtonByName(/download pdf/i)
    expect(downloadBtn).toBeDisabled()
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
        expect(mockDownloadPdf).toHaveBeenCalledWith('cache-123')
      })
    })
  })
})