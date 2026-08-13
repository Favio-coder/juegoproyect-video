import { useEffect } from "react";
import GameModal from "../../../shared/components/GameModal/GameModal";
import { useAvatarAsset } from "../../../core/hooks/useAvatarAsset";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import type { PoseChallenge } from "../types/game.types";

interface ChallengeModalProps {
  challenge: PoseChallenge;
  onAccept: () => void;
}

/**
 * ChallengeModal — shows the current exercise using the shared
 * GameModal (wooden-board panel) system.
 */
export default function ChallengeModal({ challenge, onAccept }: ChallengeModalProps) {
  const { src, name } = useAvatarAsset("advising");
  const { speak } = useSpeechSynthesis();

  const isHold = challenge.kind === "hold";
  const detail = isHold
    ? `Mantén la pose durante ${challenge.holdSeconds} segundos.`
    : `Debes hacer ${challenge.repsToComplete} repeticiones en ${challenge.timeLimitSeconds} segundos.`;

  useEffect(() => {
    speak(`${challenge.label}. ${challenge.description}. ${detail}`);
  }, [challenge, speak, detail]);

  return (
    <GameModal
      isOpen={true}
      avatarSrc={src}
      avatarAlt={`${name} aconsejando`}
      title={challenge.label}
      message={`${challenge.description}. ${detail}`}
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