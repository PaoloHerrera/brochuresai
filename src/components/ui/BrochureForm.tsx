import type { FC } from 'react'
import { useState } from 'react'
import { Globe, Wand2, Briefcase, Smile } from 'lucide-react'

import {
  Card,
  Form,
  Input,
  Button,
  Select,
  SelectItem,
} from '@heroui/react'

import { useLanguageStore } from '../../stores/useLanguageStore'
import type { LanguageStore } from '../../stores/useLanguageStore'
import { useBrochureStore } from '../../stores/useBrochureStore'
import { FORM_TEXT } from '../../lang/form'

import axios from 'axios'

type BrochureType = 'professional' | 'funny'

const BrochureForm: FC = () => {
  
  // Language Store
  const { language } = useLanguageStore()
  const text = FORM_TEXT[language]
  const languages = text.languageOptions

  // Brochure Store
  const { setBrochure, setCompanyName, setCacheKey } = useBrochureStore()

  // Estados controlados para Selects con tipos compatibles
  const [brochureLanguage, setBrochureLanguage] = useState(new Set([language] as LanguageStore[]))
  const [brochureType, setBrochureType] = useState(new Set(['professional'] as BrochureType[]))

  // Estado de carga cuando se envía el formulario
  const [isLoading, setIsLoading] = useState(false)

  // Iconos dinámicos para los triggers de los Selects
  const selectedType = Array.from(brochureType)[0] as BrochureType | undefined
  const brochureTypeIcon = selectedType === 'funny' ? <Smile size={16} /> : <Briefcase size={16} />
  const languageIcon = <Globe size={16} />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    /* ENVÍO DE LAS DATOS AL SERVIDOR */
    setIsLoading(true)
    setBrochure('')

    const companyNameHtml = (e.target as HTMLFormElement).elements.namedItem('companyName') as HTMLInputElement
    const urlHtml = (e.target as HTMLFormElement).elements.namedItem('url') as HTMLInputElement

    const brochureFullLanguage = text.languageOptions.find((lang) => lang.code === Array.from(brochureLanguage)[0])?.label

    const response = await axios.post('http://localhost:8000/api/v1/create_brochure', {
      "company_name": companyNameHtml.value,
      "url": urlHtml.value,
      "language": brochureFullLanguage,
      "brochure_type": Array.from(brochureType)[0],
    })

    setBrochure(response.data.brochure)
    setCompanyName(companyNameHtml.value)
    setCacheKey(response.data.cache_key)
    setIsLoading(false)
  }

  return (
    <Card className="max-w-3xl mx-auto p-6 shadow-lg bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      <Form onSubmit={handleSubmit} className="flex gap-4 flex-col">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Globe className="text-blue-500" />
          <span className="text-slate-900 dark:text-slate-100">{text.title}</span>
        </div>
        <p className="text-gray-500 dark:text-slate-400 -mt-3 mb-2 text-sm">{text.description}</p>
        <div className='w-full'>
          <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
            {text.companyNameLabel}
          </label>
          <Input
            name="companyName"
            isDisabled={isLoading}
            placeholder="Company Name" isRequired classNames={{
            inputWrapper: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            input: 'text-slate-900 dark:text-slate-100'
          }} />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
            {text.urlLabel}
          </label>
          <Input
            name="url"
            isDisabled={isLoading}
            placeholder="https://example.com" type="url" isRequired classNames={{
            inputWrapper: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            input: 'text-slate-900 dark:text-slate-100'
          }} />
        </div>
        <div className="flex gap-4 w-full lg:flex-row flex-col">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
              {text.style}
            </label>
            <Select
              aria-label="Select brochure type"
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
                trigger: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              }}
            >
              {text.styleOptions.map((opt) => (
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
              {text.languageLabel}
            </label>
            <Select
              aria-label="Select language"
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
                trigger: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
              }}
            >
              {languages.map((lang) => (
                <SelectItem key={lang.code}>{lang.label}</SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <Button
          isLoading={isLoading}
          type="submit"
          className="group relative mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-white text-lg font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto"
        >
          <Wand2 size={24} className="transition-transform duration-200 ease-out group-hover:-rotate-12 group-hover:translate-x-0.5" /> {text.submitButton}
        </Button>
      </Form>
    </Card>
  )
}

export default BrochureForm
