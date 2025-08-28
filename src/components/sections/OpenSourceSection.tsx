import { Button, Link } from '@heroui/react'
import { GithubIcon } from '../icons/GithubIcon'
import { useTranslate } from '../../hooks/useTranslate'
import { OPENSOURCE_TEXT } from '../../lang/opensource'
import { GITHUB_URL } from '../../config'

export const OpenSourceSection = () => {
  const { t } = useTranslate(OPENSOURCE_TEXT)

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white px-6 sm:px-12 lg:px-14">
      <div>
        <div className="text-center mb-10">
          <p className="text-sm font-medium tracking-wide text-cyan-400 uppercase">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">{t.title}</h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{t.description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {t.badges.map((b: string, idx: number) => (
            <span key={idx} className="rounded-full border border-cyan-400/30 bg-white/5 px-4 py-1 text-sm text-slate-200">
              {b}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button as={Link} href={GITHUB_URL} color="secondary" variant="flat" className="rounded-full text-slate-200">
            <GithubIcon /> {t.ctaPrimary}
          </Button>
          <Button as={Link} href={GITHUB_URL} variant="bordered" className="rounded-full border-cyan-400/40 text-slate-200">
            {t.ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  )
}