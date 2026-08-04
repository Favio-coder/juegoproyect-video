import { useState, useEffect, useCallback, useRef } from "react";
import { preloadAssets } from "../services/assetPreloader";

import videoMenu from "../../assets/videoMenu/videoMenu.mp4";
import { Avatars } from "../../assets";

interface UseAppLoadingReturn {
  progress: number;
  isLoaded: boolean;
}

export function useAppLoading(): UseAppLoadingReturn {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasStarted = useRef(false);

  const start = useCallback(async () => {
    setProgress(0);
    setIsLoaded(false);

    await preloadAssets(
      {
        fonts: [
          { family: "Fredoka", weight: "400" },
          { family: "Fredoka", weight: "600" },
          { family: "Fredoka", weight: "700" },
        ],
        video: videoMenu,
        images: [
          Avatars.pingo.happy,
          Avatars.pingo.idle,
          Avatars.rocko.happy,
          Avatars.rocko.idle,
        ],
      },
      setProgress
    );

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      start();
    }
  }, [start]);

  return { progress, isLoaded };
}
