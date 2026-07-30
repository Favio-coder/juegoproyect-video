import { useEffect, useRef, useState } from "react";

import type { PoseResult } from "../types/pose.types";
import { PoseDetectorService } from "../services/PoseDetectorService";

export function usePoseDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const detector = useRef(new PoseDetectorService());

  const [pose, setPose] = useState<PoseResult | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let animationId: number;

    const run = async () => {
      try {
        await detector.current.initialize();
        initialized.current = true;
      } catch (err) {
        console.error("Error al inicializar el detector de pose:", err);
        return;
      }

      const detect = () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          const result = detector.current.detect(videoRef.current);

          if (result) {
            setPose(result);
          }
        }

        animationId = requestAnimationFrame(detect);
      };

      detect();
    };

    run();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [videoRef]);

  return pose;
}