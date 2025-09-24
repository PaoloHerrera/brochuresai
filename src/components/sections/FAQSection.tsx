import { Accordion, AccordionItem } from '@heroui/react'
import { useTranslate } from '../../hooks/useTranslate'
import { FAQ_TEXT } from '../../lang/faq'
import { EyebrowChip } from '../ui/EyebrowChip'

export const FAQSection = () => {
  const { t } = useTranslate(FAQ_TEXT)

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 px-6 sm:px-12 lg:px-14">
      <div>
        <div className="text-center mb-10">
          <EyebrowChip ariaLabel={t.eyebrow}>{t.eyebrow}</EyebrowChip>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.title}
          </h2>
        </div>
        <Accordion variant="splitted" className="bg-transparent">
          {t.items.map((item, idx) => (
            <AccordionItem
              key={idx}
              aria-label={item.q}
              title={item.q}
              subtitle=""
              className="bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <p className="text-slate-600 dark:text-slate-300">{item.a}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
