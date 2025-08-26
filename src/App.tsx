import './App.css'
import { HeroSection } from './components/sections/HeroSection'
import { NavbarUI } from './components/ui/NavbarUI'
import { HowItWorksSection } from './components/sections/HowItWorksSection'
import { FeaturesSection } from './components/sections/FeaturesSection'
import { OpenSourceSection } from './components/sections/OpenSourceSection'
import { FAQSection } from './components/sections/FAQSection'
import { Footer } from './components/ui/Footer'
import { Container } from './components/ui/Container'

function App() {
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
