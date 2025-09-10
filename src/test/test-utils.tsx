import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Providers } from '../providers'

export const renderWithProviders = (ui: ReactElement, options?: Parameters<typeof render>[1]) =>
  render(ui, { wrapper: Providers as React.ComponentType, ...options })
