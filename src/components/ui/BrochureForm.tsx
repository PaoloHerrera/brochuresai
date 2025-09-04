import type { FC } from 'react'
import { useState } from 'react'
import { Globe, Wand2, Briefcase, Smile, Gauge } from 'lucide-react'

import {
  Card,
  Form,
  Input,
  Button,
  Select,
  SelectItem,
  Tooltip,
} from '@heroui/react'
import { showErrorToast } from '../../utils/toasts'
import { showSuccessToast } from '../../utils/toasts'

import { useLanguageStore } from '../../stores/useLanguageStore'
import type { LanguageStore } from '../../stores/useLanguageStore'
import { FORM_TEXT } from '../../lang/form'
import { useTranslate } from '../../hooks/useTranslate'

import {useBrochuresRemainingStore} from '../../stores/useBrochuresRemaining'
import type { BrochureSubmitData, BrochureSubmitResult } from '../../hooks/useBrochureSubmit'
import { inputClassNames, textDefault, fieldWrapper } from './fieldStyles'


type BrochureType = 'professional' | 'funny'

interface BrochureFormProps {
  isLoading: boolean
  submitBrochure: (data: BrochureSubmitData) => Promise<BrochureSubmitResult>
}

const BrochureForm: FC<BrochureFormProps> = ({ isLoading, submitBrochure }) => {
  
  // Language Store y traducciones
  const { language } = useLanguageStore()
  const { t } = useTranslate(FORM_TEXT)

  // Brochures Remaining Store (solo lectura para el badge)
  const { brochuresRemaining } = useBrochuresRemainingStore()
 
  // Estados controlados para Selects con tipos compatibles
  const [brochureLanguage, setBrochureLanguage] = useState(new Set([language] as LanguageStore[]))
  const [brochureType, setBrochureType] = useState(new Set(['professional'] as BrochureType[]))

  // Iconos dinámicos para los triggers de los Selects
  const selectedType = Array.from(brochureType)[0] as BrochureType | undefined
  const brochureTypeIcon = selectedType === 'funny' ? <Smile size={16} /> : <Briefcase size={16} />
  const languageIcon = <Globe size={16} />

  // Estilos dinámicos y valores para el indicador de "restantes"
  const remaining = Math.max(0, brochuresRemaining)
  // Estilos sutiles para el chip superior derecho
  const badgeClasses = remaining <= 0
    ? 'text-red-700 border-red-200 bg-red-50/60 dark:text-red-200 dark:border-red-500/30 dark:bg-red-500/10'
    : remaining <= 2
    ? 'text-amber-800 border-amber-200 bg-amber-50/60 dark:text-amber-200 dark:border-amber-500/30 dark:bg-amber-500/10'
    : 'text-teal-800 border-teal-200 bg-teal-50/60 dark:text-teal-200 dark:border-teal-500/30 dark:bg-teal-500/10'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const companyNameHtml = form.elements.namedItem('companyName') as HTMLInputElement
    const urlHtml = form.elements.namedItem('url') as HTMLInputElement

    const result = await submitBrochure({
      companyName: companyNameHtml.value,
      url: urlHtml.value,
      language: Array.from(brochureLanguage)[0] as LanguageStore,
      brochureType: Array.from(brochureType)[0] as 'professional' | 'funny',
    })

    if (!result.success) {
      if (result.status === 429) {
        showErrorToast(t.limitBrochuresTitle, t.limitBrochuresDescription)
      } else {
        showErrorToast(t.errorTitle, t.errorDescription)
      }
    } else {
      showSuccessToast(t.successTitle, t.successDescription)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto p-6 shadow-lg bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      <Form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <Globe className="text-blue-500" />
            <span className="text-slate-900 dark:text-slate-100">{t.title}</span>
          </div>
          <div
            className={`ml-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClasses}`}
            title={t.remainingTooltip}
            aria-live="polite"
          >
            <Gauge size={14} className="opacity-80" />
            <span className="tabular-nums">{remaining}</span>
          </div>
        </div>
        <p className="text-gray-500 dark:text-slate-400 -mt-3 mb-2 text-sm">{t.description}</p>
        <div className='w-full'>
          <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
            {t.companyNameLabel}
          </label>
          <Input
            name="companyName"
            isDisabled={isLoading}
            placeholder={t.companyNamePlaceholder} 
            isRequired 
            classNames={inputClassNames}
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
            {t.urlLabel}
          </label>
          <Input
            name="url"
            isDisabled={isLoading}
            placeholder={t.urlPlaceholder} 
            type="url" 
            isRequired 
            classNames={inputClassNames}
          />
        </div>
        <div className="flex gap-4 w-full lg:flex-row flex-col">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
              {t.style}
            </label>
            <Select
              aria-label={t.ariaSelectType}
              isDisabled={isLoading}
              selectedKeys={brochureType}
              startContent={brochureTypeIcon}
              onSelectionChange={(keys) => {
                if (keys instanceof Set) {
                  setBrochureType(new Set([...keys] as BrochureType[]))
                }
              }}
              className="w-full"
              disallowEmptySelection={true}
              isRequired
              classNames={{
                trigger: `${fieldWrapper} ${textDefault}`,
              }}
            >
              {t.styleOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  startContent={opt.value === 'professional' ? <Briefcase size={16} /> : <Smile size={16} />}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
              {t.languageLabel}
            </label>
            <Select
              aria-label={t.ariaSelectLanguage}
              isDisabled={isLoading}
              className="w-full"
              disallowEmptySelection={true}
              selectedKeys={brochureLanguage}
              startContent={languageIcon}
              onSelectionChange={(keys) => {
                if (keys instanceof Set) {
                  setBrochureLanguage(new Set([...keys] as LanguageStore[]))
                }
              }}
              isRequired
              classNames={{
                trigger: `${fieldWrapper} ${textDefault}`,
              }}
            >
              {t.languageOptions.map((lang) => (
                <SelectItem key={lang.code}>{lang.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <Tooltip
          isDisabled={remaining > 0}
          content={t.limitBrochuresDescription}
          placement="top"
        >
          <div className="inline-flex">
            <Button
              isLoading={isLoading}
              isDisabled={remaining <= 0}
              type="submit"
              className="group relative mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-white text-lg font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Wand2 size={24} className="transition-transform duration-200 ease-out group-hover:-rotate-12 group-hover:translate-x-0.5" /> 
              {t.submitButton}
            </Button>
          </div>
        </Tooltip>
      </Form>
    </Card>
  )
}

export default BrochureForm
