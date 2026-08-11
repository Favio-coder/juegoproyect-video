import { useEffect, useRef } from "react";
import headSrc from "../../../assets/avatar/rig/pingo/head.png";
import torsoSrc from "../../../assets/avatar/rig/pingo/torso.png";
import upperArmSrc from "../../../assets/avatar/rig/pingo/upper-arm.png";
import forearmSrc from "../../../assets/avatar/rig/pingo/forearm.png";
import handSrc from "../../../assets/avatar/rig/pingo/hand.png";
import thighSrc from "../../../assets/avatar/rig/pingo/thigh.png";
import shinSrc from "../../../assets/avatar/rig/pingo/shin.png";
import footSrc from "../../../assets/avatar/rig/pingo/foot.png";
import type { Landmark, PoseResult } from "../../gameplay/types/pose.types";

type Point = { x: number; y: number };
type RigPart = "head" | "torso" | "upperArm" | "forearm" | "hand" | "thigh" | "shin" | "foot";

const SOURCES: Record<RigPart, string> = {
  head: headSrc, torso: torsoSrc, upperArm: upperArmSrc, forearm: forearmSrc,
  hand: handSrc, thigh: thighSrc, shin: shinSrc, foot: footSrc,
};
const images = new Map<RigPart, HTMLImageElement>();
const VISIBLE = 0.52;

function imageFor(part: RigPart): HTMLImageElement | null {
  const cached = images.get(part);
  if (cached) return cached.complete && cached.naturalWidth ? cached : null;
  const image = new Image();
  image.decoding = "async";
  image.src = SOURCES[part];
  images.set(part, image);
  return null;
}

function seen(point?: Landmark): point is Landmark {
  return Boolean(point && (point.visibility ?? 1) >= VISIBLE);
}

function middle(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function drawBetween(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  from: Point,
  to: Point,
  widthRatio: number,
  mirrored: boolean,
) {
  if (!image) return;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length < 4) return;
  const width = length * widthRatio;
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x) - Math.PI / 2);
  if (mirrored) ctx.scale(-1, 1);
  ctx.drawImage(image, -width / 2, -length * 0.12, width, length * 1.24);
  ctx.restore();
}

