import NameStep from "./NameStep";
import AvatarStep from "./AvatarStep";

import type { OnboardingStep } from "../types/menu.types";

type Props = {

    step: OnboardingStep;

    setStep: React.Dispatch<
        React.SetStateAction<OnboardingStep>
    >;

};

export default function OnboardingFlow({

    step,

    setStep,

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
                // <div>
                //     Avatar Step
                // </div>
                <AvatarStep />

            );

        default:

            return null;

    }

}