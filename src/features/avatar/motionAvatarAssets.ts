import type { AvatarId } from "../../core/utils/avatarAssets";
import pingoIdle from "../../assets/avatar/motion/pingo/idle.png";
import pingoSquat from "../../assets/avatar/motion/pingo/squat.png";
import pingoStar from "../../assets/avatar/motion/pingo/star.png";
import pingoMarch from "../../assets/avatar/motion/pingo/march.png";
import rockoIdle from "../../assets/avatar/motion/rocko/idle.png";
import rockoSquat from "../../assets/avatar/motion/rocko/squat.png";
import rockoStar from "../../assets/avatar/motion/rocko/star.png";
import rockoMarch from "../../assets/avatar/motion/rocko/march.png";
import squat01 from "../../assets/avatar/motion/pingo/squat-sequence/frame-01.png";
import squat02 from "../../assets/avatar/motion/pingo/squat-sequence/frame-02.png";
import squat03 from "../../assets/avatar/motion/pingo/squat-sequence/frame-03.png";
import squat04 from "../../assets/avatar/motion/pingo/squat-sequence/frame-04.png";
import squat05 from "../../assets/avatar/motion/pingo/squat-sequence/frame-05.png";
import squat06 from "../../assets/avatar/motion/pingo/squat-sequence/frame-06.png";
import squat07 from "../../assets/avatar/motion/pingo/squat-sequence/frame-07.png";
import squat08 from "../../assets/avatar/motion/pingo/squat-sequence/frame-08.png";

export type MotionPose = "idle" | "squat" | "star" | "march";

export const MOTION_ASSETS: Record<AvatarId, Record<MotionPose, string>> = {
  pingo: { idle: pingoIdle, squat: pingoSquat, star: pingoStar, march: pingoMarch },
  rocko: { idle: rockoIdle, squat: rockoSquat, star: rockoStar, march: rockoMarch },
};

export const PINGO_SQUAT_FRAMES = [
  squat01, squat02, squat03, squat04, squat05, squat06, squat07, squat08,
] as const;
