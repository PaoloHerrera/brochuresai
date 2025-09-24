import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from '@heroui/toast'
import type { ReactNode } from 'react'


export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <HeroUIProvider>
      <ToastProvider/>
      {children}
    </HeroUIProvider>
  )
}
