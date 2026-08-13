const MAX_FRAME_GAP_MS = 5000;

export class HoldTracker {
  private lastTimestamp = 0;
  private holdMs = 0;

  update(active: boolean, timestamp: number): number {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return this.holdMs;
    }

    const dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (active && dt > 0 && dt < MAX_FRAME_GAP_MS) {
      this.holdMs += dt;
    }

    return this.holdMs;
  }

  getHoldMs(): number {
    return this.holdMs;
  }

  reset(): void {
    this.lastTimestamp = 0;
    this.holdMs = 0;
  }
}