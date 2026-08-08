import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type { WebGLRenderer } from "three";
import Penguin3D from "../components/Penguin3D";

function CaptureBridge({ onReady }: { onReady: (gl: WebGLRenderer) => void }) {
  const { gl } = useThree();
  useEffect(() => {
    onReady(gl);
  }, [gl, onReady]);
  return null;
}

export default function DemoPage() {
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [showSprite, setShowSprite] = useState(false);

  const btnStyle = (bg: string, outline = false): React.CSSProperties => ({
    padding: "12px 22px",
    borderRadius: 14,
    border: outline ? "1px solid #475569" : "none",
    background: outline ? "transparent" : bg,
    color: "white",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  });

  const handleRendererReady = useCallback((gl: WebGLRenderer) => {
    rendererRef.current = gl;
  }, []);

  const handleExport = useCallback(() => {
    const gl = rendererRef.current;
    if (!gl) return;
    setSpriteUrl(gl.domElement.toDataURL("image/png"));
    setShowSprite(true);
  }, []);

  const handleReset = useCallback(() => {
    setShowSprite(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (!spriteUrl) return;
    const a = document.createElement("a");
    a.href = spriteUrl;
    a.download = "pingo-3d.png";
    a.click();
  }, [spriteUrl]);

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
        gap: 24,
        boxSizing: "border-box",
      }}
    >
      <header style={{ textAlign: "center", maxWidth: 720 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>
          2.5D · Demo
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 15, margin: "8px 0 0", lineHeight: 1.5 }}>
          Un pingüino modelado en <b>3D</b> (React Three Fiber) →{" "}
          <b>renderizado a PNG</b> → reutilizado como <b>sprite 2D</b> dentro del juego React.
        </p>
      </header>

      <div
        style={{
          width: "100%",
          maxWidth: 460,
          height: 460,
          borderRadius: 24,
          overflow: "hidden",
          background: "#0b1220",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <Canvas
          frameloop="always"
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: [0, 1.6, 4.2], fov: 42 }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          <directionalLight position={[-3, 2, -2]} intensity={0.4} />
          <CaptureBridge onReady={handleRendererReady} />
          <group position={[0, 0, 0]}>
            <Penguin3D />
          </group>
          <ContactShadows
            opacity={0.4}
            scale={5}
            blur={2.2}
            far={4}
            position={[0, 0, 0]}
          />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={7}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Canvas>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={handleExport}
          style={btnStyle("#f59e0b")}
        >
          🖼 Exportar a PNG
        </button>
        <button onClick={handleDownload} style={btnStyle("#22c55e")}>
          💾 Descargar
        </button>
        <button onClick={handleReset} style={btnStyle("#64748b", true)}>
          Mostrar sprite
        </button>
      </div>

      {showSprite && spriteUrl ? (
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            borderRadius: 24,
            overflow: "hidden",
            border: "1px dashed rgba(255,255,255,0.2)",
            background: "#111c2e",
            padding: "12px 16px",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#cbd5e1", marginBottom: 12 }}>
            ⚙ Paso 2.5D — el modelo 3D ahora es una imagen usada en React
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 0,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={spriteUrl}
                alt={`Pingo sprite ${i}`}
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                  transform: i % 2 === 1 ? "rotate(-8deg)" : "rotate(8deg)",
                  filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))",
                }}
              />
            ))}
          </div>
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 13, marginTop: 14 }}>
            Fotogramas de la sprite estirada en el <code>/juego</code> (ilustración).
          </div>
        </div>
      ) : null}
    </div>
  );
}