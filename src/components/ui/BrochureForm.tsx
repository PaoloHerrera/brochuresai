import type { FC } from 'react'
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
import { FORM_TEXT } from '../../lang/form'

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  // Aquí puedes manejar la lógica de envío del formulario
  console.log('Formulario enviado')
}

const BrochureForm: FC = () => {
  const { language } = useLanguageStore()
  const text = FORM_TEXT[language]

  const languages = text.languageOptions

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
          <Input placeholder="Company Name" isRequired classNames={{
            inputWrapper: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            input: 'text-slate-900 dark:text-slate-100'
          }} />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
            {text.urlLabel}
          </label>
          <Input placeholder="https://example.com" type="url" isRequired classNames={{
            inputWrapper: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            input: 'text-slate-900 dark:text-slate-100'
          }} />
        </div>
        <div className="flex gap-4 w-full">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-slate-800 dark:text-slate-300">
              {text.style}
            </label>
            <Select
              defaultSelectedKeys={["professional"]}
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
              defaultSelectedKeys={[language]}
              className="w-full"
              disallowEmptySelection={true}
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
