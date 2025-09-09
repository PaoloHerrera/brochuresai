import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'

// Configure React Testing Library
configure({
  asyncUtilTimeout: 2000,
})

// Silencia el warning: "Received an empty string for a boolean attribute `inert`"
// Capturamos tanto console.error como console.warn y usamos coincidencia amplia
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

function shouldSilenceInertWarning(args: unknown[]) {
  const [message] = args as [unknown]
  if (typeof message !== 'string') return false
  const msg = message.toLowerCase()
  return msg.includes('inert') && msg.includes('boolean attribute')
}

console.error = (...args: unknown[]) => {
  if (shouldSilenceInertWarning(args)) return
  originalConsoleError(...(args as Parameters<typeof originalConsoleError>))
}

console.warn = (...args: unknown[]) => {
  if (shouldSilenceInertWarning(args)) return
  originalConsoleWarn(...(args as Parameters<typeof originalConsoleWarn>))
}

// Note: LazyMotion act() warnings are expected and can be safely ignored
// These come from Framer Motion's internal state management and are not actionable
// for application developers. The warnings don't indicate test failures or issues.

// Mock matchMedia for components/libraries that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock URL.createObjectURL and revokeObjectURL for PDF download tests
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: (blob: Blob) => `blob:${blob.size}`,
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: () => {},
})

// Mock HTMLAnchorElement.click to avoid jsdom navigation warnings
Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
  writable: true,
  value: function(this: HTMLAnchorElement) {
    // Simply mock the click without triggering actual navigation or events
    // This prevents the jsdom "Not implemented: navigation" warning
    // The test doesn't need to verify the actual click behavior, just that it was called
  },
})
