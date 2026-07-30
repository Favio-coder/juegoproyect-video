import { useState } from "react";
import CameraView from "../components/CameraView";
import { usePhoneConnection } from "../../qr/hooks/usePhoneConnection";
import QRCodeCard from "../../qr/components/QRCodeCard";
import ConnectionStatus from "../../qr/components/ConnectionStatus";

export default function GameplayPage() {
  const {
    session,
    status,
    remoteStream,
    error: connectionError,
    startListening,
    stopListening,
  } = usePhoneConnection();

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    startListening();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    stopListening();
    setShowModal(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        gap: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleOpenModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 12,
            border: "none",
            background: status === "connected" ? "#22c55e" : "#1e293b",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <span style={{ fontSize: 18 }}>
            {status === "connected" ? "📱" : "📷"}
          </span>
          {status === "connected"
            ? "Teléfono conectado"
            : "Conectar teléfono"}
        </button>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 900,
        }}
      >
        <CameraView remoteStream={remoteStream} />
      </div>

      {connectionError && (
        <div
          style={{
            color: "#ef4444",
            fontSize: 14,
            background: "#fef2f2",
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          {connectionError.message}
        </div>
      )}

      {showModal && session && (
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
            if (e.target === e.currentTarget) handleCloseModal();
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
              onClick={handleCloseModal}
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

            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                textAlign: "center",
                margin: 0,
              }}
            >
              Abre la cámara de tu teléfono, escanea el QR y acepta los
              permisos. El video se transmitirá en tiempo real al juego.
            </p>

            {status === "connected" && (
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "10px 32px",
                  borderRadius: 10,
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ¡Comenzar!
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}