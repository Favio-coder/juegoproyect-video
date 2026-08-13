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

export type ChallengeId =
  | "right_hand"
  | "left_hand"
  | "both_hands"
  | "t_pose"
  | "jumping_jacks"
  | "march";

export type ChallengeKind = "hold" | "reps";

export interface PoseChallenge {
  id: ChallengeId;
  kind: ChallengeKind;
  label: string;
  description: string;
  emoji: string;
  repsToComplete: number;
  holdSeconds: number;
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