import type { AvatarId } from "../../core/utils/avatarAssets";

export type AvatarMotion =
  | "idle"
  | "jumping"
  | "squat"
  | "marching"
  | "celebrate";

export interface RigParams {
  height: number;
  squash: number;
  tilt: number;
  lean: number;
  bobSpeed: number;
  bobAmp: number;
}

export const AVATAR_RIG: Record<AvatarMotion, RigParams> = {
  idle: { height: 0, squash: 1, tilt: 0, lean: 0, bobSpeed: 1.6, bobAmp: 0.03 },
  jumping: { height: 0.55, squash: 1.06, tilt: 0.05, lean: 0.06, bobSpeed: 7, bobAmp: 0.16 },
  squat: { height: -0.4, squash: 0.72, tilt: 0, lean: 0.1, bobSpeed: 1, bobAmp: 0.02 },
  marching: { height: 0.12, squash: 1, tilt: 0.3, lean: 0.06, bobSpeed: 6, bobAmp: 0.1 },
  celebrate: { height: 0.34, squash: 1, tilt: 0, lean: 0, bobSpeed: 4, bobAmp: 0.14 },
};

export const AVATAR_MOTIONS: AvatarMotion[] = [
  "idle",
  "jumping",
  "squat",
  "marching",
  "celebrate",
];

export const AVATAR_IDS: AvatarId[] = ["pingo", "rocko"];
