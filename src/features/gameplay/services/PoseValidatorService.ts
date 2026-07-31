import type { Landmark } from "../types/pose.types";
import type { PoseChallenge } from "../types/game.types";

export class PoseValidatorService {
  private holdFrames: Map<string, number> = new Map();
  private readonly requiredFrames = 3;

  validate(
    challenge: PoseChallenge,
    landmarks: Landmark[]
  ): boolean {
    const key = challenge.id;

    const matches = challenge.validate(landmarks);

    if (matches) {
      const count = (this.holdFrames.get(key) ?? 0) + 1;
      this.holdFrames.set(key, count);
      return count >= this.requiredFrames;
    }

    this.holdFrames.set(key, 0);
    return false;
  }

  reset(challengeId?: string): void {
    if (challengeId) {
      this.holdFrames.set(challengeId, 0);
    } else {
      this.holdFrames.clear();
    }
  }
}
