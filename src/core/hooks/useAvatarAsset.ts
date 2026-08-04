import { useAppStore } from "../store/appStore";
import { getAvatarAsset, type AvatarMood } from "../utils/avatarAssets";

export function useAvatarAsset(mood: AvatarMood = "idle") {
  const avatarId = useAppStore((s) => s.selectedAvatar);
  return getAvatarAsset(avatarId, mood);
}