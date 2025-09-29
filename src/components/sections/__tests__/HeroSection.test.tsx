import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '../../../test/test-utils'
import { HeroSection } from '../HeroSection'
import { useBrochureStore } from '../../../stores/useBrochureStore'
import { useLanguageStore } from '../../../stores/useLanguageStore'
import type { AxiosResponse } from '../../../test/test-helpers'
import { makeAxiosResponse, getSubmitButton, resetStores, seedRegenerateEN, fillFormEN, clickRegenerateEN, asAxios, silenceToasts } from '../../../test/test-helpers'
import type React from 'react'
import * as toasts from '../../../utils/toasts'
import { FORM_TEXT } from '../../../lang/form'
import { PREVIEW_TEXT } from '../../../lang/preview'

// Mock mínimo de @heroui/react para evitar warnings de atributos booleanos (p.ej. `inert`) en Tabs/Tab
vi.mock('@heroui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@heroui/react')>()

  type ChipProps = React.AriaAttributes & {
    className?: string
    children?: React.ReactNode
    startContent?: React.ReactNode
  }
  const Chip = ({ children, className, startContent, ...aria }: ChipProps) => {
    const ariaLabel = aria['aria-label']
    return (
      <span className={className} aria-label={ariaLabel} data-testid="mock-chip">
        {startContent}
        {children}
      </span>
    )
  }

  type TabsProps = React.HTMLAttributes<HTMLDivElement>
  const Tabs = ({ children, className, ...rest }: TabsProps) => {
    const ariaLabel = (rest as React.AriaAttributes)['aria-label']
    // No pasar props desconocidas al DOM para evitar warnings
    return (
      <div data-testid="mock-tabs" className={className} aria-label={ariaLabel}>
        {children}
      </div>
    )
  }

  type TabProps = React.HTMLAttributes<HTMLDivElement>
  const Tab = ({ children, className }: TabProps) => {
    // Ignorar props como title, isDisabled, etc. sólo renderizamos el contenido
    return (
      <div data-testid="mock-tab" className={className}>
        {children}
      </div>
    )
  }
  return {
    ...actual,
    Chip,
    Tabs,
    Tab,
  }
})

// const asAxios = () => (axios as unknown as { post: ReturnType<typeof vi.fn> })

// Tipos auxiliares para respuestas simuladas de la API
interface ApiGenerateResponse {
  brochure: string
  cache_key: string
  brochures_remaining: number
}

describe('HeroSection - guards de isLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
    // Asegurar idioma EN para textos y placeholders esperados
    useLanguageStore.setState({ language: 'en', setLanguage: useLanguageStore.getState().setLanguage })
    // Evitar renders de toasts reales en estos tests de guards
    silenceToasts()
  })

  it('ignora segundo submit cuando isLoading es true (no hay doble llamada a axios)', async () => {
    const { container } = renderWithProviders(<HeroSection />)

    // Rellenar campos mínimos
    const { submitBtn } = await fillFormEN(container)

    // Promesa controlada para simular request en curso
    let resolvePost!: (value: AxiosResponse<ApiGenerateResponse>) => void
    const pending: Promise<AxiosResponse<ApiGenerateResponse>> = new Promise((res) => {
      resolvePost = res
    })
    asAxios().post.mockImplementationOnce(() => pending as unknown as Promise<AxiosResponse<ApiGenerateResponse>>)

    // Primer click -> dispara submit, setea isLoading=true dentro del hook
    await userEvent.click(submitBtn)

    // Segundo click inmediato debe ser ignorado por el guard de HeroSection (isLoading)
    await userEvent.click(submitBtn)

    // Sólo una llamada a axios.post mientras la primera sigue pendiente
    expect(asAxios().post).toHaveBeenCalledTimes(1)

    // Resolver la primera petición para no dejar el test colgado
    resolvePost(
      makeAxiosResponse({
        brochure: '<html><body>ok</body></html>',
        cache_key: 'cache-guard-1',
        brochures_remaining: 4,
      })
    )

    // Espera a que los stores se actualicen por el flujo feliz
    await waitFor(() => {
      expect(useBrochureStore.getState().cacheKey).toBe('cache-guard-1')
      expect(useBrochureStore.getState().brochure).toContain('<html>')
    })
  })
  
  it('ignora Regenerate cuando isLoading es true (no hay doble llamada a axios)', async () => {
    // Prepara el store con datos mínimos para que handleRegenerate sea válido
    useBrochureStore.setState({
      companyName: 'Acme Inc',
      url: 'https://acme.com',
      language: 'en',
      brochure: '<html><body>preview</body></html>',
      brochureType: 'professional',
      cacheKey: 'cache-xyz',
      setBrochure: useBrochureStore.getState().setBrochure,
      setUrl: useBrochureStore.getState().setUrl,
      setLanguage: useBrochureStore.getState().setLanguage,
      setBrochureType: useBrochureStore.getState().setBrochureType,
      setCompanyName: useBrochureStore.getState().setCompanyName,
      setCacheKey: useBrochureStore.getState().setCacheKey,
      setLastSubmission: useBrochureStore.getState().setLastSubmission,
    })

    const { container } = renderWithProviders(<HeroSection />)

    // Rellenar los campos del formulario para que el submit sea válido
    const nameInput = screen.getByPlaceholderText(/my company/i)
    const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Acme Inc')
    await userEvent.clear(urlInput)
    await userEvent.type(urlInput, 'https://acme.com')

    // Promesa controlada para la primera petición (deja isLoading=true)
    let resolvePost!: (value: AxiosResponse<ApiGenerateResponse>) => void
    const pending: Promise<AxiosResponse<ApiGenerateResponse>> = new Promise((res) => {
      resolvePost = res
    })
    asAxios().post.mockImplementationOnce(() => pending as unknown as Promise<AxiosResponse<ApiGenerateResponse>>)

    // Inicia la primera petición via Submit
    const submitBtn = getSubmitButton(container)
    await userEvent.click(submitBtn)

    // Verificar que el botón Regenerate no está disponible durante la carga
    await waitFor(() => {
      const regenerateBtn = screen.queryByRole('button', { name: new RegExp(PREVIEW_TEXT.en.regenerateLabel, 'i') })
      expect(regenerateBtn).not.toBeInTheDocument()
    })

    // Asegura que solo hay una llamada a axios.post (la del submit)
    expect(asAxios().post).toHaveBeenCalledTimes(1)

    // Resuelve la petición pendiente
    resolvePost(
      makeAxiosResponse({
        brochure: '<html><body>ok</body></html>',
        cache_key: 'cache-regen-1',
        brochures_remaining: 4,
      })
    )

    await waitFor(() => {
      expect(useBrochureStore.getState().cacheKey).toBe('cache-regen-1')
      expect(useBrochureStore.getState().brochure).toContain('<html>')
    })
  })
})