function drawCentered(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  center: Point,
  width: number,
  height: number,
) {
  if (!image) return;
  ctx.drawImage(image, center.x - width / 2, center.y - height / 2, width, height);
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  elbow: Point,
  wrist: Point,
  mirrored: boolean,
) {
  if (!image) return;
  const forearmLength = Math.hypot(wrist.x - elbow.x, wrist.y - elbow.y);
  if (forearmLength < 4) return;
  const height = Math.max(58, forearmLength * 0.72);
  const width = height * 0.74;
  const directionX = (wrist.x - elbow.x) / forearmLength;
  const directionY = (wrist.y - elbow.y) / forearmLength;
  const center = {
    x: wrist.x + directionX * height * 0.22,
    y: wrist.y + directionY * height * 0.22,
  };

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(Math.atan2(directionY, directionX) - Math.PI / 2);
  if (mirrored) ctx.scale(-1, 1);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawSkeleton(ctx: CanvasRenderingContext2D, points: Array<Point | null>) {
  const links = [[11,13],[13,15],[12,14],[14,16],[11,12],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
  ctx.save();
  ctx.strokeStyle = "rgba(65, 255, 153, .9)";
  ctx.lineWidth = 3;
  for (const [a,b] of links) {
    if (!points[a] || !points[b]) continue;
    ctx.beginPath(); ctx.moveTo(points[a]!.x, points[a]!.y); ctx.lineTo(points[b]!.x, points[b]!.y); ctx.stroke();
  }
  ctx.fillStyle = "#fff";
  for (const point of points) {
    if (!point) continue;
    ctx.beginPath(); ctx.arc(point.x, point.y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export default function PingoRigCanvas({
  pose,
  videoRef,
  showSkeleton,
}: {
  pose: PoseResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showSkeleton: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothed = useRef<Array<Point | null>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!pose?.detected || !video.videoWidth || !video.videoHeight) return;

    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const offsetX = (width - video.videoWidth * scale) / 2;
    const offsetY = (height - video.videoHeight * scale) / 2;
    const raw = pose.landmarks.map((point) => seen(point) ? {
      x: offsetX + point.x * video.videoWidth * scale,
      y: offsetY + point.y * video.videoHeight * scale,
    } : null);
    const points = raw.map((point, index) => {
      if (!point) return null;
      const previous = smoothed.current[index];
      return previous ? { x: previous.x + (point.x - previous.x) * 0.38, y: previous.y + (point.y - previous.y) * 0.38 } : point;
    });
    smoothed.current = points;

    const p = (index: number) => points[index];
    const shouldersReady = p(11) && p(12);
    const hipsReady = p(23) && p(24);
    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.imageSmoothingEnabled = true;

    if (hipsReady) {
      if (p(23) && p(25)) drawBetween(ctx, imageFor("thigh"), p(23)!, p(25)!, 0.7, false);
      if (p(24) && p(26)) drawBetween(ctx, imageFor("thigh"), p(24)!, p(26)!, 0.7, true);
      if (p(25) && p(27)) drawBetween(ctx, imageFor("shin"), p(25)!, p(27)!, 0.58, false);
      if (p(26) && p(28)) drawBetween(ctx, imageFor("shin"), p(26)!, p(28)!, 0.58, true);
      if (p(27)) drawCentered(ctx, imageFor("foot"), { x: p(27)!.x - 8, y: p(27)!.y + 10 }, 62, 48);
      if (p(28)) drawCentered(ctx, imageFor("foot"), { x: p(28)!.x + 8, y: p(28)!.y + 10 }, 62, 48);
    }

    if (shouldersReady && hipsReady) {
      const shoulderMid = middle(p(11)!, p(12)!);
      const hipMid = middle(p(23)!, p(24)!);
      const shoulderWidth = Math.hypot(p(12)!.x - p(11)!.x, p(12)!.y - p(11)!.y);
      const torsoLength = Math.hypot(hipMid.x - shoulderMid.x, hipMid.y - shoulderMid.y);
      drawCentered(ctx, imageFor("torso"), middle(shoulderMid, hipMid), shoulderWidth * 1.52, torsoLength * 1.42);
    }

    if (shouldersReady) {
      if (p(13)) drawBetween(ctx, imageFor("upperArm"), p(11)!, p(13)!, 0.72, false);
      if (p(14)) drawBetween(ctx, imageFor("upperArm"), p(12)!, p(14)!, 0.72, true);
      if (p(13) && p(15)) drawBetween(ctx, imageFor("forearm"), p(13)!, p(15)!, 0.62, false);
      if (p(14) && p(16)) drawBetween(ctx, imageFor("forearm"), p(14)!, p(16)!, 0.62, true);
      if (p(13) && p(15)) drawHand(ctx, imageFor("hand"), p(13)!, p(15)!, false);
      if (p(14) && p(16)) drawHand(ctx, imageFor("hand"), p(14)!, p(16)!, true);
    }

    const face = points.slice(0, 11).filter((point): point is Point => point !== null);
    if (face.length >= 2) {
      const faceCenter = face.reduce((sum, point) => ({ x: sum.x + point.x / face.length, y: sum.y + point.y / face.length }), { x: 0, y: 0 });
      const headWidth = shouldersReady
        ? Math.hypot(p(12)!.x - p(11)!.x, p(12)!.y - p(11)!.y) * 1.5
        : Math.max(90, Math.max(...face.map((point) => point.x)) - Math.min(...face.map((point) => point.x))) * 3.2;
      drawCentered(ctx, imageFor("head"), { x: faceCenter.x, y: faceCenter.y - headWidth * 0.13 }, headWidth, headWidth * 0.98);
    }
    ctx.restore();
    if (showSkeleton) drawSkeleton(ctx, points);
  }, [pose, showSkeleton, videoRef]);

  return <canvas ref={canvasRef} className="rig-camera__canvas" />;
}
