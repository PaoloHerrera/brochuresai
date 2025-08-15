import { useTranslate } from '../../hooks/useTranslate'
import { HEROTEXT } from '../../lang/hero'
import { Chip } from '@heroui/react'
import { Sparkles, Zap, CheckCircle2 } from 'lucide-react'

import BrochureForm from '../ui/BrochureForm'

export const HeroSection = () => {
  const { t, language } = useTranslate(HEROTEXT)

  const chipIcons = [
    <CheckCircle2 key="c1" size={14} />, 
    <Sparkles key="c2" size={14} />, 
    <Zap key="c3" size={14} />,
  ]

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
            <div className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
              <span className="text-[10px] font-bold">{language.toUpperCase()}</span>
            </div>
            <BrochureForm />
          </div>
        </div>
      </div>

      {/* Decoración sutil */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-3xl" />
    </section>
  )
}
