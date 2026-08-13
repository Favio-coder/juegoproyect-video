import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

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
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div className="nf-bounce-in" style={{ fontSize: 90 }}>
        🐧
      </div>

      <h1
        style={{
          fontSize: 64,
          fontWeight: 900,
          margin: 0,
          background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: 30,
          fontWeight: 800,
          margin: 0,
          maxWidth: 480,
        }}
      >
        ¡Ups! Esta página no se encuentra
      </h2>

      <p style={{ color: "#94a3b8", fontSize: 18, fontWeight: 600, margin: 0, maxWidth: 440 }}>
        Parece que te perdiste en el bosque. Vuelve al menú principal para seguir jugando.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "18px 44px",
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Ir al menú principal
        </button>

        <button
          onClick={() => navigate("/ranking")}
          style={{
            padding: "18px 44px",
            borderRadius: 16,
            border: "1px solid #334155",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontSize: 20,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🏆 Ver ranking
        </button>
      </div>

      <style>{`
        .nf-bounce-in {
          animation: nfBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes nfBounce {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          60% { transform: scale(1.2) rotate(6deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}