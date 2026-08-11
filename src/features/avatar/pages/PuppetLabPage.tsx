import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AvatarId } from "../../../core/utils/avatarAssets";
import MotionAvatarSprite from "../components/MotionAvatarSprite";
import type { MotionPose } from "../components/MotionAvatarSprite";
import PingoSquatSequence from "../components/PingoSquatSequence";
import RigCameraLab from "../components/RigCameraLab";
import "../styles/puppet-lab.css";

const POSES: Array<{ id: MotionPose; label: string; symbol: string }> = [
  { id: "idle", label: "Reposo", symbol: "●" },
  { id: "squat", label: "Sentadilla", symbol: "▼" },
  { id: "star", label: "Polichinela", symbol: "★" },
  { id: "march", label: "Marcha", symbol: "▶" },
];
const FRAME_COUNT = 8;

export default function PuppetLabPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"rig" | "poses">("rig");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [avatar, setAvatar] = useState<AvatarId>("pingo");
  const [pose, setPose] = useState<MotionPose>("idle");
  const [squatFrame, setSquatFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isSquatSequence = avatar === "pingo" && pose === "squat";

  useEffect(() => {
    if (!isPlaying || !isSquatSequence || mode !== "poses") return;
    const timer = window.setInterval(() => setSquatFrame((frame) => (frame + 1) % FRAME_COUNT), 150);
    return () => window.clearInterval(timer);
  }, [isPlaying, isSquatSequence, mode]);

  const selectPose = (nextPose: MotionPose) => {
    setPose(nextPose);
    setSquatFrame(0);
    setIsPlaying(nextPose === "squat" && avatar === "pingo");
  };

  return (
    <main className="puppet-lab">
      <header className="puppet-lab__header">
        <button className="puppet-lab__back" onClick={() => navigate("/")} aria-label="Volver al menú">←</button>
        <h1>Laboratorio de avatar</h1>
        <span className="puppet-lab__status"><i /> Aislado de /juego</span>
      </header>

      <nav className="puppet-lab__modes" aria-label="Modo de prueba">
        <button className={mode === "rig" ? "is-selected" : ""} onClick={() => setMode("rig")}>Cámara articulada</button>
        <button className={mode === "poses" ? "is-selected" : ""} onClick={() => setMode("poses")}>Imágenes de referencia</button>
      </nav>

      {mode === "rig" ? (
        <div className="puppet-lab__rig-workspace">
          {cameraEnabled ? (
            <RigCameraLab />
          ) : (
            <section className="rig-camera__permission">
              <span>◉</span>
              <h2>Prueba corporal aislada</h2>
              <p>Activa la cámara para mover las piezas de Pingo con hombros, codos, muñecas, cadera, rodillas y tobillos.</p>
              <button onClick={() => setCameraEnabled(true)}>Activar cámara</button>
              <small>Esta pantalla no modifica ni ejecuta la interfaz de /juego.</small>
            </section>
          )}
          <aside className="rig-notes">
            <span className="rig-notes__badge">Fase 1 · Pingo</span>
            <h2>Qué estamos validando</h2>
            <ol>
              <li>Que las articulaciones sigan tus extremidades.</li>
              <li>Que el personaje conserve sus proporciones.</li>
              <li>Que aparezca por partes al entrar a cámara.</li>
              <li>Que el movimiento no tiemble ni se corte.</li>
            </ol>
            <p>Rocko se conectará cuando esta estructura quede aprobada.</p>
          </aside>
        </div>
      ) : (
        <div className="puppet-lab__workspace">
          <section className="puppet-stage" aria-label="Escenario del avatar">
            <div className="puppet-stage__canvas">
              {isSquatSequence ? <PingoSquatSequence frame={squatFrame} /> : <MotionAvatarSprite avatar={avatar} pose={pose} />}
            </div>
            <p>{isSquatSequence ? `Sentadilla secuencial · cuadro ${squatFrame + 1} de ${FRAME_COUNT}` : "Imágenes maestras de referencia"}</p>
          </section>
          <aside className="puppet-controls">
            <div className="puppet-controls__avatars">
              {(["pingo", "rocko"] as AvatarId[]).map((id) => (
                <button key={id} className={avatar === id ? "is-selected" : ""} onClick={() => { setAvatar(id); setIsPlaying(false); }}>{id === "pingo" ? "Pingo" : "Rocko"}</button>
              ))}
            </div>
            <div className="puppet-controls__explanation"><h2>Poses completas</h2><p>Sirven como referencia visual; no intentan copiar libremente el cuerpo.</p></div>
            <div className="puppet-controls__poses puppet-controls__poses--four"><div>
              {POSES.map(({ id, label, symbol }) => <button key={id} className={pose === id ? "is-selected" : ""} onClick={() => selectPose(id)}><span>{symbol}</span>{label}</button>)}
            </div></div>
            {isSquatSequence ? <div className="puppet-controls__timeline"><div><strong>Secuencia</strong><span>{squatFrame + 1}/{FRAME_COUNT}</span></div><input type="range" min="0" max={FRAME_COUNT - 1} value={squatFrame} aria-label="Avance de la sentadilla" onChange={(event) => { setIsPlaying(false); setSquatFrame(Number(event.target.value)); }} /><button className="puppet-controls__play" onClick={() => setIsPlaying((playing) => !playing)}>{isPlaying ? "Pausar" : "Reproducir"}</button></div> : null}
          </aside>
        </div>
      )}
    </main>
  );
}
