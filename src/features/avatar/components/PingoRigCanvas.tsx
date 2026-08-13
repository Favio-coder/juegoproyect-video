import { useEffect, useRef } from "react";
import headSrc from "../../../assets/avatar/rig/pingo/head.png";
import torsoSrc from "../../../assets/avatar/rig/pingo/torso.png";
import upperArmSrc from "../../../assets/avatar/rig/pingo/upper-arm.png";
import forearmSrc from "../../../assets/avatar/rig/pingo/forearm.png";
import handSrc from "../../../assets/avatar/rig/pingo/hand.png";
import thighSrc from "../../../assets/avatar/rig/pingo/thigh.png";
import shinSrc from "../../../assets/avatar/rig/pingo/shin.png";
import footSrc from "../../../assets/avatar/rig/pingo/foot.png";
import rockoHeadSrc from "../../../assets/avatar/rig/rocko/head.png";
import rockoTorsoSrc from "../../../assets/avatar/rig/rocko/torso.png";
import rockoUpperArmSrc from "../../../assets/avatar/rig/rocko/upper-arm.png";
import rockoForearmSrc from "../../../assets/avatar/rig/rocko/forearm.png";
import rockoHandSrc from "../../../assets/avatar/rig/rocko/hand.png";
import rockoThighSrc from "../../../assets/avatar/rig/rocko/thigh.png";
import rockoShinSrc from "../../../assets/avatar/rig/rocko/shin.png";
import rockoFootSrc from "../../../assets/avatar/rig/rocko/foot.png";
import type { AvatarId } from "../../../core/utils/avatarAssets";
import type { Landmark, PoseResult } from "../../gameplay/types/pose.types";

type Point = { x: number; y: number };
type RigPart = "head" | "torso" | "upperArm" | "forearm" | "hand" | "thigh" | "shin" | "foot";

const SOURCES: Record<AvatarId, Record<RigPart, string>> = {
  pingo: { head: headSrc, torso: torsoSrc, upperArm: upperArmSrc, forearm: forearmSrc, hand: handSrc, thigh: thighSrc, shin: shinSrc, foot: footSrc },
  rocko: { head: rockoHeadSrc, torso: rockoTorsoSrc, upperArm: rockoUpperArmSrc, forearm: rockoForearmSrc, hand: rockoHandSrc, thigh: rockoThighSrc, shin: rockoShinSrc, foot: rockoFootSrc },
};
const images = new Map<string, HTMLImageElement>();
const VISIBLE = 0.52;

