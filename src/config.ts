// Centralized app configuration
// Read environment variables exposed by Vite (must be prefixed with VITE_)
// Provide sensible defaults for local development

interface Env {
  VITE_API_BASE_URL: string
  VITE_GITHUB_URL: string
}

export const API_BASE_URL = (import.meta as unknown as { env: Env }).env.VITE_API_BASE_URL ?? 'http://localhost:8000'
export const GITHUB_URL = (import.meta as unknown as { env: Env }).env.VITE_GITHUB_URL ?? 'https://github.com'

// Network timeouts (ms)
export const TIMEOUTS = {
  submitMs: 120_000, // 120s timeout for brochure generation
  downloadMs: 10_000, // 10s timeout for PDF download
} as const