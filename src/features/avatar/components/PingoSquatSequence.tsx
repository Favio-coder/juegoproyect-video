import { PINGO_SQUAT_FRAMES } from "../motionAvatarAssets";

const PINGO_SQUAT_FRAME_COUNT = PINGO_SQUAT_FRAMES.length;

export default function PingoSquatSequence({ frame }: { frame: number }) {
  const safeFrame = Math.max(0, Math.min(frame, PINGO_SQUAT_FRAME_COUNT - 1));

  return (
    <img
      className="motion-avatar motion-avatar--pingo motion-avatar--sequence"
      src={PINGO_SQUAT_FRAMES[safeFrame]}
      alt={`Pingo realizando una sentadilla, cuadro ${safeFrame + 1} de ${PINGO_SQUAT_FRAME_COUNT}`}
      draggable={false}
    />
  );
}
