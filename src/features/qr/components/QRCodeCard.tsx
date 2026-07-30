import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";

interface QRCodeCardProps {
  qrUrl: string;
  sessionId: string;
}

export default function QRCodeCard({ qrUrl, sessionId }: QRCodeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCodeLib.toCanvas(canvasRef.current, qrUrl, {
      width: 250,
      margin: 2,
      color: {
        dark: "#1e293b",
        light: "#ffffff",
      },
    });
  }, [qrUrl]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      />

      <p
        style={{
          fontSize: 14,
          color: "#64748b",
          textAlign: "center",
          maxWidth: 280,
        }}
      >
        Escanea este código con tu teléfono o ingresa el código de sesión
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f1f5f9",
          padding: "8px 20px",
          borderRadius: 10,
          border: "2px dashed #cbd5e1",
          userSelect: "all",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 4,
            color: "#1e293b",
          }}
        >
          {sessionId}
        </span>
      </div>
    </div>
  );
}
