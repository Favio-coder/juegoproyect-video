import { useEffect, useRef, useState } from "react";
import { CameraService } from "../services/CameraService";

export function useCamera(streamOverride?: MediaStream | null) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cameraService = useRef(new CameraService());

  useEffect(() => {
    const service = cameraService.current;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const setup = async () => {
      try {
        if (streamOverride) {
          video.srcObject = streamOverride;
          await video.play();
          if (!cancelled) {
            setLoading(false);
            setError(null);
          }
          return;
        }

        const stream = await service.startCamera();

        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (!cancelled) {
            setLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("No se pudo acceder a la cámara.");
          setLoading(false);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (!streamOverride) {
        service.stopCamera();
      }
    };
  }, [streamOverride]);

  return {
    videoRef,
    loading,
    error,
  };
}