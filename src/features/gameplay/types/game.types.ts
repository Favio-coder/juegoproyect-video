import type { Landmark } from "./pose.types";

export type GameState =
  | "intro"
  | "countdown"
  | "challengeIntro"
  | "showingPose"
  | "checkingPose"
  | "success"
  | "timeout"
  | "gameOver";

export type ExerciseId = "jumping_jacks" | "squats" | "march";

export interface PoseChallenge {
  id: ExerciseId;
  label: string;
  description: string;
  emoji: string;
  repsToComplete: number;
  timeLimitSeconds: number;
  isActive: (landmarks: Landmark[]) => boolean;
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
