import { useEffect, useRef } from "react";
import type { PoseResult } from "../types/pose.types";

interface PoseCanvasProps {
  pose: PoseResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

type Pt = { x: number; y: number };

const DARK = "#1f2937";
const WHITE = "#f8fafc";
const ORANGE = "#f59e0b";

function visible(v?: number): boolean {
  return v === undefined || v >= 0.5;
}

function paint(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  width: number,
  color: string
): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function dot(ctx: CanvasRenderingContext2D, p: Pt, r: number, color: string): void {
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawPenguin(
  ctx: CanvasRenderingContext2D,
  pose: PoseResult,
  W: number,
  H: number
): void {
  const l = pose.landmarks;
  const at = (i: number): Pt | null =>
    l[i] && visible(l[i].visibility)
      ? { x: l[i].x * W, y: l[i].y * H }
      : null;
  const pair = (a: Pt | null, b: Pt | null): Pt | null =>
    a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : null;

  const shL = at(11);
  const shR = at(12);
  const hipL = at(23);
  const hipR = at(24);
  if (!shL || !shR) return;

  const shoulderD = Math.hypot(shR.x - shL.x, shR.y - shL.y) || 40;
  const s = shoulderD;
  const shoulderMid = pair(shL, shR);
  const hipMid = pair(hipL, hipR);

  // Legs (naranja, tipo pies de pingüino)
  for (const [knee, ankle] of [
    [25, 27],
    [26, 28],
  ] as const) {
    const k = at(knee);
    const a = at(ankle);
    if (k && a) {
      paint(ctx, [a, k], s * 0.16, ORANGE);
      dot(ctx, a, s * 0.13, ORANGE);
    }
  }

  // Wings (brazos) → negros
  for (const [el, wr] of [
    [13, 15],
    [14, 16],
  ] as const) {
    const e = at(el);
    const w = at(wr);
    if (e && w) {
      paint(ctx, [e, w], s * 0.2, DARK);
    }
  }

  // Body: contorno oscuro + panza blanca desde hombros hasta cadera
  if (hipMid && shoulderMid) {
    paint(ctx, [shoulderMid, hipMid], s * 1.0, DARK);
    paint(ctx, [shoulderMid, hipMid], s * 0.78, WHITE);
  }

  // Cabeza con cara blanco + ojos + pico, centrada en la nariz
  const nose = at(0);
  if (nose) {
    const headR = s * 0.42;
    dot(ctx, nose, headR, DARK);
    dot(ctx, { x: nose.x, y: nose.y + headR * 0.16 }, headR * 0.72, WHITE);

    const eyeAPoint = at(2);
    const eyeBPoint = at(5);
    let eyeA: Pt = { x: nose.x - headR * 0.42, y: nose.y - headR * 0.12 };
    let eyeB: Pt = { x: nose.x + headR * 0.42, y: nose.y - headR * 0.12 };
    if (eyeAPoint) eyeA = eyeAPoint;
    if (eyeBPoint) eyeB = eyeBPoint;
    dot(ctx, eyeA, headR * 0.11, DARK);
    dot(ctx, eyeB, headR * 0.11, DARK);

    // Pico (triángulo hacia abajo)
    const bw = headR * 0.34;
    const bh = headR * 0.2;
    ctx.beginPath();
    ctx.moveTo(nose.x - bw, nose.y + headR * 0.02);
    ctx.lineTo(nose.x, nose.y + bh);
    ctx.lineTo(nose.x + bw, nose.y + headR * 0.02);
    ctx.closePath();
    ctx.fillStyle = ORANGE;
    ctx.fill();
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

    drawPenguin(ctx, pose, canvas.width, canvas.height);
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