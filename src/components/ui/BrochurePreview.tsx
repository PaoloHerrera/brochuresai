import { Button } from '@heroui/react'
import { FileDown } from 'lucide-react'
import { useBrochureStore } from "../../stores/useBrochureStore";
import { useLanguageStore } from "../../stores/useLanguageStore";
import axios from 'axios';



export const BrochurePreview = () => {
  const { brochure, cacheKey } = useBrochureStore()
  const { language } = useLanguageStore()

  const downloadLabel = language === 'es' ? 'Descargar PDF' : 'Download PDF'
  const titleLabel = language === 'es' ? 'Vista previa del folleto' : 'Brochure preview'

  const handleDownloadPdf = async () => {
    
    try {
      /* ENVÍO DE LAS DATOS AL SERVIDOR */

      // Se obtiene la respuesta del servidor. El archivo PDF se descarga en el navegador
      const response = await axios.post('http://localhost:8000/api/v1/download_brochure_pdf', {
        "cache_key": cacheKey,
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      })
      
      // Obtener el nombre del archivo
      const disposition = response.headers['content-disposition']
      let filename = 'brochure.pdf'
      
      // Si el nombre del archivo está en la cabecera de la respuesta, entonces se extrae
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].split(';')[0]
      }

      // Crear un enlace para descargar el archivo
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      link.download = filename
      link.click()
      link.remove()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error(error)
      alert('Error al descargar el PDF')
    }
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-white/80 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 backdrop-blur">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{titleLabel}</div>
        <Button
          size="sm"
          radius="full"
          isDisabled={!brochure}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
          startContent={<FileDown size={16} />}
          onPress={handleDownloadPdf}
        >
          {downloadLabel}
        </Button>
      </div>
      <iframe
        className="w-full min-h-[24rem] h-[70vh] bg-white overflow-auto"
        title="Brochure preview"
        srcDoc={brochure ?? ''}
        sandbox=""
        loading="lazy"
      />
    </div>
  )
}