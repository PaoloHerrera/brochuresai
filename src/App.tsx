import './App.css'
import { HeroSection } from './components/sections/HeroSection'
import { NavbarUI } from './components/ui/NavbarUI'

function App() {
  return (
    <>
      <NavbarUI />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950">
        <HeroSection />
      </div>
    </>
  )
}

export default App
