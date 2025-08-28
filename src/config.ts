// Centralized app configuration
// Read environment variables exposed by Vite (must be prefixed with VITE_)
// Provide sensible defaults for local development

export const API_BASE_URL = (import.meta as ImportMeta).env?.VITE_API_BASE_URL ?? 'http://localhost:8000'
export const GITHUB_URL = (import.meta as ImportMeta).env?.VITE_GITHUB_URL ?? 'https://github.com'