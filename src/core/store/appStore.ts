import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvatarId } from "../utils/avatarAssets";

export type OnboardingStep = "hidden" | "name" | "avatar";

interface AppState {
  onboardingStep: OnboardingStep;
  playerName: string;
  selectedAvatar: AvatarId | null;
  hasCompletedOnboarding: boolean;

  setOnboardingStep: (step: OnboardingStep) => void;
  setPlayerName: (name: string) => void;
  setSelectedAvatar: (avatar: AvatarId | null) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingStep: "hidden",
      playerName: "",
      selectedAvatar: null,
      hasCompletedOnboarding: false,

      setOnboardingStep: (step) => set({ onboardingStep: step }),
      setPlayerName: (name) => set({ playerName: name }),
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    { name: "juegomovi-storage" }
  )
);
