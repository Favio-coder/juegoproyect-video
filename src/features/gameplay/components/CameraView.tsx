import { useEffect, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { usePoseDetection } from "../hooks/usePoseDetection";
import PingoRigCanvas from "../../avatar/components/PingoRigCanvas";
import RockoRigCanvas from "../../avatar/components/RockoRigCanvas";
import type { AvatarId } from "../../../core/utils/avatarAssets";
import type { PoseResult } from "../types/pose.types";

interface CameraViewProps {
  onPoseResult?: (pose: PoseResult) => void;
  avatar: AvatarId;
}

export default function CameraView({ onPoseResult, avatar }: CameraViewProps) {
  const { videoRef, loading, error } = useCamera();
  const onPoseCallbackRef = useRef(onPoseResult);

  useEffect(() => {
    onPoseCallbackRef.current = onPoseResult;
  }, [onPoseResult]);

  const pose = usePoseDetection(videoRef);

  useEffect(() => {
    if (pose && onPoseCallbackRef.current) {
      onPoseCallbackRef.current(pose);
    }
  }, [pose]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
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
            zIndex: 20,
            color: "white",
            fontSize: "1.8rem",
            fontWeight: 700,
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
            zIndex: 20,
            color: "#ff6b6b",
            fontSize: "1.8rem",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        avatar === "rocko" ? (
          <RockoRigCanvas pose={pose} videoRef={videoRef} showSkeleton={false} />
        ) : (
          <PingoRigCanvas avatar="pingo" pose={pose} videoRef={videoRef} showSkeleton={false} />
        )
      )}
    </div>
  );
}
