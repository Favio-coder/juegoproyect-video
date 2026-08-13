import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../../core/store/appStore";
import { useAvatarAsset } from "../../../core/hooks/useAvatarAsset";
import { recordSession } from "../../supabase/services/supabaseService";
import { isSupabaseConfigured } from "../../../core/services/supabaseClient";
import { buildRewardUrl } from "../../../core/utils/reward";
import RewardQRCard from "../../reward/components/RewardQRCard";

interface GameOverScreenProps {
  score: number;
  totalRounds: number;
  onPlayAgain: () => void;
}

export default function GameOverScreen({
  score,
  totalRounds,
  onPlayAgain,
}: GameOverScreenProps) {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const playerName = useAppStore((s) => s.playerName);
  const selectedAvatar = useAppStore((s) => s.selectedAvatar);
  const { src: happySvg, name } = useAvatarAsset("happy");
  const recordedRef = useRef(false);

  const greeting = playerName && playerName.trim().length > 0 ? playerName.trim() : "Campeón";
  const avatarId = selectedAvatar === "rocko" ? "rocko" : "pingo";
  const rewardUrl = buildRewardUrl({ name: greeting, points: score, avatar: avatarId });

  useEffect(() => {
    if (recordedRef.current) return;
    if (!isSupabaseConfigured) return;
    const nameToSave = playerName?.trim();
    if (!nameToSave) return;

    recordedRef.current = true;
    void recordSession({
      playerName: nameToSave,
      avatar: selectedAvatar,
      score,
      totalRounds,
      completedRounds: totalRounds,
    }).then((res) => {
      if (!res.ok && res.error) console.error("No se pudo guardar la partida:", res.error);
    });
  }, [playerName, selectedAvatar, score, totalRounds]);

  const handlePlayAgain = useCallback(() => {
    onPlayAgain();
  }, [onPlayAgain]);

  const handleViewReward = useCallback(() => {
    const url = new URL(rewardUrl);
    navigate(`${url.pathname}${url.search}`);
  }, [navigate, rewardUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handlePlayAgain();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayAgain]);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: 24,
        gap: 24,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        className="animate-bounce-in"
        style={{ fontSize: 100 }}
      >
        🎉
      </div>

      <h1
        style={{
          fontSize: 40,
          fontWeight: 800,
          margin: 0,
          textAlign: "center",
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ¡Lo lograste, {greeting}!
      </h1>

      <img
        src={happySvg}
        alt={`${name} feliz`}
        style={{
          width: 120,
          height: 120,
          objectFit: "contain",
        }}
      />

      <p style={{ color: "#cbd5e1", fontSize: 20, textAlign: "center", maxWidth: 420, lineHeight: 1.5 }}>
        Eres un verdadero guardián del movimiento. Completaste {totalRounds} ejercicios
        y obtuviste
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(251,191,36,0.1)",
          padding: "14px 36px",
          borderRadius: 18,
          border: "1px solid rgba(251,191,36,0.3)",
        }}
      >
        <span style={{ fontSize: 32 }}>🏆</span>
        <span style={{ fontSize: 42, fontWeight: 900, color: "#fbbf24" }}>
          {score}
        </span>
        <span style={{ fontSize: 18, color: "#cbd5e1" }}>puntos</span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <button
          onClick={handlePlayAgain}
          style={{
            padding: "18px 40px",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Jugar de nuevo
        </button>

        <button
          onClick={handleViewReward}
          style={{
            padding: "18px 40px",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            color: "#1e293b",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          🎁 Ver mi premio
        </button>

        <button
          onClick={() => setShowQR(true)}
          style={{
            padding: "18px 40px",
            borderRadius: 16,
            border: "1px solid #334155",
            background: "transparent",
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          🔳 Ver código QR
        </button>
      </div>

      <span style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>
        Presiona espacio o enter para jugar de nuevo
      </span>

      {showQR && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQR(false);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 380,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowQR(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#94a3b8",
                padding: 4,
              }}
            >
              ✕
            </button>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1e293b",
                margin: 0,
              }}
            >
              Tu premio 🎉
            </h2>

            <RewardQRCard qrUrl={rewardUrl} avatar={avatarId} />

            <button
              onClick={handleViewReward}
              style={{
                padding: "14px 30px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                color: "#1e293b",
                fontSize: 18,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}
            >
              🎁 Abrir mi premio
            </button>
          </div>
        </div>
      )}

      <style>{`
        .animate-bounce-in {
          animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}