import { useEffect, useRef, useState } from 'react'
import { apiPost } from '../services/http'
import type { DownloadResult } from '../types'

export const useBrochureDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
    }
  }, [])

  const downloadPdf = async (cacheKey: string): Promise<DownloadResult> => {
    setIsDownloading(true)

    // Cancel any previous in-flight download before starting a new one
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const response = await apiPost<Blob>(
        '/api/v1/download_brochure_pdf',
        { cache_key: cacheKey },
        {
          responseType: 'blob',
          headers: { Accept: 'application/pdf' },
          signal: controller.signal,
          timeout: 10_000, // 10s timeout for download
        }
      )

      // Intentar extraer filename del header Content-Disposition
      const disposition = response.headers['content-disposition'] as string | undefined
      let filename = 'brochure.pdf'
      if (disposition) {
        const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '')
        }
      }

      return { success: true, blob: response.data, filename }
    } catch (error) {
      // El mock global expone default.isAxiosError y named isAxiosError; usamos el named re-export implícito
      // para que tests reconozcan cancelaciones/timeouts adecuadamente si fuera necesario.
      // No cambiamos la forma de devolver status.
      // importación implícita via apiPost -> axios; verificamos status si existe.
      const maybeAxios = error as { response?: { status?: number } }
      return { success: false, status: maybeAxios.response?.status, error }
    } finally {
      setIsDownloading(false)
      controllerRef.current = null
    }
  }

  return { isDownloading, downloadPdf }
}