function imageFor(avatar: AvatarId, part: RigPart): HTMLImageElement | null {
  const key = `${avatar}:${part}`;
  const cached = images.get(key);
  if (cached) return cached.complete && cached.naturalWidth ? cached : null;
  const image = new Image();
  image.decoding = "async";
  image.src = SOURCES[avatar][part];
  images.set(key, image);
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
  maxWidth = Number.POSITIVE_INFINITY,
) {
  if (!image) return;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length < 4) return;
  const width = Math.min(length * widthRatio, maxWidth);
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
  maxHeight = Number.POSITIVE_INFINITY,
  artworkPointsUp = false,
) {
  if (!image) return;
  const forearmLength = Math.hypot(wrist.x - elbow.x, wrist.y - elbow.y);
  if (forearmLength < 4) return;
  const height = Math.min(maxHeight, Math.max(44, forearmLength * 0.58));
  const width = height * 0.74;
  const directionX = (wrist.x - elbow.x) / forearmLength;
  const directionY = (wrist.y - elbow.y) / forearmLength;
  const center = {
    x: wrist.x + directionX * height * 0.22,
    y: wrist.y + directionY * height * 0.22,
  };

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(
    Math.atan2(directionY, directionX) +
      (artworkPointsUp ? Math.PI / 2 : -Math.PI / 2),
  );
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
  avatar,
  pose,
  videoRef,
  showSkeleton,
}: {
  avatar: AvatarId;
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
    const rockoPartMax = Math.min(width * 0.055, 74);

    if (hipsReady) {
      const thighWidth = avatar === "rocko" ? 0.46 : 0.7;
      const maxLegWidth = avatar === "rocko" ? rockoPartMax : Number.POSITIVE_INFINITY;
      if (p(23) && p(25)) drawBetween(ctx, imageFor(avatar, "thigh"), p(23)!, p(25)!, thighWidth, false, maxLegWidth);
      if (p(24) && p(26)) drawBetween(ctx, imageFor(avatar, "thigh"), p(24)!, p(26)!, thighWidth, true, maxLegWidth);
      if (p(25) && p(27)) drawBetween(ctx, imageFor(avatar, "shin"), p(25)!, p(27)!, avatar === "rocko" ? 0.44 : 0.58, false, maxLegWidth);
      if (p(26) && p(28)) drawBetween(ctx, imageFor(avatar, "shin"), p(26)!, p(28)!, avatar === "rocko" ? 0.44 : 0.58, true, maxLegWidth);
      const footSize = avatar === "rocko" ? { width: Math.min(width * 0.075, 92), height: Math.min(width * 0.058, 68) } : { width: 62, height: 48 };
      if (p(27)) drawCentered(ctx, imageFor(avatar, "foot"), { x: p(27)!.x - 8, y: p(27)!.y + 10 }, footSize.width, footSize.height);
      if (p(28)) drawCentered(ctx, imageFor(avatar, "foot"), { x: p(28)!.x + 8, y: p(28)!.y + 10 }, footSize.width, footSize.height);
    }

    if (shouldersReady && hipsReady) {
      const shoulderMid = middle(p(11)!, p(12)!);
      const hipMid = middle(p(23)!, p(24)!);
      const shoulderWidth = Math.hypot(p(12)!.x - p(11)!.x, p(12)!.y - p(11)!.y);
      const torsoLength = Math.hypot(hipMid.x - shoulderMid.x, hipMid.y - shoulderMid.y);
      const torsoWidth = avatar === "rocko" ? Math.min(shoulderWidth * 1.08, width * 0.32) : shoulderWidth * 1.52;
      const torsoHeight = avatar === "rocko" ? Math.min(torsoLength * 1.28, height * 0.45) : torsoLength * 1.42;
      drawCentered(ctx, imageFor(avatar, "torso"), middle(shoulderMid, hipMid), torsoWidth, torsoHeight);
    } else if (avatar === "rocko" && shouldersReady) {
      const shoulderMid = middle(p(11)!, p(12)!);
      const shoulderWidth = Math.hypot(p(12)!.x - p(11)!.x, p(12)!.y - p(11)!.y);
      const torsoWidth = Math.min(shoulderWidth * 1.04, width * 0.3);
      const torsoHeight = Math.min(shoulderWidth * 1.22, height * 0.4);
      drawCentered(
        ctx,
        imageFor(avatar, "torso"),
        { x: shoulderMid.x, y: shoulderMid.y + torsoHeight * 0.42 },
        torsoWidth,
        torsoHeight,
      );
    }

    if (shouldersReady) {
      const armRatio = avatar === "rocko" ? 0.3 : 0.72;
      const forearmRatio = avatar === "rocko" ? 0.3 : 0.62;
      const maxArmWidth = avatar === "rocko" ? rockoPartMax : Number.POSITIVE_INFINITY;
      if (p(13)) drawBetween(ctx, imageFor(avatar, "upperArm"), p(11)!, p(13)!, armRatio, false, maxArmWidth);
      if (p(14)) drawBetween(ctx, imageFor(avatar, "upperArm"), p(12)!, p(14)!, armRatio, true, maxArmWidth);
      if (p(13) && p(15)) drawBetween(ctx, imageFor(avatar, "forearm"), p(13)!, p(15)!, forearmRatio, false, maxArmWidth);
      if (p(14) && p(16)) drawBetween(ctx, imageFor(avatar, "forearm"), p(14)!, p(16)!, forearmRatio, true, maxArmWidth);
      const maxHandHeight = avatar === "rocko" ? Math.min(width * 0.065, 82) : Number.POSITIVE_INFINITY;
      if (p(13) && p(15)) drawHand(ctx, imageFor(avatar, "hand"), p(13)!, p(15)!, false, maxHandHeight, avatar === "rocko");
      if (p(14) && p(16)) drawHand(ctx, imageFor(avatar, "hand"), p(14)!, p(16)!, true, maxHandHeight, avatar === "rocko");
    }

    const face = points.slice(0, 11).filter((point): point is Point => point !== null);
    if (face.length >= 2) {
      const faceCenter = face.reduce((sum, point) => ({ x: sum.x + point.x / face.length, y: sum.y + point.y / face.length }), { x: 0, y: 0 });
      const faceSpan = p(7) && p(8)
        ? Math.hypot(p(8)!.x - p(7)!.x, p(8)!.y - p(7)!.y)
        : p(2) && p(5)
          ? Math.hypot(p(5)!.x - p(2)!.x, p(5)!.y - p(2)!.y) * 1.65
          : Math.max(...face.map((point) => point.x)) - Math.min(...face.map((point) => point.x));
      const shoulderSpan = shouldersReady
        ? Math.hypot(p(12)!.x - p(11)!.x, p(12)!.y - p(11)!.y)
        : width;
      const headWidth = avatar === "rocko"
        ? Math.max(86, Math.min(faceSpan * 1.72, shoulderSpan * 0.92, width * 0.23))
        : shouldersReady
          ? shoulderSpan * 1.5
          : Math.max(90, faceSpan * 3.2);
      drawCentered(ctx, imageFor(avatar, "head"), { x: faceCenter.x, y: faceCenter.y - headWidth * 0.13 }, headWidth, headWidth * (avatar === "rocko" ? 0.9 : 0.98));
    }
    ctx.restore();
    if (showSkeleton) drawSkeleton(ctx, points);
  }, [avatar, pose, showSkeleton, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="rig-camera__canvas"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

