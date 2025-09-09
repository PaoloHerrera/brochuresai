import { useTranslate } from '../../hooks/useTranslate'
import { HEROTEXT } from '../../lang/hero'
import { Chip, Tabs, Tab } from '@heroui/react'
import { Sparkles, Zap, CheckCircle2, BookOpen, Eye } from 'lucide-react'
import { useState } from 'react'

import BrochureForm from '../ui/BrochureForm'
import { useBrochureStore } from '../../stores/useBrochureStore'

import { BrochurePreview } from '../ui/BrochurePreview'
import { useBrochureSubmit } from '../../hooks/useBrochureSubmit'
import { showErrorToast, showSuccessToast } from '../../utils/toasts'
import { PREVIEW_TEXT } from '../../lang/preview'
import { FORM_TEXT } from '../../lang/form'
import type { LanguageStore } from '../../stores/useLanguageStore'

export const HeroSection = () => {
  const { t } = useTranslate(HEROTEXT)
  const { t: tPreview } = useTranslate(PREVIEW_TEXT)
  const { t: tForm } = useTranslate(FORM_TEXT)

  const { brochure, companyName, url, language, brochureType } = useBrochureStore()
  const { isLoading, submitBrochure } = useBrochureSubmit()

  // Estado del formulario controlado por el padre (inicializado desde el store)
  const [formCompanyName, setFormCompanyName] = useState<string>(companyName ?? '')
  const [formUrl, setFormUrl] = useState<string>(url ?? '')
  const [formLanguage, setFormLanguage] = useState<LanguageStore>(language)
  const [formType, setFormType] = useState<'professional' | 'funny'>(brochureType)

  const chipIcons = [
    <CheckCircle2 key="c1" size={14} />, 
    <Sparkles key="c2" size={14} />, 
    <Zap key="c3" size={14} />,
  ]

  // Estado controlado para Tabs. Por defecto, formulario.
  const [selectedTab, setSelectedTab] = useState<'brochure-form' | 'brochure-preview'>('brochure-form')

  const performSubmit = async (payload: { companyName: string; url: string; language: LanguageStore; brochureType: 'professional' | 'funny' }) => {
    const result = await submitBrochure(payload)
    if (!result.success) {
      if (result.status === 429) {
        showErrorToast(tForm.limitBrochuresTitle, tForm.limitBrochuresDescription)
      } else {
        showErrorToast(tForm.errorTitle, tForm.errorDescription)
      }
      return false
    }

    showSuccessToast(tForm.successTitle, tForm.successDescription)
    return true
  }

  const handleSubmit = async () => {
    // Si está cargando, no hacer nada
    if (isLoading) return

    setSelectedTab('brochure-preview')
    const ok = await performSubmit({
      companyName: formCompanyName,
      url: formUrl,
      language: formLanguage,
      brochureType: formType,
    })
    if (!ok) setSelectedTab('brochure-form')
  }

  const handleRegenerate = async () => {
    // Si está cargando, no hacer nada
    if (isLoading) return

    if (!companyName || !url) {
      showErrorToast(tPreview.errorTitleRegenerate, tPreview.errorDescriptionRegenerate)
      return
    }

    setFormCompanyName(companyName)
    setFormUrl(url)
    setFormLanguage(language)
    setFormType(brochureType)

    setSelectedTab('brochure-preview')
    const ok = await performSubmit({ companyName, url, language, brochureType })
    if (!ok) setSelectedTab('brochure-form')
  }

  return (
    <section className="relative overflow-hidden min-h-[calc(100svh-4rem)] py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 items-center px-6 sm:px-12 lg:px-14">
        {/* Columna izquierda: Título + Descripción + Chips */}
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-xl">{t.description}</p>
          <div className="flex flex-wrap gap-2.5 text-sm flex-col sm:flex-row items-center sm:items-start">
            {t.chips.map((chip, idx) => (
              <Chip
                key={chip}
                radius="sm"
                size="sm"
                variant="flat"
                startContent={chipIcons[idx % chipIcons.length]}
                aria-label={chip}
                classNames={{
                  base: "chip-base chip-accent",
                  content: "chip-content",
                }}
              >
                {chip}
              </Chip>
            ))}
          </div>
        </div>

        {/* Columna derecha: Formulario dentro de un contenedor con badge */}
        <div className="relative w-full lg:ml-auto overflow-hidden">
          <Tabs
            className="w-full"
            aria-label={t.tabsAria}
            classNames={{
              tabList: "w-full relative rounded-none p-0 mx-1 border-b border-divider gap-0",
              cursor: "w-full bg-[#22d3ee]",
              tabContent: "group-data-[selected=true]:text-[#06b6d4]",
            }}
            color="primary"
            variant="underlined"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(String(key) as 'brochure-form' | 'brochure-preview')}
            destroyInactiveTabPanel={false}
            data-testid="hero-tabs"
            data-selected={selectedTab}
          >
            <Tab
              key="brochure-form"
              title={
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.brochureFormTab}
                  </span>
                </div>
              }
            >
              <BrochureForm
                isLoading={isLoading}
                companyName={formCompanyName}
                url={formUrl}
                language={formLanguage}
                brochureType={formType}
                onCompanyNameChange={setFormCompanyName}
                onUrlChange={setFormUrl}
                onLanguageChange={setFormLanguage}
                onBrochureTypeChange={setFormType}
                onSubmit={handleSubmit}
              />
            </Tab>
            <Tab
              key="brochure-preview"
              title={
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t.brochurePreviewTab}
                  </span>
                </div>
              }
              isDisabled={brochure.length === 0 && !isLoading}
            >
              <div className="w-full overflow-x-hidden">
                <BrochurePreview isLoading={isLoading} onRegenerate={handleRegenerate} />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>

      {/* Decoración sutil */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-3xl" />
    </section>
  )
}
