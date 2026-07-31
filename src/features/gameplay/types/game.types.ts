import type { Landmark } from "./pose.types";

export type GameState =
  | "intro"
  | "countdown"
  | "challengeIntro"
  | "showingPose"
  | "checkingPose"
  | "success"
  | "gameOver";

export type PoseId =
  | "arms_up"
  | "right_arm_up"
  | "left_arm_up"
  | "squat"
  | "t_pose"
  | "one_foot";

export interface PoseChallenge {
  id: PoseId;
  label: string;
  description: string;
  emoji: string;
  validate: (landmarks: Landmark[]) => boolean;
}

export interface Round {
  challenge: PoseChallenge;
  attempts: number;
  completed: boolean;
  score: number;
}

export interface GameConfig {
  totalRounds: number;
  countdownSeconds: number;
  successDelayMs: number;
  checkIntervalMs: number;
  baseScore: number;
}
