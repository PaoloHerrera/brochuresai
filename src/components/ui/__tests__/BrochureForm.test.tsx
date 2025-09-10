import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import BrochureForm from '../BrochureForm'
import { renderWithProviders } from '../../../test/test-utils'
import { setLanguage, selectButtonByName } from '../../../test/test-helpers'
import { useBrochuresRemainingStore } from '../../../stores/useBrochuresRemaining'

// Utilidad para montar el componente con props mínimas
const renderForm = (overrides: Partial<Parameters<typeof BrochureForm>[0]> = {}) => {
  const props = {
    isLoading: false,
    companyName: 'Acme Inc',
    url: 'https://acme.com',
    language: 'en' as const,
    brochureType: 'professional' as const,
    onCompanyNameChange: vi.fn(),
    onUrlChange: vi.fn(),
    onLanguageChange: vi.fn(),
    onBrochureTypeChange: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  }

  const utils = renderWithProviders(<BrochureForm {...props} />)
  return { ...utils, props }
}

describe('BrochureForm (presentacional)', () => {
  beforeEach(async () => {
    // Asegurar idioma en inglés para textos predecibles
    await setLanguage('en')
    // Por defecto permitir generar (restantes > 0)
    useBrochuresRemainingStore.setState({ brochuresRemaining: 3 })
  })

  it('renderiza valores iniciales y propaga onChange para inputs de texto', async () => {
    const { props } = renderForm({ companyName: 'My Co', url: 'https://example.com' })

    const nameInput = screen.getByPlaceholderText(/my company/i)
    const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i)

    // Valores iniciales visibles
    expect(nameInput).toHaveValue('My Co')
    expect(urlInput).toHaveValue('https://example.com')

    // Cambios disparan callbacks
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Acme')
    await userEvent.clear(urlInput)
    await userEvent.type(urlInput, 'https://acme.com')

    // Últimos valores pasados a los handlers
    expect(props.onCompanyNameChange).toHaveBeenCalled()
    expect(props.onUrlChange).toHaveBeenCalled()

    // Botón de submit visible con el texto traducido
    expect(selectButtonByName(/generate brochure/i)).toBeInTheDocument()
  })

  it('deshabilita inputs y botón cuando isLoading=true', () => {
    renderForm({ isLoading: true })

    const nameInput = screen.getByPlaceholderText(/my company/i)
    const urlInput = screen.getByPlaceholderText(/https:\/\/example\.com/i)

    // Inputs deshabilitados
    expect(nameInput).toBeDisabled()
    expect(urlInput).toBeDisabled()

    // Botón deshabilitado
    const submitBtn = selectButtonByName(/generate brochure/i)
    expect(submitBtn).toBeDisabled()
  })

  it('llama a onSubmit al enviar el formulario', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    const submitBtn = selectButtonByName(/generate brochure/i)
    await userEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})