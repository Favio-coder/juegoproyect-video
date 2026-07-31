import NameStep from "./NameStep";
import AvatarStep from "./AvatarStep";

import type { OnboardingStep } from "../types/menu.types";

type Props = {
  step: OnboardingStep;
  setStep: React.Dispatch<React.SetStateAction<OnboardingStep>>;
  onFinish: () => void;
};

export default function OnboardingFlow({
  step,
  setStep,
  onFinish,
}: Props) {
  switch (step) {
    case "name":
      return (
        <NameStep
          onContinue={() => setStep("avatar")}
        />
      );

    case "avatar":
      return (
        <AvatarStep onContinue={onFinish} />
      );

    default:
      return null;
  }
}
