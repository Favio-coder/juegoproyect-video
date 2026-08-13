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
      if (import.meta.env.DEV) {
        console.log(
          "[voz] voces disponibles:",
          voicesRef.current.map((v) => `${v.name} (${v.lang})`).join(" | ")
        );
      }
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
    const source = spanish.length > 0 ? spanish : voices;

    const rank = (v: SpeechSynthesisVoice): number => {
      const name = v.name;
      const lang = (v.lang ?? "").toLowerCase();
      if (/Google español de Estados Unidos/i.test(name)) return 1;
      if (/Google español/i.test(name)) return 2;
      if (/Microsoft.*(Helena|Sabina|Laura|Mónica|Marisol|Ximena)/i.test(name)) return 3;
      if (/espa\u00f1ol de Estados Unidos|spanish/i.test(name)) return 4;
      if (/es-mx/.test(lang)) return 5;
      if (/(female|mujer|Helena|Sabina|Laura|Mónica|Marisol|Paulina|Dalia|Elvira|Ximena)/i.test(name)) return 6;
      return 7;
    };

    return source.slice().sort((a, b) => rank(a) - rank(b))[0] ?? null;
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || muted || !text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.lang = "es-ES";
      utterance.pitch = 1.5;
      utterance.rate = 0.95;
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