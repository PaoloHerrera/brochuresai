import React from 'react'
import { useLanguageStore } from '../stores/useLanguageStore'
import { NAVBAR_TEXT } from '../lang/navbar'
import { useTranslate } from '../hooks/useTranslate'

export const SEO: React.FC = () => {
  const { language } = useLanguageStore()
  const { t } = useTranslate(NAVBAR_TEXT)

  React.useEffect(() => {
    // html lang
    document.documentElement.setAttribute('lang', language)

    // Title localizable (usa marca del navbar t.brand)
    document.title = t.brand

    // Meta description y OG (simple, localizable si agregamos claves en lang)
    const ensureMeta = (name: string, attr: 'name' | 'property' = 'name') => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      return el
    }

    const description = language === 'es'
      ? 'Genera folletos profesionales con IA a partir de una URL en segundos.'
      : 'Generate professional brochures with AI from a URL in seconds.'

    const title = document.title
    const url = window.location.origin

    // Standard description
    ensureMeta('description').setAttribute('content', description)

    // Open Graph
    ensureMeta('og:title', 'property').setAttribute('content', title)
    ensureMeta('og:description', 'property').setAttribute('content', description)
    ensureMeta('og:type', 'property').setAttribute('content', 'website')
    ensureMeta('og:url', 'property').setAttribute('content', url)

    // Twitter Cards
    ensureMeta('twitter:card', 'property').setAttribute('content', 'summary')
    ensureMeta('twitter:title', 'property').setAttribute('content', title)
    ensureMeta('twitter:description', 'property').setAttribute('content', description)
  }, [language, t.brand])

  return null
}