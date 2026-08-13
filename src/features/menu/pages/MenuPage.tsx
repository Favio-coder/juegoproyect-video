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

      {/* <button
        onClick={() => navigate("/impresora")}
        className="absolute right-4 top-4 z-20 rounded-full bg-white/80 px-4 py-2 text-lg font-semibold text-slate-700 shadow-md backdrop-blur transition hover:bg-indigo-600 hover:text-white"
      >
        🖨 Impresora
      </button> */}

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        {step === "hidden" && (
          <>
            <Logo />
            <PlayButton onClick={() => handleSetStep("name")} />
            <button
              onClick={() => navigate("/ranking")}
              className="mt-4 rounded-full bg-white/95 px-8 py-3 text-xl font-black text-[#FA981B] shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(250,152,27,0.5)] active:scale-95"
            >
              🏆 Ver ranking
            </button>
          </>
        )}

        <OnboardingFlow step={step} setStep={handleSetStep} onFinish={handleFinishOnboarding} />
      </section>
    </main>
  );
}
