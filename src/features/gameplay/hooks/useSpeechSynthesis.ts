import { useCallback } from "react";

/**
 * No-op stub: la voz (text-to-speech) se eliminó de la aplicación.
 * Se mantiene para que cualquier import existente siga compilando sin cambios.
 */
export function useSpeechSynthesis() {
  const speak = useCallback(() => {}, []);
  const stop = useCallback(() => {}, []);
  const setMuted = useCallback(() => {}, []);

  return { speak, stop, speaking: false, supported: false, muted: true, setMuted };
}