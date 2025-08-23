import { useTranslate } from '../../hooks/useTranslate'
import { HEROTEXT } from '../../lang/hero'
import { Chip, Tabs, Tab } from '@heroui/react'
import { Sparkles, Zap, CheckCircle2, BookOpen, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'

import BrochureForm from '../ui/BrochureForm'
import { useBrochureStore } from '../../stores/useBrochureStore'

import { BrochurePreview } from '../ui/BrochurePreview'

export const HeroSection = () => {
  const { t } = useTranslate(HEROTEXT)

  const { brochure } = useBrochureStore()

  const chipIcons = [
    <CheckCircle2 key="c1" size={14} />, 
    <Sparkles key="c2" size={14} />, 
    <Zap key="c3" size={14} />,
  ]

  // Estado controlado para Tabs. Por defecto, formulario.
  const [selectedTab, setSelectedTab] = useState<'brochure-form' | 'brochure-preview'>('brochure-form')

  // Cuando llegue contenido al brochure por primera vez (o cambie), cambia a preview automáticamente.
  useEffect(() => {
    if (brochure.length > 0) {
      setSelectedTab('brochure-preview')
    } else {
      setSelectedTab('brochure-form')
    }
  }, [brochure])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto py-14 px-4 sm:px-6 lg:px-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-center">
          {/* Columna izquierda: Título + Descripción + Chips */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t.title}
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg max-w-xl">{t.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {t.chips.map((chip, idx) => (
                <Chip
                  key={chip}
                  variant="flat"
                  color="primary"
                  className="bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 backdrop-blur rounded-full"
                  startContent={chipIcons[idx % chipIcons.length]}
                >
                  <span className="font-medium text-xs sm:text-sm">{chip}</span>
                </Chip>
              ))}
            </div>
          </div>

          {/* Columna derecha: Formulario dentro de un contenedor con badge */}
          <div className="relative w-full max-w-3xl lg:ml-auto">
            <Tabs aria-label='brochure-tabs' classNames={
              {
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-[#22d3ee]",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-[#06b6d4]",
              }}
                color="primary"
                variant="underlined"
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(String(key) as 'brochure-form' | 'brochure-preview')}
                destroyInactiveTabPanel={false}
              >
              <Tab key="brochure-form" title={
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.brochureFormTab}
                  </span>
                </div>
              }>
                <BrochureForm />
              </Tab>
              <Tab key="brochure-preview" title={
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.brochurePreviewTab}
                  </span>
                </div>
              }
              isDisabled={brochure.length === 0}
              >
                <div className="w-full">
                  <BrochurePreview />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Decoración sutil */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-3xl" />
    </section>
  )
}
