import { useEffect, useRef, useState, useCallback } from "react";
import { PoseImageDetectorService } from "../services/PoseImageDetectorService";
import type { PoseResult, Landmark } from "../types/pose.types";

const POSE_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32],
  [15, 17], [17, 19], [19, 21], [15, 21],
  [16, 18], [18, 20], [20, 22], [16, 22],
];

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  w: number,
  h: number
) {
  for (const [i, j] of POSE_CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    if (!a || !b) continue;
    if ((a.visibility ?? 1) < 0.5 || (b.visibility ?? 1) < 0.5) continue;

    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.strokeStyle = "rgba(0,255,0,0.7)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  for (const p of landmarks) {
    if ((p.visibility ?? 1) < 0.5) continue;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#00FF00";
    ctx.fill();
  }
}

export default function PruebaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detector = useRef(new PoseImageDetectorService());

  const [status, setStatus] = useState<"ready" | "loading" | "detecting" | "done" | "error">("loading");
  const [pose, setPose] = useState<PoseResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string | null>(null);

  useEffect(() => {
    detector.current
      .initialize()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("error"));
  }, []);

  const detectOnImage = useCallback(async (img: HTMLImageElement) => {
    setStatus("detecting");
    setPose(null);

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const result = detector.current.detect(img);
    if (result?.detected) {
      drawSkeleton(ctx, result.landmarks, canvas.width, canvas.height);
      setPose(result);
    }

    setStatus("done");
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (!blob) continue;

        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          setImageUrl(url);
          setImageSize(`${img.naturalWidth}×${img.naturalHeight}`);
          detectOnImage(img);
        };
        img.src = url;
        return;
      }
    }
  }, [detectOnImage]);

  const handleClear = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setImageSize(null);
    setPose(null);
    setStatus("ready");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [imageUrl]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const statusLabel = status === "loading" ? "Cargando modelo..." :
    status === "detecting" ? "Detectando pose..." :
    status === "error" ? "Error al cargar el modelo" :
    pose?.detected ? `Pose detectada (${pose.landmarks.length} landmarks)` :
    imageUrl ? "No se detectó una pose" :
    "Listo";

  const statusColor = status === "error" ? "#ef4444" :
    pose?.detected ? "#22c55e" :
    imageUrl && !pose?.detected ? "#f59e0b" :
    status === "loading" || status === "detecting" ? "#3b82f6" :
    "#94a3b8";

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0f172a",
        color: "white",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
        Prueba de detección sobre imagen
      </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <kbd
          style={{
            background: "#1e293b",
            padding: "6px 14px",
            borderRadius: 8,
            border: "1px solid #334155",
            fontSize: 13,
          }}
        >
          Ctrl + V
        </kbd>
        <span style={{ color: "#94a3b8", fontSize: 14 }}>
          pega una imagen con una persona visible
        </span>

        {imageSize && (
          <>
            <span
              style={{
                background: "#1e293b",
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                color: "#22c55e",
              }}
            >
              {imageSize}
            </span>
            <button
              onClick={handleClear}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: "1px solid #ef4444",
                background: "transparent",
                color: "#ef4444",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Quitar
            </button>
          </>
        )}
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {(status === "loading" || status === "detecting") && (
          <div
            style={{
              width: 18,
              height: 18,
              border: "2px solid #334155",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        )}
        <span
          style={{
            background: "#1e293b",
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 13,
            color: statusColor,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {pose?.detected && (
        <details
          style={{
            width: "100%",
            maxWidth: 900,
            background: "#1e293b",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            Ver datos de la pose (JSON)
          </summary>
          <pre
            style={{
              marginTop: 12,
              fontSize: 11,
              maxHeight: 300,
              overflow: "auto",
              color: "#94a3b8",
            }}
          >
            {JSON.stringify(pose, null, 2)}
          </pre>
        </details>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
