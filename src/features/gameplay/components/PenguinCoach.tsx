import { useState, useEffect } from "react";
import panelSvg from "../../../assets/paneles/PanelMensaje.svg";
import { useAvatarAsset } from "../../../core/hooks/useAvatarAsset";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

interface PenguinCoachProps {
  message: string;
  mood: "happy" | "idle" | "advising";
  size?: "sm" | "lg";
}

export default function PenguinCoach({ message, mood, size = "sm" }: PenguinCoachProps) {
  const { src, name } = useAvatarAsset(mood);
  const { speak } = useSpeechSynthesis();
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (message.length === 0) return;

    const interval = setInterval(() => {
      setCharCount((prev) => {
        const next = prev + 1;
        if (next >= message.length) {
          clearInterval(interval);
        }
        return next;
      });
    }, 18);

    return () => clearInterval(interval);
  }, [message]);

  useEffect(() => {
    if (message.trim().length > 0) speak(message);
  }, [message, speak]);

  const displayedMessage = message.slice(0, charCount);
  const isTyping = charCount < message.length;

  const isLarge = size === "lg";

  if (mood === "advising" || isLarge) {
    const avatarSize = isLarge ? 150 : 72;
    const fontSize = isLarge ? 32 : 22;
    const padding = isLarge ? "16% 10%" : "13% 9%";
    const minHeight = isLarge ? 190 : 110;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isLarge ? 26 : 16,
          maxWidth: "100%",
        }}
      >
        <img
          src={src}
          alt={name}
          style={{
            width: avatarSize,
            height: avatarSize,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            backgroundImage: `url(${panelSvg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            padding,
            position: "relative",
            display: "flex",
            alignItems: "center",
            minHeight,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: padding,
              background: "rgba(31, 22, 12, 0.22)",
              borderRadius: 10,
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              margin: 0,
              color: "white",
              fontSize,
              fontWeight: 700,
              lineHeight: 1.5,
              minHeight: "1.5em",
              position: "relative",
              zIndex: 1,
              textShadow: "0 2px 6px rgba(0,0,0,0.7)",
            }}
          >
            {displayedMessage}
            <span
              style={{
                animation: "blink 0.8s infinite",
                opacity: isTyping ? 1 : 0,
              }}
            >
              _
            </span>
          </p>
        </div>
        <style>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 22px",
        background: "rgba(0,0,0,0.6)",
        borderRadius: 22,
        backdropFilter: "blur(8px)",
        maxWidth: "100%",
      }}
    >
      <img
        src={src}
        alt={name}
        style={{
          width: 72,
          height: 72,
          objectFit: "contain",
          flexShrink: 0,
          transition: "transform 0.3s",
          transform: mood === "happy" ? "scale(1.1)" : "scale(1)",
        }}
      />

      <div
        style={{
          background: "rgba(255,255,255,0.12)",
          borderRadius: 16,
          padding: "12px 22px",
          position: "relative",
          flex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid rgba(255,255,255,0.12)",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "white",
            fontSize: 22,
            fontWeight: 600,
            lineHeight: 1.5,
            minHeight: "1.5em",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}
        >
          {displayedMessage}
          <span
            style={{
              animation: "blink 0.8s infinite",
              opacity: isTyping ? 1 : 0,
            }}
          >
            _
          </span>
        </p>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
