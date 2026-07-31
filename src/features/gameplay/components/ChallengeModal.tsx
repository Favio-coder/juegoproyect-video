import advisingSvg from "../../../assets/avatar/pingo/PingoAconsejando.svg";
import GameModal from "../../../shared/components/GameModal/GameModal";
import type { PoseChallenge } from "../types/game.types";

interface ChallengeModalProps {
  challenge: PoseChallenge;
  onAccept: () => void;
}

/**
 * ChallengeModal — shows the current pose challenge using the
 * shared GameModal (wooden-board panel) system.
 */
export default function ChallengeModal({ challenge, onAccept }: ChallengeModalProps) {
  return (
    <GameModal
      isOpen={true}
      avatarSrc={advisingSvg}
      avatarAlt="Pingo aconsejando"
      title={challenge.label}
      message={challenge.description}
      closeOnBackdrop={false}
      actions={[
        {
          label: "¡Comenzar!",
          onClick: onAccept,
          variant: "primary",
        },
      ]}
    />
  );
}
