import type { ConnectionStatus as Status } from "../types/connection.types";

interface ConnectionStatusProps {
  status: Status;
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string }
> = {
  idle: { label: "Inactivo", color: "#94a3b8", bg: "#f1f5f9" },
  waiting: {
    label: "Esperando teléfono...",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  connecting: { label: "Conectando...", color: "#3b82f6", bg: "#eff6ff" },
  connected: { label: "Teléfono conectado", color: "#22c55e", bg: "#f0fdf4" },
  error: { label: "Error de conexión", color: "#ef4444", bg: "#fef2f2" },
  disconnected: {
    label: "Teléfono desconectado",
    color: "#64748b",
    bg: "#f8fafc",
  },
};

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: 12,
        background: config.bg,
        border: `1px solid ${config.color}30`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: config.color,
          animation:
            status === "waiting" || status === "connecting"
              ? "pulse 1.5s infinite"
              : "none",
          flexShrink: 0,
        }}
      />

      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: config.color,
        }}
      >
        {config.label}
      </span>

      {status === "connected" && (
        <span style={{ fontSize: 18, marginLeft: 4 }}>📱</span>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
