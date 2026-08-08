import type { AvatarMotion } from "../types";

/**
 * Per-motion limb targets shared by every procedural avatar.
 * Each model interprets these into its own rotations/positions.
 */
export interface LimbTargets {
  /** Animation cycle speed. */
  speed: number;
  /** How high the arms/wings are lifted (0 = hanging, ~1.9 = overhead). */
  armRaise: number;
  /** Side-to-side swing of the arms (opposite phase per arm). */
  armSwing: number;
  /** Alternate leg lift amount for marching/walking. */
  legLift: number;
  /** How far the legs spread apart (0..1, for jumping jacks). */
  legSpread: number;
  /** Extra flutter added on top of the arm raise. */
  flap: number;
}

export function limbTargets(motion: AvatarMotion, t: number): LimbTargets {
  switch (motion) {
    case "idle":
      return {
        speed: 1.7,
        armRaise: 0.1,
        armSwing: Math.sin(t * 1.3) * 0.25,
        legLift: 0,
        legSpread: 0,
        flap: 0.08,
      };
    case "jumping":
      return {
        speed: 9,
        armRaise: 1.45,
        armSwing: 0,
        legLift: 0,
        legSpread: (1 - Math.cos(t * 9)) / 2,
        flap: Math.sin(t * 9) * 0.3,
      };
    case "squat":
      return {
        speed: 1,
        armRaise: 0.55,
        armSwing: 0,
        legLift: 0,
        legSpread: 0.14,
        flap: 0,
      };
    case "marching":
      return {
        speed: 7,
        armRaise: 0.18,
        armSwing: Math.sin(t * 7) * 1.2,
        legLift: Math.max(0, Math.sin(t * 7)),
        legSpread: 0,
        flap: Math.sin(t * 7) * 0.12,
      };
    case "celebrate":
      return {
        speed: 5,
        armRaise: 1.9,
        armSwing: Math.sin(t * 5) * 0.9,
        legLift: 0,
        legSpread: 0.3,
        flap: Math.sin(t * 5) * 0.18,
      };
  }
}