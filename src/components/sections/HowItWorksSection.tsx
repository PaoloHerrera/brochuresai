import { ArrowRight, Eye, FileDown, Globe, Wand2 } from 'lucide-react'
import { useTranslate } from '../../hooks/useTranslate'
import { HOWITWORKS_TEXT } from '../../lang/howitworks'
import { Button, Chip, Link } from '@heroui/react'

export const HowItWorksSection = () => {
  const { t } = useTranslate(HOWITWORKS_TEXT)

  return (
    <section className="relative overflow-hidden py-20 bg-white dark:bg-slate-950 px-6 sm:px-12 lg:px-14">
      {/* background accents */}
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-cyan-300/20 dark:bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-3xl" />

      {/* Contenido envuelto por Container en App.tsx */}
      <div>
        <div className="text-center mb-12">
          <Chip
            radius="sm"
            size="sm"
            variant="bordered"
            classNames={{
              base: "chip-base chip-accent",
              content: "chip-content",
            }}
          >
            {t.eyebrow}
          </Chip>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.title}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Step 1 */}
          <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 p-6 shadow-sm transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1 hover:shadow-lg hover:border-black dark:hover:border-white hover:scale-105">
            <span className="absolute -top-3 -left-3 rounded-full bg-cyan-500 text-white text-xs font-bold px-2 py-1 shadow-md">1</span>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm shadow-cyan-500/20 transition-transform duration-200 group-hover:scale-105">
                <Globe size={20} />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white text-center">{t.steps[0].title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 text-center">{t.steps[0].description}</p>
          </div>
          
          {/* Step 2 */}
          <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 p-6 shadow-sm transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1 hover:shadow-lg hover:border-black dark:hover:border-white hover:scale-105">
            <span className="absolute -top-3 -left-3 rounded-full bg-indigo-500 text-white text-xs font-bold px-2 py-1 shadow-md">2</span>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
                <Wand2 size={20} />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white text-center">{t.steps[1].title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 text-center">{t.steps[1].description}</p>
          </div>
          
          {/* Step 3 */}
          <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 p-6 shadow-sm transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1 hover:shadow-lg hover:border-black dark:hover:border-white hover:scale-105">
            <span className="absolute -top-3 -left-3 rounded-full bg-purple-500 text-white text-xs font-bold px-2 py-1 shadow-md">3</span>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm shadow-purple-500/20 transition-transform duration-200 group-hover:scale-105">
                <Eye size={20} />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white text-center">{t.steps[2].title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 text-center">{t.steps[2].description}</p>
          </div>
          
          {/* Step 4 */}
          <div className="relative h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900 p-6 shadow-sm transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1 hover:shadow-lg hover:border-black dark:hover:border-white hover:scale-105">
            <span className="absolute -top-3 -left-3 rounded-full bg-emerald-500 text-white text-xs font-bold px-2 py-1 shadow-md">4</span>
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm shadow-emerald-500/20 transition-transform duration-200 group-hover:scale-105">
                <FileDown size={20} />
              </div>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white text-center">{t.steps[3].title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 text-center">{t.steps[3].description}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <Button
            as={Link}
            href="#"
            className="btn-cta"
          >
            {t.cta}
            <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </section>
  )
}