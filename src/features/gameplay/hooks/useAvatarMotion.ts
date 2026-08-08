import type { PoseChallenge, GameState } from "../types/game.types";
import type { PoseResult } from "../types/pose.types";

export type AvatarMotion =
  | "idle"
  | "jumping"
  | "squat"
  | "marching"
  | "celebrate";

export function interpretAvatarMotion(
  pose: PoseResult | null,
  challenge: PoseChallenge | null,
  state: GameState
): AvatarMotion {
  if (state === "success") return "celebrate";
  if (state !== "showingPose" || !challenge || !pose?.detected) return "idle";
  if (!challenge.isActive(pose.landmarks)) return "idle";

  switch (challenge.id) {
    case "jumping_jacks":
      return "jumping";
    case "squats":
      return "squat";
    case "march":
      return "marching";
  }
}