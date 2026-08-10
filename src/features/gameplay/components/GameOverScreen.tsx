import { useState, useEffect, useCallback } from "react";
import { usePhoneConnection } from "../../qr/hooks/usePhoneConnection";
import QRCodeCard from "../../qr/components/QRCodeCard";
import ConnectionStatus from "../../qr/components/ConnectionStatus";
import { useAppStore } from "../../../core/store/appStore";
import { useAvatarAsset } from "../../../core/hooks/useAvatarAsset";
import PrinterModal from "../../qr/components/PrinterModal";

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
  const {
    session,
    status,
    startListening,
    stopListening,
  } = usePhoneConnection();

  const [showQR, setShowQR] = useState(false);
  const [showPrinter, setShowPrinter] = useState(false);
  const playerName = useAppStore((s) => s.playerName);
  const { src: happySvg, name } = useAvatarAsset("happy");

  const greeting = playerName && playerName.trim().length > 0 ? playerName.trim() : "Campeón";

  const handleShowQR = useCallback(() => {
    startListening();
    setShowQR(true);
  }, [startListening]);

  const handleCloseQR = useCallback(() => {
    stopListening();
    setShowQR(false);
  }, [stopListening]);

  const handlePlayAgain = useCallback(() => {
    onPlayAgain();
  }, [onPlayAgain]);

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
          onClick={handleShowQR}
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
          📱 Conectar teléfono
        </button>

        <button
          onClick={() => setShowPrinter(true)}
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
          🖨 Imprimir sticker
        </button>
      </div>

      <span style={{ color: "#94a3b8", fontSize: 16, fontWeight: 600 }}>
        Presiona espacio o enter para jugar de nuevo
      </span>

      {showQR && session && (
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
            if (e.target === e.currentTarget) handleCloseQR();
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "36px 32px",
              maxWidth: 380,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <button
              onClick={handleCloseQR}
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
              Conectar teléfono
            </h2>

            <ConnectionStatus status={status} />

            <QRCodeCard
              qrUrl={session.qrUrl}
              sessionId={session.sessionId}
            />
          </div>
        </div>
      )}

      {showPrinter && (
        <PrinterModal
          playerName={greeting}
          exerciseCount={totalRounds}
          onClose={() => setShowPrinter(false)}
        />
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
