import './App.css'
import { Suspense, lazy, useEffect } from 'react'
import { HeroSection } from './components/sections/HeroSection'
import { Container } from './components/ui/Container'
import { NavbarUI } from './components/ui/NavbarUI'

import { getBrochuresRemaining } from './services/getBrochuresRemaining'
import { useAnonIdStore } from './stores/useAnonId'
import { useBrochuresRemainingStore } from './stores/useBrochuresRemaining'
import { showErrorToast } from './utils/toasts'
import { useTranslate } from './hooks/useTranslate'
import { APP_TEXT } from './lang/app'

// Lazy components
const HowItWorksSectionLazy = lazy(() => import('./components/sections/HowItWorksSection').then(m => ({ default: m.HowItWorksSection })))
const FeaturesSectionLazy = lazy(() => import('./components/sections/FeaturesSection').then(m => ({ default: m.FeaturesSection })))
const OpenSourceSectionLazy = lazy(() => import('./components/sections/OpenSourceSection').then(m => ({ default: m.OpenSourceSection })))
const FAQSectionLazy = lazy(() => import('./components/sections/FAQSection').then(m => ({ default: m.FAQSection })))
const FooterLazy = lazy(() => import('./components/ui/Footer').then(m => ({ default: m.Footer })))

function App() {

  const {anonId, setAnonId} = useAnonIdStore()
  const {setBrochuresRemaining} = useBrochuresRemainingStore()
  const { t } = useTranslate(APP_TEXT)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    getBrochuresRemaining(anonId, { signal: controller.signal, timeoutMs: 8000 }).then((res) => {
      if (cancelled) return
      if (res && res.success) {
        setBrochuresRemaining(res.data.brochures_remaining)
        setAnonId(res.data.anon_id)
      } else {
        // Fallback seguro si hay error: no sobreescribir si ya existe, o setear mínimos
        void showErrorToast(t.error.errorRemaining.title, t.error.errorRemaining.description)
      }
    }).catch(() => {
      // Evitar crash si se rechaza la promesa
      void showErrorToast(t.error.errorRemaining.title, t.error.errorRemaining.description)
    })

    return () => { cancelled = true; controller.abort() }
  }, [anonId, setAnonId, setBrochuresRemaining, t])


  return (
    <>
      <div className="bg-gray-100 dark:bg-slate-950">
        <Container>
          <NavbarUI />
          <HeroSection />
          <Suspense fallback={null}>
            <HowItWorksSectionLazy />
          </Suspense>
          <Suspense fallback={null}>
            <FeaturesSectionLazy />
          </Suspense>
          <Suspense fallback={null}>
            <OpenSourceSectionLazy />
          </Suspense>
          <Suspense fallback={null}>
            <FAQSectionLazy />
          </Suspense>
          <Suspense fallback={null}>
            <FooterLazy />
          </Suspense>
        </Container>
      </div>
    </>
  )
}

export default App
