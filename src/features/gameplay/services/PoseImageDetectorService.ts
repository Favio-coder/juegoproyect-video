import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

import type { PoseResult, Landmark } from "../types/pose.types";

export class PoseImageDetectorService {
  private poseLandmarker: PoseLandmarker | null = null;

  async initialize() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    )

    this.poseLandmarker = await PoseLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      }
    )
  }

  detect(image: HTMLImageElement | HTMLCanvasElement): PoseResult | null {
    if (!this.poseLandmarker) {
      return null;
    }

    const result = this.poseLandmarker.detect(image);

    if (!result.landmarks.length) {
      return {
        detected: false,
        landmarks: [],
        timestamp: Date.now(),
      };
    }

    const landmarks: Landmark[] = result.landmarks[0].map((point) => ({
      x: point.x,
      y: point.y,
      z: point.z,
      visibility: point.visibility,
    }));

    return {
      detected: true,
      landmarks,
      timestamp: Date.now(),
    };
  }
}
