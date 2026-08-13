import { useNavigate, useSearchParams } from "react-router-dom";
import { AVATAR_ASSETS } from "../../../core/utils/avatarAssets";
import { useAppStore } from "../../../core/store/appStore";

const CONFETTI = ["🎉", "⭐", "🎊", "✨", "🏅", "🌟"];

export default function RewardPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const selectedAvatar = useAppStore((s) => s.selectedAvatar);

  const rawName = params.get("nombre");
  const name = rawName?.trim() || "Campeón";
  const pointsRaw = params.get("puntos");
  const points = Number.isFinite(Number(pointsRaw)) ? Number(pointsRaw) : 0;
  const hasParams = Boolean(rawName || pointsRaw);

  const avatarParam = params.get("avatar");
  const avatarId =
    avatarParam === "rocko"
      ? "rocko"
      : avatarParam === "pingo"
      ? "pingo"
      : selectedAvatar === "rocko"
      ? "rocko"
      : "pingo";
  const avatarName = avatarId === "rocko" ? "Rocko" : "Pingo";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      {CONFETTI.map((emoji, i) => (
        <span
          key={i}
          className="reward-confetti"
          style={{
            position: "absolute",
            top: "-40px",
            left: `${(i * 17 + 4) % 100}%`,
            fontSize: `${26 + (i % 3) * 10}px`,
            animationDelay: `${(i % 7) * 0.6}s`,
            animationDuration: `${3.5 + (i % 3) * 1.2}s`,
            opacity: 0.9,
            zIndex: 5,
          }}
        >
          {emoji}
        </span>
      ))}

      <div className="animate-bounce-in" style={{ fontSize: 96 }}>
        🎉
      </div>

      <h1
        style={{
          fontSize: 44,
          fontWeight: 800,
          margin: 0,
          maxWidth: 640,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ¡Felicidades, {name}!
      </h1>

      <img
        src={AVATAR_ASSETS[avatarId].happy}
        alt={`${avatarName} feliz`}
        className="reward-avatar"
        style={{
          width: 160,
          height: 160,
          objectFit: "contain",
          filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))",
        }}
      />

      <span
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          padding: "6px 20px",
          borderRadius: 999,
          fontSize: 17,
          fontWeight: 700,
        }}
      >
        🐾 Premio de {avatarName}
      </span>

      {hasParams ? (
        <>
          <p style={{ color: "#cbd5e1", fontSize: 22, margin: 0 }}>
            Tuviste
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(251,191,36,0.1)",
              padding: "14px 44px",
              borderRadius: 20,
              border: "1px solid rgba(251,191,36,0.3)",
            }}
          >
            <span style={{ fontSize: 36 }}>⭐</span>
            <span
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "#fbbf24",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {points}
            </span>
            <span style={{ fontSize: 20, color: "#cbd5e1" }}>puntos</span>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
            <button
              onClick={() => navigate("/juego")}
              style={{
                padding: "16px 38px",
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                fontSize: 19,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🎮 Jugar de nuevo
            </button>
            <button
              onClick={() => navigate("/ranking")}
              style={{
                padding: "16px 38px",
                borderRadius: 16,
                border: "1px solid #334155",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                fontSize: 19,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🏆 Ver ranking
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ color: "#f87171", fontSize: 20, fontWeight: 600, margin: 0 }}>
            Este enlace no es válido. Termina una partida para ganar tu premio.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "16px 38px",
              borderRadius: 16,
              border: "none",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              fontSize: 19,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ← Ir al menú
          </button>
        </>
      )}

      <style>{`
        .animate-bounce-in {
          animation: rewardBounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes rewardBounceIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .reward-avatar {
          animation: rewardFloat 2.6s ease-in-out infinite;
        }
        @keyframes rewardFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }
        .reward-confetti {
          animation-name: rewardFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes rewardFall {
          0% { transform: translateY(-60px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}