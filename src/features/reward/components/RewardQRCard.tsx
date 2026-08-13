import { useEffect, useRef } from "react";
import QRCodeLib from "qrcode";
import { AVATAR_ASSETS } from "../../../core/utils/avatarAssets";
import type { RewardAvatar } from "../../../core/utils/reward";

interface RewardQRCardProps {
  qrUrl: string;
  avatar?: RewardAvatar | null;
}

export default function RewardQRCard({ qrUrl, avatar }: RewardQRCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarId = avatar === "rocko" ? "rocko" : "pingo";
  const avatarName = avatarId === "rocko" ? "Rocko" : "Pingo";

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCodeLib.toCanvas(canvasRef.current, qrUrl, {
      width: 230,
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
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f1f5f9",
          padding: "8px 18px",
          borderRadius: 999,
          border: "2px dashed #cbd5e1",
        }}
      >
        <img
          src={AVATAR_ASSETS[avatarId].happy}
          alt={avatarName}
          style={{ width: 44, height: 44, objectFit: "contain" }}
        />
        <span style={{ fontSize: 18, fontWeight: 800, color: "#1e293b" }}>
          Premio de {avatarName}
        </span>
      </div>

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
          margin: 0,
        }}
      >
        Escanea este código con tu teléfono para ver tu premio 🎉
      </p>
    </div>
  );
}