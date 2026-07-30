import { useEffect, useRef } from "react";
import type { PoseResult } from "../types/pose.types";

interface PoseCanvasProps {
  pose: PoseResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

const POSE_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 7],
  [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10],
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [11, 23], [12, 24],
  [23, 24],
  [23, 25], [25, 27], [27, 29], [29, 31],
  [24, 26], [26, 28], [28, 30], [30, 32],
  [15, 17], [17, 19], [19, 21], [15, 21],
  [16, 18], [18, 20], [20, 22], [16, 22],
];

const VISIBILITY_THRESHOLD = 0.5;

const LANDMARK_COLOR = "#00FF00";
const LANDMARK_RADIUS = 5;
const CONNECTION_COLOR = "rgba(0, 255, 0, 0.6)";
const CONNECTION_WIDTH = 3;

function isVisible(visibility?: number): boolean {
  return visibility === undefined || visibility >= VISIBILITY_THRESHOLD;
}

function drawLandmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  ctx.beginPath();
  ctx.arc(x, y, LANDMARK_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle = LANDMARK_COLOR;
  ctx.fill();
}

function drawConnection(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = CONNECTION_COLOR;
  ctx.lineWidth = CONNECTION_WIDTH;
  ctx.stroke();
}

function renderPose(
  ctx: CanvasRenderingContext2D,
  pose: PoseResult,
  width: number,
  height: number
): void {
  const { landmarks } = pose;

  for (const [i, j] of POSE_CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    if (!a || !b) continue;
    if (!isVisible(a.visibility) || !isVisible(b.visibility)) continue;

    drawConnection(ctx, a.x * width, a.y * height, b.x * width, b.y * height);
  }

  for (const point of landmarks) {
    if (!isVisible(point.visibility)) continue;

    drawLandmark(ctx, point.x * width, point.y * height);
  }
}

export default function PoseCanvas({
  pose,
  videoRef,
}: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensionsSet = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    if (
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      !dimensionsSet.current
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      dimensionsSet.current = true;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!pose?.detected || !pose.landmarks.length) return;

    renderPose(ctx, pose, canvas.width, canvas.height);
  }, [pose, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}