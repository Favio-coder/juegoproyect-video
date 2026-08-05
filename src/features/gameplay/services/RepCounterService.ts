import type { Landmark } from "../types/pose.types";
import type { PoseChallenge } from "../types/game.types";

export class RepCounterService {
  private activeFrames = 0;
  private touchedActive = false;
  private readonly requiredActiveFrames = 3;

  update(challenge: PoseChallenge, landmarks: Landmark[]): boolean {
    if (challenge.isActive(landmarks)) {
      this.activeFrames += 1;
      if (this.activeFrames >= this.requiredActiveFrames) {
        this.touchedActive = true;
      }
      return false;
    }

    const rep = this.touchedActive && this.activeFrames > 0;
    this.activeFrames = 0;
    this.touchedActive = false;
    return rep;
  }

  reset(): void {
    this.activeFrames = 0;
    this.touchedActive = false;
  }
}