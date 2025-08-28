import { Button, addToast } from '@heroui/react'
import { FileDown, CircleX } from 'lucide-react'
import { useBrochureStore } from '../../stores/useBrochureStore'
import { useBrochureDownload } from '../../hooks/useBrochureDownload'
import { useTranslate } from '../../hooks/useTranslate'
import { PREVIEW_TEXT } from '../../lang/preview'

export const BrochurePreview = () => {
  const { brochure, cacheKey } = useBrochureStore()
  const { isDownloading, downloadPdf } = useBrochureDownload()
  const { t } = useTranslate(PREVIEW_TEXT)

  const handleDownloadPdf = async () => {
    if (!cacheKey) return
    const result = await downloadPdf(cacheKey)

    if (!result.success) {
      addToast({
        title: t.errorTitle,
        description: t.errorDescription,
        color: 'danger',
        icon: <CircleX color="white" />,
      })
      return
    }

    // Crear un enlace para descargar el archivo
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([result.blob], { type: 'application/pdf' }))
    link.download = result.filename
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white/80 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 backdrop-blur">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.title}</div>
        <Button
          size="sm"
          radius="full"
          isDisabled={!brochure || isDownloading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
          startContent={<FileDown size={16} />}
          onPress={handleDownloadPdf}
          isLoading={isDownloading}
        >
          {t.downloadLabel}
        </Button>
      </div>
      <iframe
        className="block w-full max-w-full min-h-[24rem] h-[70vh] bg-white overflow-auto"
        title={t.iframeTitle}
        srcDoc={brochure ?? ''}
        sandbox=""
        loading="lazy"
      />
    </div>
  )
}