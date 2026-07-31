import { useState, useEffect, useRef } from "react";

export function useElapsedTime(running: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (running && startRef.current === null) {
      startRef.current = Date.now();
    }
    if (!running) {
      startRef.current = null;
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      if (startRef.current) {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  return elapsed;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
