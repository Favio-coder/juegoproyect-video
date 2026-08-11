import type { AvatarId } from "../../../core/utils/avatarAssets";
import { MOTION_ASSETS } from "../motionAvatarAssets";
import type { MotionPose } from "../motionAvatarAssets";

export type { MotionPose } from "../motionAvatarAssets";

export default function MotionAvatarSprite({ avatar, pose }: { avatar: AvatarId; pose: MotionPose }) {
  return (
    <img
      className={`motion-avatar motion-avatar--${avatar}`}
      src={MOTION_ASSETS[avatar][pose]}
      alt={`${avatar} en pose ${pose}`}
      draggable={false}
    />
  );
}
