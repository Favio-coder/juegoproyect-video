import { useState, useEffect } from "react";
import panelSvg from "../../../assets/paneles/PanelMensaje.svg";
import { useAvatarAsset } from "../../../core/hooks/useAvatarAsset";

interface PenguinCoachProps {
  message: string;
  mood: "happy" | "idle" | "advising";
  size?: "sm" | "lg";
}

export default function PenguinCoach({ message, mood, size = "sm" }: PenguinCoachProps) {
  const { src, name } = useAvatarAsset(mood);
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
    }, 30);

    return () => clearInterval(interval);
  }, [message]);

  const displayedMessage = message.slice(0, charCount);
  const isTyping = charCount < message.length;

  const isLarge = size === "lg";

  if (mood === "advising" || isLarge) {
    const avatarSize = isLarge ? 132 : 64;
    const fontSize = isLarge ? 26 : 18;
    const padding = isLarge ? "16% 9%" : "14% 8%";
    const minHeight = isLarge ? 150 : 80;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isLarge ? 24 : 14,
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
              background: "rgba(0,0,0,0.35)",
              borderRadius: 8,
              pointerEvents: "none",
            }}
          />
          <p
            style={{
              margin: 0,
              color: "white",
              fontSize,
              fontWeight: 700,
              lineHeight: 1.4,
              minHeight: "1.4em",
              position: "relative",
              zIndex: 1,
              textShadow: "0 1px 4px rgba(0,0,0,0.6)",
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
        gap: 14,
        padding: "10px 18px",
        background: "rgba(0,0,0,0.6)",
        borderRadius: 18,
        backdropFilter: "blur(8px)",
        maxWidth: "100%",
      }}
    >
      <img
        src={src}
        alt={name}
        style={{
          width: 64,
          height: 64,
          objectFit: "contain",
          flexShrink: 0,
          transition: "transform 0.3s",
          transform: mood === "happy" ? "scale(1.1)" : "scale(1)",
        }}
      />

      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          borderRadius: 14,
          padding: "10px 18px",
          position: "relative",
          flex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -7,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "7px solid transparent",
            borderBottom: "7px solid transparent",
            borderRight: "7px solid rgba(255,255,255,0.1)",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "white",
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.4,
            minHeight: "1.4em",
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
