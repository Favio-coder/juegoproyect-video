import { useEffect, useRef } from "react";
import headSrc from "../../../assets/avatar/rig/rocko/head.png";
import torsoSrc from "../../../assets/avatar/rig/rocko/torso.png";
import upperArmSrc from "../../../assets/avatar/rig/rocko/upper-arm.png";
import forearmSrc from "../../../assets/avatar/rig/rocko/forearm.png";
import handSrc from "../../../assets/avatar/rig/rocko/hand.png";
import thighSrc from "../../../assets/avatar/rig/rocko/thigh.png";
import shinSrc from "../../../assets/avatar/rig/rocko/shin.png";
import footSrc from "../../../assets/avatar/rig/rocko/foot.png";
import type { Landmark, PoseResult } from "../../gameplay/types/pose.types";

type Point = { x: number; y: number };
type Part = "head" | "torso" | "upperArm" | "forearm" | "hand" | "thigh" | "shin" | "foot";

const SOURCES: Record<Part, string> = {
  head: headSrc,
  torso: torsoSrc,
  upperArm: upperArmSrc,
  forearm: forearmSrc,
  hand: handSrc,
  thigh: thighSrc,
  shin: shinSrc,
  foot: footSrc,
};
const cache = new Map<Part, HTMLImageElement>();

function visible(point?: Landmark): point is Landmark {
  return Boolean(point && (point.visibility ?? 1) >= 0.52);
}

function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function asset(part: Part) {
  const found = cache.get(part);
  if (found) return found.complete && found.naturalWidth ? found : null;
  const image = new Image();
  image.decoding = "async";
  image.src = SOURCES[part];
  cache.set(part, image);
  return null;
}

function centered(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  center: Point,
  width: number,
  height: number,
) {
  if (image) ctx.drawImage(image, center.x - width / 2, center.y - height / 2, width, height);
}

function limb(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  from: Point,
  to: Point,
  thickness: number,
  mirror: boolean,
) {
  if (!image) return;
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length < 4) return;
  ctx.save();
  ctx.translate(from.x, from.y);
  ctx.rotate(Math.atan2(to.y - from.y, to.x - from.x) - Math.PI / 2);
  if (mirror) ctx.scale(-1, 1);
  ctx.drawImage(image, -thickness / 2, -length * 0.1, thickness, length * 1.2);
  ctx.restore();
}

function hand(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  elbow: Point,
  wrist: Point,
  size: number,
  mirror: boolean,
) {
  if (!image) return;
  const length = Math.hypot(wrist.x - elbow.x, wrist.y - elbow.y);
  if (length < 4) return;
  const dx = (wrist.x - elbow.x) / length;
  const dy = (wrist.y - elbow.y) / length;
  ctx.save();
  ctx.translate(wrist.x + dx * size * 0.28, wrist.y + dy * size * 0.28);
  ctx.rotate(Math.atan2(dy, dx) + Math.PI / 2);
  if (mirror) ctx.scale(-1, 1);
  ctx.drawImage(image, -size * 0.47, -size / 2, size * 0.94, size);
  ctx.restore();
}

