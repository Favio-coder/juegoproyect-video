import { useEffect, useRef, useState, useCallback, useMemo } from "react";

export function useCountdown(
  seconds: number,
  onComplete: () => void
) {
  const [current, setCurrent] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    setCurrent(seconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          onCompleteRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return stop;
  }, [stop]);

  return useMemo(
    () => ({ current, start, stop, isRunning }),
    [current, start, stop, isRunning]
  );
}
