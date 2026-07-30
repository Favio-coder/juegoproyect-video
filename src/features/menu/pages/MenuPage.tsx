import { useState } from "react"

import Background from "../components/Background"
import Logo from "../components/Logo"
import PlayButton from "../components/PlayButton"

import OnboardingFlow from "../omboarding/OnboardingFlow"
import type { OnboardingStep } from "../types/menu.types"

export default function MenuPage() {
  
  const [step, setStep] = useState<OnboardingStep>("hidden")
  
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/**Fondo */}
      <Background/>


      {/**Contenido */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {
          step==="hidden" && (
             <>
                <Logo/>
                <PlayButton
                  onClick={() => setStep("name")}
                />
             </>
          )
        }
        
        <OnboardingFlow
          step={step}
          setStep={setStep}
        />

      </section>

    </main>
  )
}
