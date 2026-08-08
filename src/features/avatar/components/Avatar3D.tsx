import type { AvatarId } from "../../../core/utils/avatarAssets";
import type { AvatarMotion } from "../types";
import Pingo3D from "./Pingo3D";
import Rocko3D from "./Rocko3D";

interface Avatar3DProps {
  avatar: AvatarId;
  motion: AvatarMotion;
}

export default function Avatar3D({ avatar, motion }: Avatar3DProps) {
  return avatar === "rocko" ? (
    <Rocko3D motion={motion} />
  ) : (
    <Pingo3D motion={motion} />
  );
}