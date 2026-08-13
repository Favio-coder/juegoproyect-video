import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ForestBackground from "./ForestBackground";
import { useAppStore } from "../../../core/store/appStore";
import { useAvatarAsset } from "../../../core/hooks/useAvatarAsset";
import { getIntroParts } from "../constants/game.constants";
import panelSvg from "../../../assets/paneles/PanelMensaje.svg";

interface StoryIntroProps {
  onStart: () => void;
}

export default function StoryIntro({ onStart }: StoryIntroProps) {
  const playerName = useAppStore((s) => s.playerName);
  const selectedAvatar = useAppStore((s) => s.selectedAvatar);
  const avatarName = selectedAvatar === "rocko" ? "Rocko" : "Pingo";
  const { src } = useAvatarAsset("happy");

  const [step, setStep] = useState(1);

  const { greeting, plan, goal, ready } = getIntroParts(playerName, avatarName);
  const steps = [greeting, plan, goal, ready];
  const currentText = steps[step - 1];
  const isLast = step === steps.length;

  const handleAdvance = useCallback(() => {
    if (isLast) {
      onStart();
      return;
    }
    setStep((prev) => prev + 1);
  }, [isLast, onStart]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAdvance]);

  return (
    <div
      style={{
        position: "relative",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        overflow: "hidden",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <ForestBackground />

      <div
        className="story-intro-wrap"
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          maxWidth: "min(900px, 100%)",
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="story-intro-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            border: "2px solid rgba(255,255,255,0.35)",
            padding: "10px 28px",
            borderRadius: 999,
          }}
        >
          <span style={{ fontSize: 30 }}>⭐</span>
          <span className="story-intro-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: 1 }}>
            ¡Una nueva aventura!
          </span>
        </motion.div>

        <div className="story-intro-body">
          <motion.img
            src={src}
            alt={avatarName}
            animate={{ y: [0, -14, 0], rotate: [0, -4, 4, 0] }}
            transition={{
              y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="story-intro-avatar"
            style={{
              objectFit: "contain",
              flexShrink: 0,
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))",
            }}
          />

          <div
            className="story-intro-panel"
            style={{
              flex: 1,
              backgroundImage: `url(${panelSvg})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "7% 9%",
                background: "rgba(31, 22, 12, 0.22)",
                borderRadius: 14,
                pointerEvents: "none",
              }}
            />
            <div
              className="story-intro-textbox"
              style={{
                position: "relative",
                zIndex: 1,
                width: "100%",
                display: "flex",
                alignItems: "center",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="story-intro-text"
                  style={{
                    margin: 0,
                    color: "white",
                    fontWeight: 700,
                    lineHeight: 1.45,
                    textShadow: "0 3px 8px rgba(0,0,0,0.7)",
                  }}
                >
                  {currentText}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {steps.map((_, i) => (
            <motion.span
              key={i}
              animate={{ scale: step === i + 1 ? 1.25 : 1 }}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: step === i + 1 ? "#fbbf24" : "rgba(255,255,255,0.35)",
                boxShadow: step === i + 1 ? "0 0 12px rgba(251,191,36,0.8)" : "none",
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleAdvance}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="story-intro-btn"
          style={{
            borderRadius: 22,
            border: "none",
            background: isLast
              ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
              : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: isLast
              ? "0 10px 40px rgba(245,158,11,0.45)"
              : "0 10px 40px rgba(34,197,94,0.4)",
          }}
        >
          {isLast ? "¡Comenzar! 🚀" : "Siguiente ➡️"}
        </motion.button>

        <span style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 600 }}>
          Presiona espacio o enter
        </span>
      </div>

      <style>{`
        .story-intro-body {
          display: flex;
          align-items: center;
          gap: 28px;
          width: 100%;
        }
        .story-intro-avatar {
          width: 200px;
          height: 200px;
        }
        .story-intro-panel {
          min-height: 250px;
          padding: 7% 9%;
        }
        .story-intro-textbox {
          min-height: 170px;
        }
        .story-intro-text {
          font-size: 40px;
        }
        .story-intro-btn {
          padding: 22px 70px;
          font-size: 34px;
        }
        @media (max-width: 820px) {
          .story-intro-body {
            flex-direction: column;
            gap: 16px;
          }
          .story-intro-avatar {
            width: 130px;
            height: 130px;
          }
          .story-intro-panel {
            min-height: 180px;
            padding: 6% 8%;
          }
          .story-intro-textbox {
            min-height: 150px;
          }
          .story-intro-text {
            font-size: 26px;
          }
          .story-intro-title {
            font-size: 22px !important;
          }
          .story-intro-btn {
            padding: 16px 44px;
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}