import type { FC } from 'react'
import { Button, Skeleton } from '@heroui/react'
import { FileDown, RotateCcw } from 'lucide-react'
import { showErrorToast } from '../../utils/toasts'
import { useBrochureStore } from '../../stores/useBrochureStore'
import { useBrochureDownload } from '../../hooks/useBrochureDownload'
import { useTranslate } from '../../hooks/useTranslate'
import { PREVIEW_TEXT } from '../../lang/preview'

export const BrochurePreview: FC<{ isLoading?: boolean; onRegenerate?: () => void | Promise<void> }> = ({ isLoading = false, onRegenerate }) => {
  const { brochure, cacheKey } = useBrochureStore()
  const { isDownloading, downloadPdf } = useBrochureDownload()
  const { t } = useTranslate(PREVIEW_TEXT)

  const handleDownloadPdf = async () => {
    if (!cacheKey) return
    const result = await downloadPdf(cacheKey)

    if (!result.success) {
      void showErrorToast(t.errorTitle, t.errorDescription)
      return
    }

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
        {/* Botón de "volver a generar" responsivo: icon-only en mobile */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            radius="full"
            variant="flat"
            isDisabled={isLoading}
            aria-label={t.regenerateLabel}
            title={t.regenerateLabel}
            className="border border-slate-200 dark:border-slate-700 bg-cyan-600 hover:bg-cyan-700 text-white px-2 sm:px-4"
            startContent={<RotateCcw size={16} aria-hidden="true" focusable="false" />}
            onPress={() => { void onRegenerate?.() }}
            isLoading={isLoading}
          >
            <span className="hidden sm:inline">{t.regenerateLabel}</span>
          </Button>
        </div>
        <Button
          size="sm"
          radius="full"
          isDisabled={isDownloadDisabled}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 px-2 sm:px-4"
          startContent={<FileDown size={16} aria-hidden="true" focusable="false" />}
          onPress={() => void handleDownloadPdf()}
          isLoading={isDownloading}
          aria-label={t.downloadLabel}
          title={t.downloadLabel}
        >
          <span className="hidden sm:inline">{t.downloadLabel}</span>
        </Button>
      </div>

      {isLoading ? (
        // Skeleton más realista tipo folleto
        <div className="block w-full max-w-full min-h-[24rem] h-[70vh] bg-white dark:bg-slate-900 overflow-auto p-5 sm:p-6 lg:p-8" aria-hidden>
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Cabecera: título + subtítulo */}
            <div className="space-y-3">
              <Skeleton className="h-8 sm:h-10 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-4/5 rounded-lg" />
            </div>

            {/* Imagen/hero destacada */}
            <Skeleton className="h-48 sm:h-56 w-full rounded-xl" />

            {/* Cuerpo en dos columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Columna principal (texto) */}
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-6 w-1/3 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-11/12 rounded-lg" />
                  <Skeleton className="h-4 w-10/12 rounded-lg" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-9/12 rounded-lg" />
                  <Skeleton className="h-4 w-8/12 rounded-lg" />
                </div>

                {/* Lista de viñetas simulada */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-3/5 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Skeleton className="h-10 w-32 rounded-full" />
                  <Skeleton className="h-10 w-40 rounded-full" />
                </div>
              </div>

              {/* Columna lateral (tarjeta de características) */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/2 rounded-lg" />
                <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/5 rounded-lg" />
                      <Skeleton className="h-3 w-2/5 rounded-lg" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-10/12 rounded-lg" />
                  <Skeleton className="h-4 w-8/12 rounded-lg" />
                  <div className="pt-2">
                    <Skeleton className="h-9 w-32 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de features en tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {[0,1,2].map((i) => (
                <div key={i} className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-1/2 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-10/12 rounded-lg" />
                  <Skeleton className="h-4 w-8/12 rounded-lg" />
                </div>
              ))}
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