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
import { useAnonUserIdStore } from './stores/useAnonUserId'
import { useBrochuresRemainingStore } from './stores/useBrochuresRemaining'

function App() {

  const {anonUserId, setAnonUserId} = useAnonUserIdStore()
  const {setBrochuresRemaining} = useBrochuresRemainingStore()

  useEffect(() => {
    getBrochuresRemaining(anonUserId).then((res) => {
      setBrochuresRemaining(res.brochures_remaining)
      setAnonUserId(res.anon_id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


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