function skeleton(ctx: CanvasRenderingContext2D, points: Array<Point | null>) {
  const links = [[11, 13], [13, 15], [12, 14], [14, 16], [11, 12], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
  ctx.save();
  ctx.strokeStyle = "#45f2a2";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#fff";
  for (const [a, b] of links) {
    if (points[a] && points[b]) {
      ctx.beginPath();
      ctx.moveTo(points[a]!.x, points[a]!.y);
      ctx.lineTo(points[b]!.x, points[b]!.y);
      ctx.stroke();
    }
  }
  for (const point of points) {
    if (point) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export default function RockoRigCanvas({
  pose,
  videoRef,
  showSkeleton,
}: {
  pose: PoseResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  showSkeleton: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smooth = useRef<Array<Point | null>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!pose?.detected || !video.videoWidth || !video.videoHeight) return;

    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const offsetX = (width - video.videoWidth * scale) / 2;
    const offsetY = (height - video.videoHeight * scale) / 2;
    const raw = pose.landmarks.map((point) => visible(point) ? {
      x: offsetX + point.x * video.videoWidth * scale,
      y: offsetY + point.y * video.videoHeight * scale,
    } : null);
    const points = raw.map((point, index) => {
      if (!point) return null;
      const old = smooth.current[index];
      return old
        ? { x: old.x + (point.x - old.x) * 0.38, y: old.y + (point.y - old.y) * 0.38 }
        : point;
    });
    smooth.current = points;

    const p = (index: number) => points[index];
    const shoulders = Boolean(p(11) && p(12));
    const hips = Boolean(p(23) && p(24));
    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.imageSmoothingEnabled = true;
    const shoulderWidth = shoulders
      ? Math.hypot(p(12)!.x - p(11)!.x, p(12)!.y - p(11)!.y)
      : width * 0.2;
    const armThickness = Math.max(38, Math.min(shoulderWidth * 0.27, width * 0.085));

    if (hips) {
      const legThickness = Math.max(42, Math.min(shoulderWidth * 0.32, width * 0.1));
      if (p(23) && p(25)) limb(ctx, asset("thigh"), p(23)!, p(25)!, legThickness, false);
      if (p(24) && p(26)) limb(ctx, asset("thigh"), p(24)!, p(26)!, legThickness, true);
      if (p(25) && p(27)) limb(ctx, asset("shin"), p(25)!, p(27)!, legThickness * 0.88, false);
      if (p(26) && p(28)) limb(ctx, asset("shin"), p(26)!, p(28)!, legThickness * 0.88, true);
      const boot = Math.max(64, Math.min(shoulderWidth * 0.48, 120));
      if (p(27)) centered(ctx, asset("foot"), { x: p(27)!.x - boot * 0.1, y: p(27)!.y + boot * 0.08 }, boot, boot * 0.72);
      if (p(28)) centered(ctx, asset("foot"), { x: p(28)!.x + boot * 0.1, y: p(28)!.y + boot * 0.08 }, boot, boot * 0.72);
    }

    if (shoulders) {
      const shoulderMid = mid(p(11)!, p(12)!);
      let torsoCenter: Point;
      let torsoHeight: number;
      if (hips) {
        const hipMid = mid(p(23)!, p(24)!);
        torsoCenter = mid(shoulderMid, hipMid);
        torsoHeight = Math.hypot(hipMid.x - shoulderMid.x, hipMid.y - shoulderMid.y) * 1.38;
      } else {
        torsoHeight = shoulderWidth * 1.18;
        torsoCenter = { x: shoulderMid.x, y: shoulderMid.y + torsoHeight * 0.4 };
      }
      centered(ctx, asset("torso"), torsoCenter, shoulderWidth * 1.22, Math.min(torsoHeight, height * 0.55));
      if (p(13)) limb(ctx, asset("upperArm"), p(11)!, p(13)!, armThickness, false);
      if (p(14)) limb(ctx, asset("upperArm"), p(12)!, p(14)!, armThickness, true);
      if (p(13) && p(15)) limb(ctx, asset("forearm"), p(13)!, p(15)!, armThickness * 0.92, false);
      if (p(14) && p(16)) limb(ctx, asset("forearm"), p(14)!, p(16)!, armThickness * 0.92, true);
      const handSize = Math.max(54, Math.min(shoulderWidth * 0.38, 110));
      if (p(13) && p(15)) hand(ctx, asset("hand"), p(13)!, p(15)!, handSize, false);
      if (p(14) && p(16)) hand(ctx, asset("hand"), p(14)!, p(16)!, handSize, true);
    }

    const face = points.slice(0, 11).filter((point): point is Point => point !== null);
    if (face.length >= 2) {
      const center = face.reduce(
        (sum, point) => ({ x: sum.x + point.x / face.length, y: sum.y + point.y / face.length }),
        { x: 0, y: 0 },
      );
      const faceSpan = p(7) && p(8)
        ? Math.hypot(p(8)!.x - p(7)!.x, p(8)!.y - p(7)!.y)
        : Math.max(...face.map((point) => point.x)) - Math.min(...face.map((point) => point.x));
      const headWidth = Math.max(shoulderWidth * 0.78, faceSpan * 2.25, 120);
      const safeWidth = Math.min(headWidth, width * 0.38);
      centered(ctx, asset("head"), { x: center.x, y: center.y - safeWidth * 0.1 }, safeWidth, safeWidth * 0.9);
    }
    ctx.restore();
    if (showSkeleton) skeleton(ctx, points);
  }, [pose, showSkeleton, videoRef]);

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
