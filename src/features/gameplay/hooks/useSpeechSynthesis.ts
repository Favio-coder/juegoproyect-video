import { useEffect, useRef, useState, useCallback } from "react";

function isSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Text-to-speech with a friendly, cartoon-like Spanish voice
 * (high pitch, clear rate) aimed at young kids.
 */
export function useSpeechSynthesis() {
  const supported = isSupported();
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [supported]);

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;

    const spanish = voices.filter((v) =>
      (v.lang ?? "").toLowerCase().startsWith("es")
    );

    const pick = (list: SpeechSynthesisVoice[]) =>
      list.find((v) => /Google español/i.test(v.name)) ??
      list.find((v) => /español de Estados Unidos|Spanish/i.test(v.name)) ??
      list.find((v) => /es-mx/i.test(v.lang ?? "")) ??
      list.find((v) => /Microsoft.*(Sabina|Helena)/i.test(v.name)) ??
      list[0];

    return pick(spanish) ?? voices[0];
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || muted || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = "es-ES";
      utterance.pitch = 1.4;
      utterance.rate = 1.0;
      utterance.volume = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [supported, muted, pickVoice]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  return { speak, stop, speaking, supported, muted, setMuted };
}