import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'

import { renderWithProviders } from '../../../test/test-utils'
import { HeroSection } from '../HeroSection'
import { useBrochureStore } from '../../../stores/useBrochureStore'
import { useBrochuresRemainingStore } from '../../../stores/useBrochuresRemaining'
import { useAnonUserIdStore } from '../../../stores/useAnonUserId'
import { useLanguageStore } from '../../../stores/useLanguageStore'
import type { AxiosResponse } from '../../../test/test-helpers'
import { makeAxiosResponse, getSubmitButton, selectButtonByName } from '../../../test/test-helpers'
import type React from 'react'

vi.mock('axios', () => {
  const post = vi.fn()
  const mocked = {
    default: { post },
    post,
    isAxiosError: (err: unknown) => !!err && typeof err === 'object' && 'isAxiosError' in err,
  }
  return mocked as unknown as typeof axios
})

// Mock mínimo de @heroui/react que preserva atributos data-* para poder inspeccionar pestañas
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
    // Preservamos data-selected y data-testid agregadas por el componente
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    )
  }

  type TabProps = React.HTMLAttributes<HTMLDivElement>
  const Tab = ({ children, className }: TabProps) => {
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

const asAxios = () => (axios as unknown as { post: ReturnType<typeof vi.fn> })

// Tipos auxiliares para respuestas simuladas de la API
interface ApiGenerateResponse {
  brochure: string
  cache_key: string
  brochures_remaining: number
}

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
  useBrochuresRemainingStore.setState({ brochuresRemaining: 5, setBrochuresRemaining: useBrochuresRemainingStore.getState().setBrochuresRemaining })
  useAnonUserIdStore.setState({ anonUserId: 'anon-123', setAnonUserId: useAnonUserIdStore.getState().setAnonUserId })
}

const fillForm = async (container: HTMLElement, { name, url }: { name: string; url: string }) => {
  const nameInput = screen.getByPlaceholderText(/my company/i)
  const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i)
  await userEvent.clear(nameInput)
  await userEvent.type(nameInput, name)
  await userEvent.clear(urlInput)
  await userEvent.type(urlInput, url)
  const submitBtn = getSubmitButton(container)
  return { submitBtn }
}

const getSelectedTabKey = () => {
  const tabs = screen.getByTestId('hero-tabs') as HTMLElement
  return tabs.getAttribute('data-selected')
}

describe('HeroSection - integración (tabs y regenerate)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetStores()
    // EN para textos/placeholder
    useLanguageStore.setState({ language: 'en', setLanguage: useLanguageStore.getState().setLanguage })
  })

  it('submit correcto: cambia a preview y permanece allí tras éxito', async () => {
    const { container } = renderWithProviders(<HeroSection />)

    // Mock éxito inmediato
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>ok</body></html>',
        cache_key: 'cache-xyz',
        brochures_remaining: 4,
      })
    )

    const { submitBtn } = await fillForm(container, { name: 'Acme Inc', url: 'https://acme.com' })

    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(getSelectedTabKey()).toBe('brochure-preview')
    })
  })

  it('submit falla: cambia a preview y luego vuelve a form', async () => {
    const { container } = renderWithProviders(<HeroSection />)

    // Promesa controlada
    let rejectPost!: (reason?: unknown) => void
    const pending = new Promise<AxiosResponse<ApiGenerateResponse>>((_, rej) => {
      rejectPost = rej
    })
    asAxios().post.mockImplementationOnce(() => pending as unknown as Promise<AxiosResponse<ApiGenerateResponse>>)

    const { submitBtn } = await fillForm(container, { name: 'Acme Inc', url: 'https://acme.com' })

    await userEvent.click(submitBtn)

    // Durante la petición, debe estar en preview
    expect(getSelectedTabKey()).toBe('brochure-preview')

    // Ahora rechazamos
    rejectPost({ isAxiosError: true, response: { status: 500 } })

    await waitFor(() => {
      expect(getSelectedTabKey()).toBe('brochure-form')
    })
  })

  it('Regenerate usa la última sumisión válida del store y dispara submit', async () => {
    const { container } = renderWithProviders(<HeroSection />)

    // 1) Primera sumisión exitosa
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>ok</body></html>',
        cache_key: 'cache-1',
        brochures_remaining: 4,
      })
    )

    const { submitBtn } = await fillForm(container, { name: 'Acme Inc', url: 'https://acme.com' })
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-preview'))

    // 2) El usuario cambia campos del formulario (estado local), pero NO enviamos
    const nameInput = screen.getByPlaceholderText(/my company/i)
    const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Changed Co')
    await userEvent.clear(urlInput)
    await userEvent.type(urlInput, 'https://changed.com')

    // 3) Preparar el mock para la regeneración y click en Regenerate
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>ok-2</body></html>',
        cache_key: 'cache-2',
        brochures_remaining: 3,
      })
    )

    const regenerateBtn = selectButtonByName(/regenerate brochure/i)
    await userEvent.click(regenerateBtn)

    await waitFor(() => {
      // Debe permanecer/ir a preview
      expect(getSelectedTabKey()).toBe('brochure-preview')
      // Debe haberse llamado axios.post una segunda vez
      expect(asAxios().post).toHaveBeenCalledTimes(2)
    })

    // Verificar que la SEGUNDA llamada usó los valores del store (Acme Inc / https://acme.com), no los editados
    const secondCall = asAxios().post.mock.calls[1]
    const body = secondCall[1] as Record<string, unknown>
    expect(body.company_name).toBe('Acme Inc')
    expect(body.url).toBe('https://acme.com')
  })
})