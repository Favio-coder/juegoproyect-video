import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SessionService } from "../services/SessionService";
import { PeerService } from "../services/PeerService";
import type { ConnectionStatus } from "../types/connection.types";

const STATUS_MESSAGES: Record<string, { title: string; subtitle: string }> = {
  idle: { title: "Conectando...", subtitle: "Preparando conexión segura" },
  connecting: {
    title: "Conectando con el juego...",
    subtitle: "Estableciendo enlace directo",
  },
  connected: {
    title: "¡Conectado!",
    subtitle: "Tu cámara se está usando en el juego",
  },
  error: {
    title: "Error de conexión",
    subtitle: "Verifica que la PC esté en la pantalla de juego",
  },
  disconnected: {
    title: "Desconectado",
    subtitle: "Se perdió la conexión con el juego",
  },
};

export default function PhoneCameraPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerService = useRef(new PeerService());
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = peerService.current;

    const run = async () => {
      if (!sessionId || !SessionService.isValidSessionId(sessionId)) {
        return;
      }

      let localStream: MediaStream;

      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
      } catch {
        setError("No se pudo acceder a la cámara. Verifica los permisos.");
        return;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
        await videoRef.current.play();
      }

      service.setCallbacks({
        onStatus: (s) => setStatus(s),
        onStream: () => {},
        onError: (err) => {
          setError(err.message);
        },
      });

      try {
        await service.callPeer(sessionId, localStream);
      } catch {
        setError("No se pudo conectar con el juego");
      }
    };

    run();

    return () => {
      service.destroy();
    };
  }, [sessionId]);

  const sessionError =
    sessionId && !SessionService.isValidSessionId(sessionId)
      ? "Código de sesión inválido"
      : null;
  const displayError = error || sessionError;
  const msg = STATUS_MESSAGES[status] || STATUS_MESSAGES.idle;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        color: "white",
        padding: 24,
        gap: 24,
      }}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 16,
          transform: "scaleX(-1)",
          display: status === "connected" ? "block" : "none",
        }}
      />

      {status !== "connected" && (
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            aspectRatio: "4/3",
            borderRadius: 16,
            background: "#1e293b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {status === "connecting" || status === "idle" ? (
            <div
              style={{
                width: 40,
                height: 40,
                border: "3px solid #334155",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          ) : status === "error" || status === "disconnected" ? (
            <span style={{ fontSize: 40 }}>⚠️</span>
          ) : null}

          <p style={{ fontSize: 18, fontWeight: 700 }}>{msg.title}</p>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>{msg.subtitle}</p>
        </div>
      )}

      {displayError && (
        <div
          style={{
            maxWidth: 400,
            padding: "12px 20px",
            borderRadius: 10,
            background: "#7f1d1d",
            color: "#fca5a5",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {displayError}
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        style={{
          padding: "12px 28px",
          borderRadius: 12,
          border: "1px solid #334155",
          background: "#1e293b",
          color: "white",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Volver al inicio
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
