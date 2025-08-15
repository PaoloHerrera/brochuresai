export type UrlError = null | 'empty' | 'invalid' | 'noDomain' | 'noProtocol'

export function useUrlValidation(url: string): UrlError {
  if (!url || url.trim() === '') return 'empty'
  // Permitir www. sin protocolo
  if (/^www\.[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) {
    return null
  }
  try {
    const u = new URL(url)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return 'noProtocol'
    }
    if (!u.hostname || !u.hostname.includes('.')) {
      return 'noDomain'
    }
    return null
  } catch {
    return 'invalid'
  }
}
