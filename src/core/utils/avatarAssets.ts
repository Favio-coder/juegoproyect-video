import { Avatars } from "../../assets";

export type AvatarMood = "happy" | "advising" | "idle" | "standing";

export type AvatarId = "pingo" | "rocko";

interface AvatarAssets {
  name: string;
  happy: string;
  advising: string;
  idle: string;
  standing?: string;
}

export const AVATAR_ASSETS: Record<AvatarId, AvatarAssets> = {
  pingo: {
    name: "Pingo",
    happy: Avatars.pingo.happy,
    advising: Avatars.pingo.advising,
    idle: Avatars.pingo.idle,
  },
  rocko: {
    name: "Rocko",
    happy: Avatars.rocko.happy,
    advising: Avatars.rocko.advising,
    idle: Avatars.rocko.idle,
    standing: Avatars.rocko.standing,
  },
};

export function getAvatarAsset(
  avatarId: AvatarId | null | undefined,
  mood: AvatarMood = "idle"
): { src: string; name: string } {
  const resolvedId: AvatarId = avatarId === "rocko" ? "rocko" : "pingo";
  const meta = AVATAR_ASSETS[resolvedId];

  const src = mood === "standing" && meta.standing
    ? meta.standing
    : meta[mood] ?? meta.idle;

  return { src, name: meta.name };
}

export function isAvatarRocko(avatarId: AvatarId | null | undefined): boolean {
  return avatarId === "rocko";
}