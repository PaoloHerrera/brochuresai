import './App.css'
import { HeroSection } from './components/sections/HeroSection'
import { NavbarUI } from './components/ui/NavbarUI'
import { HowItWorksSection } from './components/sections/HowItWorksSection'
import { FeaturesSection } from './components/sections/FeaturesSection'
import { OpenSourceSection } from './components/sections/OpenSourceSection'
import { FAQSection } from './components/sections/FAQSection'
import { Footer } from './components/ui/Footer'
import { Container } from './components/ui/Container'

import { useEffect } from 'react'
import { getBrochuresRemaining } from './services/getBrochuresRemaining'
import { useAnonIdStore } from './stores/useAnonId'
import { useBrochuresRemainingStore } from './stores/useBrochuresRemaining'

function App() {

  const {anonId, setAnonId} = useAnonIdStore()
  const {setBrochuresRemaining} = useBrochuresRemainingStore()

  useEffect(() => {
    let cancelled = false
    getBrochuresRemaining(anonId).then((res) => {
      if (cancelled) return
      if (res && res.success) {
        setBrochuresRemaining(res.data.brochures_remaining)
        setAnonId(res.data.anon_id)
      } else {
        // Fallback seguro si hay error: no sobreescribir si ya existe, o setear mínimos
        // Podríamos mostrar un toast en el futuro; por ahora, solo no crashear.
        // setBrochuresRemaining(0)
      }
    }).catch(() => {
      // Evitar crash si se rechaza la promesa
    })
    return () => { cancelled = true }
  }, [anonId, setAnonId, setBrochuresRemaining])


  return (
    <>
      <div className="bg-gray-100 dark:bg-slate-950">
        <Container>
          <NavbarUI />
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <OpenSourceSection />
          <FAQSection />
          <Footer />
        </Container>
      </div>
    </>
  )
}

export default App
