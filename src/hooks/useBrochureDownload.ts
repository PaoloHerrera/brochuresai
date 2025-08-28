import { useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config'

export type DownloadResult =
  | { success: true; blob: Blob; filename: string }
  | { success: false; status?: number; error?: unknown }

export const useBrochureDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadPdf = async (cacheKey: string): Promise<DownloadResult> => {
    setIsDownloading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/download_brochure_pdf`,
        { cache_key: cacheKey },
        {
          responseType: 'blob',
          headers: { Accept: 'application/pdf' },
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
      if (axios.isAxiosError(error)) {
        return { success: false, status: error.response?.status, error }
      }
      return { success: false, error }
    } finally {
      setIsDownloading(false)
    }
  }

  return { isDownloading, downloadPdf }
}