describe('HeroSection - toasts', () => {
  beforeEach(() => {
    // Restaurar cualquier spy previo de otros describes y limpiar contadores
    vi.restoreAllMocks()
    vi.clearAllMocks()
    resetStores()
    // Asegurar idioma EN para casos que validan textos EN; cada test ajusta idioma si requiere ES
    useLanguageStore.setState({ language: 'en', setLanguage: useLanguageStore.getState().setLanguage })
  })

  it('handleRegenerate sin valores previos muestra toast de error de regeneración (EN)', async () => {
    const toastSpy = vi.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})

    renderWithProviders(<HeroSection />)

    await clickRegenerateEN()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(PREVIEW_TEXT.en.errorTitleRegenerate, PREVIEW_TEXT.en.errorDescriptionRegenerate)
      expect(asAxios().post).not.toHaveBeenCalled()
    })

    toastSpy.mockRestore()
  })

  it('submit fails with 429 shows limit toast (EN)', async () => {
    const toastSpy = vi.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})

    const { container } = renderWithProviders(<HeroSection />)

    asAxios().post.mockRejectedValueOnce({ isAxiosError: true, response: { status: 429 } })

    const { submitBtn } = await fillFormEN(container)
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(FORM_TEXT.en.limitBrochuresTitle, FORM_TEXT.en.limitBrochuresDescription)
      expect(asAxios().post).toHaveBeenCalledTimes(1)
    })

    toastSpy.mockRestore()
  })

  it('regenerate fails with 429 shows limit toast (EN)', async () => {
    const toastSpy = vi.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})

    // Prepara el store con datos válidos para regenerate en EN
    seedRegenerateEN()

    renderWithProviders(<HeroSection />)

    asAxios().post.mockRejectedValueOnce({ isAxiosError: true, response: { status: 429 } })

    await clickRegenerateEN()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(FORM_TEXT.en.limitBrochuresTitle, FORM_TEXT.en.limitBrochuresDescription)
      expect(asAxios().post).toHaveBeenCalledTimes(1)
    })

    toastSpy.mockRestore()
  })

  it('submit success shows success toast (EN)', async () => {
    const toastSpy = vi.spyOn(toasts, 'showSuccessToast').mockImplementation(async () => {})

    const { container } = renderWithProviders(<HeroSection />)

    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse({ brochure: '<html>ok</html>', cache_key: 'cache-ok-1', brochures_remaining: 4 })
    )

    const { submitBtn } = await fillFormEN(container)
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(FORM_TEXT.en.successTitle, FORM_TEXT.en.successDescription)
      expect(asAxios().post).toHaveBeenCalledTimes(1)
    })

    toastSpy.mockRestore()
  })

  it('regenerate success shows success toast (EN)', async () => {
    const toastSpy = vi.spyOn(toasts, 'showSuccessToast').mockImplementation(async () => {})

    // Prepara el store con datos válidos para regenerate
    seedRegenerateEN()

    renderWithProviders(<HeroSection />)

    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse({ brochure: '<html>ok</html>', cache_key: 'cache-ok-2', brochures_remaining: 3 })
    )

    await clickRegenerateEN()

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(FORM_TEXT.en.successTitle, FORM_TEXT.en.successDescription)
      expect(asAxios().post).toHaveBeenCalledTimes(1)
    })

    toastSpy.mockRestore()
  })

  it('submit fails with 500 shows error toast (EN)', async () => {
    const toastSpy = vi.spyOn(toasts, 'showErrorToast').mockImplementation(async () => {})

    const { container } = renderWithProviders(<HeroSection />)

    asAxios().post.mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } })

    const { submitBtn } = await fillFormEN(container)
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(FORM_TEXT.en.errorTitle, FORM_TEXT.en.errorDescription)
      expect(asAxios().post).toHaveBeenCalledTimes(1)
    })

    toastSpy.mockRestore()
  })
})