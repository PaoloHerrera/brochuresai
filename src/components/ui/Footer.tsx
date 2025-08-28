import { useTranslate } from '../../hooks/useTranslate'
import { FOOTER_TEXT } from '../../lang/footer'
import { GithubIcon } from '../icons/GithubIcon'
import { GITHUB_URL } from '../../config'

export const Footer = () => {
  const { t } = useTranslate(FOOTER_TEXT)

  return (
    <footer className="bg-slate-950 dark:bg-gray-950 border-t border-slate-200/60 dark:border-slate-800/60 py-10 px-6 sm:px-12 lg:px-14">
      <div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-200 dark:text-slate-200">
            <span className="font-semibold">BrochuresAI</span>
            <span className="text-slate-400">•</span>
            <span className="text-sm">{t.rights}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href={GITHUB_URL} className="inline-flex items-center text-slate-200 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <GithubIcon /> {t.repo}
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400 dark:text-slate-400">
          {t.madeBy} 
        </p>
      </div>
    </footer>
  )
}