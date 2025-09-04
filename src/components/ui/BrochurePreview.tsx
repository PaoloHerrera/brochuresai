import type { FC } from 'react'
import { Button, Skeleton } from '@heroui/react'
import { FileDown } from 'lucide-react'
import { showErrorToast } from '../../utils/toasts'
import { useBrochureStore } from '../../stores/useBrochureStore'
import { useBrochureDownload } from '../../hooks/useBrochureDownload'
import { useTranslate } from '../../hooks/useTranslate'
import { PREVIEW_TEXT } from '../../lang/preview'

export const BrochurePreview: FC<{ isLoading?: boolean }> = ({ isLoading = false }) => {
  const { brochure, cacheKey } = useBrochureStore()
  const { isDownloading, downloadPdf } = useBrochureDownload()
  const { t } = useTranslate(PREVIEW_TEXT)

  const handleDownloadPdf = async () => {
    if (!cacheKey) return
    const result = await downloadPdf(cacheKey)

    if (!result.success) {
      showErrorToast(t.errorTitle, t.errorDescription)
      return
    }

    // Crear un enlace para descargar el archivo
    const link = document.createElement('a')
    const objectUrl = URL.createObjectURL(new Blob([result.blob], { type: 'application/pdf' }))
    link.href = objectUrl
    link.download = result.filename
    link.click()
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }

  const isDownloadDisabled = isLoading || !brochure || !cacheKey || isDownloading

  return (
    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900" aria-busy={isLoading}>
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white/80 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 backdrop-blur">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.title}</div>
        <Button
          size="sm"
          radius="full"
          isDisabled={isDownloadDisabled}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
          startContent={<FileDown size={16} />}
          onPress={handleDownloadPdf}
          isLoading={isDownloading}
        >
          {t.downloadLabel}
        </Button>
      </div>

      {isLoading ? (
        <div className="block w-full max-w-full min-h-[24rem] h-[70vh] bg-white dark:bg-slate-900 overflow-auto p-4">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-5/6 rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        <iframe
          className="block w-full max-w-full min-h-[24rem] h-[70vh] bg-white overflow-auto"
          title={t.iframeTitle}
          srcDoc={brochure ?? ''}
          sandbox=""
          loading="lazy"
        />
      )}
    </div>
  )
}