import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Background from "../components/Background";
import Logo from "../components/Logo";
import PlayButton from "../components/PlayButton";
import OnboardingFlow from "../omboarding/OnboardingFlow";
import { useAppStore } from "../../../core/store/appStore";
import type { OnboardingStep } from "../types/menu.types";

export default function MenuPage() {
  const navigate = useNavigate();
  const { onboardingStep: savedStep, playerName: savedName, setOnboardingStep, completeOnboarding } = useAppStore();

  const [step, setStep] = useState<OnboardingStep>(() =>
    savedStep === "name" && savedName ? "name" : savedStep
  );

  const handleSetStep: React.Dispatch<React.SetStateAction<OnboardingStep>> = (value) => {
    const newStep = typeof value === "function" ? value(step) : value;
    setStep(newStep);
    setOnboardingStep(newStep);
  };

  const handleFinishOnboarding = () => {
    completeOnboarding();
    setOnboardingStep("hidden");
    navigate("/juego");
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Background />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {step === "hidden" && (
          <>
            <Logo />
            <PlayButton onClick={() => handleSetStep("name")} />
          </>
        )}

        <OnboardingFlow step={step} setStep={handleSetStep} onFinish={handleFinishOnboarding} />
      </section>
    </main>
  );
}
