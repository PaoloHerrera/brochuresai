import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'

import { renderWithProviders } from '../../../test/test-utils'
import { HeroSection } from '../HeroSection'
import type { AxiosResponse } from '../../../test/test-helpers'
import { makeAxiosResponse, fillFormEN, clickRegenerateEN, getSelectedTabKey, resetStores, setLanguage, asAxios } from '../../../test/test-helpers'
// PREVIEW_TEXT ya es usado internamente por clickRegenerateEN

// Mock de @heroui/react que soporta selección por click y preserva atributos data-*
vi.mock('@heroui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@heroui/react')>()

  type ChipProps = React.AriaAttributes & {
    className?: string
    children?: React.ReactNode
    startContent?: React.ReactNode
  }
  const Chip = ({ children, className, startContent, ...aria }: ChipProps) => {
    const ariaLabel = (aria as React.AriaAttributes)['aria-label']
    return (
      <span className={className} aria-label={ariaLabel} data-testid="mock-chip">
        {startContent}
        {children}
      </span>
    )
  }

  type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
    selectedKey?: unknown
    onSelectionChange?: (key: unknown) => void
    destroyInactiveTabPanel?: boolean
    color?: unknown
    variant?: unknown
    classNames?: unknown
  }
  const Tabs = ({ children, className, ...rest }: TabsProps) => {
    // Preservamos data-* y aria-* pero filtramos props no válidas para evitar warnings
    const {
      selectedKey,
      onSelectionChange,
      destroyInactiveTabPanel,
      color,
      variant,
      classNames,
      ...domProps
    } = rest as TabsProps

    type TabChildProps = { isDisabled?: boolean; onClick?: () => void; 'data-selected'?: string }

    // Crear hijos mejorados que disparan onSelectionChange al click
    const enhancedChildren = React.Children.map(children, (child) => {
      if (!React.isValidElement<TabChildProps>(child)) return child
      const key = child.key
      const selectedKeyStr = selectedKey != null ? String(selectedKey) : ''
      const keyStr = key != null ? String(key) : ''
      const isSelected = keyStr === selectedKeyStr
      const isDisabled = child.props?.isDisabled
      const onClick = () => {
        if (isDisabled) return
        onSelectionChange?.(key)
      }
      return React.cloneElement(child, {
        onClick,
        'data-selected': isSelected ? 'true' : undefined,
      })
    })
    // Marcar como usadas para ESLint sin pasarlas al DOM
    void selectedKey; void onSelectionChange; void destroyInactiveTabPanel; void color; void variant; void classNames
    return (
      <div className={className} {...domProps}>
        {enhancedChildren}
      </div>
    )
  }

  type TabProps = React.HTMLAttributes<HTMLDivElement> & { title?: React.ReactNode; isDisabled?: boolean }
  const Tab = ({ children, className, title, isDisabled, ...rest }: TabProps) => {
    return (
      <div role="tab" aria-disabled={isDisabled ? 'true' : undefined} data-testid="mock-tab" className={className} {...rest}>
        {title}
        {children}
      </div>
    )
  }

  return { ...actual, Chip, Tabs, Tab }
})

interface ApiGenerateResponse {
  brochure: string
  cache_key: string
  brochures_remaining: number
}

describe('HeroSection - integración (tabs y regenerate)', () => {
  beforeEach(async () => {
    resetStores()
    await setLanguage('en')
  })

  it('submit genera brochure y activa pestaña preview; regenerate vuelve a generar', async () => {
    // Mock respuesta de /generate
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>preview</body></html>',
        cache_key: 'cache-123',
        brochures_remaining: 4,
      }) as unknown as AxiosResponse<ApiGenerateResponse>
    )

    const { container } = renderWithProviders(<HeroSection />)

    const { submitBtn } = await fillFormEN(container, { name: 'Acme', url: 'https://acme.com' })

    // Submit
    await userEvent.click(submitBtn)

    // Se espera cambio a tab preview
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-preview'))

    // Regenerate
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>preview v2</body></html>',
        cache_key: 'cache-456',
        brochures_remaining: 3,
      }) as unknown as AxiosResponse<ApiGenerateResponse>
    )

    await clickRegenerateEN()

    // Permanece en preview y se dispara una segunda solicitud
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-preview'))
    await waitFor(() => expect(asAxios().post).toHaveBeenCalledTimes(2))
  })

  it('permite navegar entre tabs con clicks tras generar un brochure', async () => {
    // Mock respuesta de /generate
    asAxios().post.mockResolvedValueOnce(
      makeAxiosResponse<ApiGenerateResponse>({
        brochure: '<html><body>preview</body></html>',
        cache_key: 'cache-123',
        brochures_remaining: 4,
      }) as unknown as AxiosResponse<ApiGenerateResponse>
    )

    const { container } = renderWithProviders(<HeroSection />)
    const { submitBtn } = await fillFormEN(container, { name: 'Acme', url: 'https://acme.com' })

    // Submit cambia a preview
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-preview'))

    // Click en "Brochure form" para volver al formulario
    await userEvent.click(screen.getByRole('tab', { name: /brochure form/i }))
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-form'))

    // Ahora que hay brochure, la pestaña Preview no está deshabilitada; volver a Preview
    await userEvent.click(screen.getByRole('tab', { name: /preview/i }))
    await waitFor(() => expect(getSelectedTabKey()).toBe('brochure-preview'))
  })
})