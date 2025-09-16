import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { API_BASE_URL } from '../config'

const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url)

export const buildUrl = (pathOrUrl: string) => {
  if (isAbsoluteUrl(pathOrUrl)) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${API_BASE_URL}${path}`
}

export const apiGet = async <T = unknown>(pathOrUrl: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const url = buildUrl(pathOrUrl)
  return axios.get<T>(url, { ...(config ?? {}) })
}

export const apiPost = async <T = unknown>(pathOrUrl: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const url = buildUrl(pathOrUrl)
  return axios.post<T>(url, data, { ...(config ?? {}) })
}

// Re-export for convenience where needed
export { isAxiosError } from 'axios'

// ------------------------------
// Error helpers
// ------------------------------
export const getStatus = (err: unknown): number | undefined => {
  // Use axios.isAxiosError via re-export to avoid importing axios directly in callers
  try {
    // dynamic import guard for tests where err is a plain object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyErr = err as any
    if (anyErr && (anyErr.isAxiosError || (anyErr.response && typeof anyErr.response.status !== 'undefined'))) {
      return anyErr.response?.status as number | undefined
    }
  } catch {
    // ignore
  }
  return undefined
}

export const isCanceledError = (err: unknown): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any
  return !!anyErr && (anyErr.code === 'ERR_CANCELED' || anyErr.name === 'CanceledError')
}

export const isTimeoutError = (err: unknown): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any
  return !!anyErr && anyErr.code === 'ECONNABORTED'
}