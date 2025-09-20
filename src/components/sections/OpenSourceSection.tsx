import { Button, Link } from '@heroui/react'
import { GithubIcon } from '../icons/GithubIcon'
import { useTranslate } from '../../hooks/useTranslate'
import { OPENSOURCE_TEXT } from '../../lang/opensource'
import { GITHUB_URL } from '../../config'
import { EyebrowChip } from '../ui/EyebrowChip'
import { InfoChip } from '../ui/InfoChip'

export const OpenSourceSection = () => {
  const { t } = useTranslate(OPENSOURCE_TEXT)

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white px-6 sm:px-12 lg:px-14">
      <div>
        <div className="text-center mb-10">
          <EyebrowChip ariaLabel={t.eyebrow}>{t.eyebrow}</EyebrowChip>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">{t.title}</h2>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">{t.description}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8">
          {t.badges.map((b: string, idx: number) => (
            <InfoChip key={idx} variant="bordered">{b}</InfoChip>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button as={Link} href={GITHUB_URL} color="secondary" radius="full" variant="flat" className="text-slate-200">
            <GithubIcon ariaLabel={t.ctaPrimary} title={t.ctaPrimary} /> {t.ctaPrimary}
          </Button>
          <Button as={Link} href={GITHUB_URL} radius="full" variant="bordered" className="border-cyan-400/40 text-slate-200">
            {t.ctaSecondary}
          </Button>
        </div>
      </div>
    </section>
  )
}