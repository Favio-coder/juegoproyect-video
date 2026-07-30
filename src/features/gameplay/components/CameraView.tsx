import { useCamera } from "../hooks/useCamera";
import { usePoseDetection } from "../hooks/usePoseDetection";
import PoseCanvas from "./PoseCanvas";

interface CameraViewProps {
  remoteStream?: MediaStream | null;
}

export default function CameraView({ remoteStream }: CameraViewProps) {
  const { videoRef, loading, error } = useCamera(remoteStream);

  const pose = usePoseDetection(videoRef);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          display: "block",
          borderRadius: "16px",
        }}
      />

      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            borderRadius: "16px",
            zIndex: 20,
            color: "white",
            fontSize: "1.2rem",
          }}
        >
          Abriendo cámara...
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            borderRadius: "16px",
            zIndex: 20,
            color: "#ff6b6b",
            fontSize: "1.2rem",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <PoseCanvas pose={pose} videoRef={videoRef} />
      )}

      {!loading && !error && (
        <pre
          style={{
            color: "black",
            marginTop: 20,
            maxHeight: "250px",
            overflow: "auto",
            fontSize: "12px",
          }}
        >
          {JSON.stringify(pose, null, 2)}
        </pre>
      )}
    </div>
  );
}