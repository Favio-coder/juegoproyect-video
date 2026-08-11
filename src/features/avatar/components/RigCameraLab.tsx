import { useState } from "react";
import { useCamera } from "../../gameplay/hooks/useCamera";
import { usePoseDetection } from "../../gameplay/hooks/usePoseDetection";
import PingoRigCanvas from "./PingoRigCanvas";

export default function RigCameraLab() {
  const { videoRef, loading, error } = useCamera();
  const pose = usePoseDetection(videoRef);
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <section className="rig-camera" aria-label="Prueba de Pingo articulado con cámara">
      <div className="rig-camera__viewport">
        <video ref={videoRef} autoPlay playsInline muted />
        {!loading && !error ? <PingoRigCanvas pose={pose} videoRef={videoRef} showSkeleton={showSkeleton} /> : null}
        {loading ? <div className="rig-camera__message">Abriendo cámara…</div> : null}
        {error ? <div className="rig-camera__message rig-camera__message--error">{error}</div> : null}
        <span className={`rig-camera__tracking ${pose?.detected ? "is-detected" : ""}`}>
          {pose?.detected ? "Cuerpo detectado" : "Buscando cuerpo"}
        </span>
      </div>
      <div className="rig-camera__toolbar">
        <div><strong>Prototipo Pingo articulado</strong><span>Solo laboratorio · no afecta /juego</span></div>
        <label><input type="checkbox" checked={showSkeleton} onChange={(event) => setShowSkeleton(event.target.checked)} /> Mostrar puntos guía</label>
      </div>
    </section>
  );
}
