import { useEffect, useState } from "react";
import { useRewardPrinter } from "../hooks/useRewardPrinter";
import { RewardService } from "../services/RewardService";

interface PrinterModalProps {
  playerName: string;
  exerciseCount: number;
  onClose: () => void;
}

const STATE_LABEL: Record<string, string> = {
  unsupported: "Tu navegador no soporta Web Bluetooth (usa Chrome o Edge)",
  idle: "Conecta la impresora para empezar",
  connecting: "Conectando con la impresora…",
  connected: "Impresora conectada",
  printing: "Imprimiendo sticker…",
  printed: "¡Sticker impreso!",
  error: "Algo salió mal",
};

export default function PrinterModal({
  playerName,
  exerciseCount,
  onClose,
}: PrinterModalProps) {
  const { state, error, connect, printSticker, disconnect } = useRewardPrinter(
    playerName,
    exerciseCount
  );
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    RewardService.createStickerCanvas({
      playerName,
      exerciseCount,
      qrText: RewardService.buildQrText(playerName),
    })
      .then((canvas) => {
        if (!cancelled) setPreview(canvas.toDataURL("image/png"));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [playerName, exerciseCount]);

  return (
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
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: "32px 28px",
          maxWidth: 360,
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
          onClick={onClose}
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
          🖨 Tu sticker de campeón
        </h2>

        {preview && (
          <div
            style={{
              width: 180,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src={preview}
              alt="Vista previa del sticker"
              style={{ height: 260, maxWidth: "100%", objectFit: "contain" }}
            />
          </div>
        )}

        <p
          style={{
            fontSize: 14,
            color: "#64748b",
            textAlign: "center",
            margin: 0,
            minHeight: 20,
          }}
        >
          {STATE_LABEL[state]}
        </p>

        {state === "error" && error && (
          <p style={{ fontSize: 13, color: "#dc2626", textAlign: "center", margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {(state === "idle" || state === "error") && (
            <button
              onClick={connect}
              style={{
                padding: "14px 26px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #38bdf8, #0284c7)",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Conectar impresora
            </button>
          )}

          {(state === "connected" ||
            state === "printing" ||
            state === "printed") && (
            <button
              onClick={printSticker}
              disabled={state === "printing"}
              style={{
                padding: "14px 26px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: state === "printing" ? "wait" : "pointer",
                opacity: state === "printing" ? 0.7 : 1,
              }}
            >
              {state === "printing"
                ? "Imprimiendo…"
                : state === "printed"
                  ? "Imprimir de nuevo"
                  : "Imprimir sticker"}
            </button>
          )}

          {state === "connected" && (
            <button
              onClick={disconnect}
              style={{
                padding: "14px 18px",
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                background: "transparent",
                color: "#64748b",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Desconectar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
