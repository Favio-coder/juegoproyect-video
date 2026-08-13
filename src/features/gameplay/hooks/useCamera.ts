import { useEffect, useRef, useState } from "react";
import { CameraService } from "../services/CameraService";

export function useCamera() {
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
      service.stopCamera();
    };
  }, []);

  return {
    videoRef,
    loading,
    error,
  };
}