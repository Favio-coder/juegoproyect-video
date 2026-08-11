import { useEffect, useRef } from "react";
import {
  MOTION_ASSETS,
  PINGO_SQUAT_FRAMES,
  type MotionPose,
} from "../../avatar/motionAvatarAssets";
import type { Landmark, PoseResult } from "../types/pose.types";

interface PoseCanvasProps {
  pose: PoseResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

type Point = { x: number; y: number };
type TrackingLevel = "face" | "upper" | "full";
type SmoothBox = { x: number; y: number; width: number; height: number };

const VISIBILITY = 0.55;
const imageCache = new Map<string, HTMLImageElement>();

function isVisible(point?: Landmark): point is Landmark {
  return Boolean(point && (point.visibility ?? 1) >= VISIBILITY);
}

function getImage(src: string): HTMLImageElement | null {
  const cached = imageCache.get(src);
  if (cached) return cached.complete && cached.naturalWidth ? cached : null;
  const image = new Image();
  image.decoding = "async";
  image.src = src;
  imageCache.set(src, image);
  return null;
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function choosePose(landmarks: Landmark[]): MotionPose {
  const [leftShoulder, rightShoulder] = [landmarks[11], landmarks[12]];
  const [leftWrist, rightWrist] = [landmarks[15], landmarks[16]];
  if ([leftShoulder, rightShoulder, leftWrist, rightWrist].every(isVisible)) {
    const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    if (leftWrist.y < shoulderY && rightWrist.y < shoulderY) return "star";
  }

  const [leftHip, rightHip] = [landmarks[23], landmarks[24]];
  const [leftKnee, rightKnee] = [landmarks[25], landmarks[26]];
  const [leftAnkle, rightAnkle] = [landmarks[27], landmarks[28]];
  if ([leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee].every(isVisible)) {
    const hipY = (leftHip.y + rightHip.y) / 2;
    const kneeY = (leftKnee.y + rightKnee.y) / 2;
    const torso = Math.max(0.08, hipY - (leftShoulder.y + rightShoulder.y) / 2);
    if ((kneeY - hipY) / torso < 0.85) return "squat";
  }
  if ([leftKnee, rightKnee, leftAnkle, rightAnkle].every(isVisible)) {
    const ankleGap = Math.abs(leftAnkle.y - rightAnkle.y);
    const kneeGap = Math.abs(leftKnee.y - rightKnee.y);
    if (ankleGap > 0.08 || kneeGap > 0.08) return "march";
  }
  return "idle";
}

function trackingLevel(landmarks: Landmark[]): TrackingLevel | null {
  const faceCount = landmarks.slice(0, 11).filter(isVisible).length;
  if (faceCount < 2) return null;
  const shoulders = isVisible(landmarks[11]) && isVisible(landmarks[12]);
  if (!shoulders) return "face";
  const hips = isVisible(landmarks[23]) && isVisible(landmarks[24]);
  const ankles = isVisible(landmarks[27]) && isVisible(landmarks[28]);
  return hips && ankles ? "full" : "upper";
}

function squatFrame(landmarks: Landmark[]): number {
  const shoulder = (landmarks[11].y + landmarks[12].y) / 2;
  const hip = (landmarks[23].y + landmarks[24].y) / 2;
  const knee = (landmarks[25].y + landmarks[26].y) / 2;
  const ratio = (knee - hip) / Math.max(0.08, hip - shoulder);
  const depth = Math.max(0, Math.min(1, (1.05 - ratio) / 0.55));
  return Math.round(depth * (PINGO_SQUAT_FRAMES.length - 1) / 2);
}

function lerpBox(previous: SmoothBox | null, next: SmoothBox): SmoothBox {
  if (!previous) return next;
  const amount = 0.28;
  return {
    x: previous.x + (next.x - previous.x) * amount,
    y: previous.y + (next.y - previous.y) * amount,
    width: previous.width + (next.width - previous.width) * amount,
    height: previous.height + (next.height - previous.height) * amount,
  };
}

export default function PoseCanvas({ pose, videoRef }: PoseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothBoxRef = useRef<SmoothBox | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const canvasPixelWidth = Math.round(width * pixelRatio);
    const canvasPixelHeight = Math.round(height * pixelRatio);
    if (canvas.width !== canvasPixelWidth || canvas.height !== canvasPixelHeight) {
      canvas.width = canvasPixelWidth;
      canvas.height = canvasPixelHeight;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (!pose?.detected || !pose.landmarks.length || !video.videoWidth || !video.videoHeight) {
      smoothBoxRef.current = null;
      return;
    }

    const level = trackingLevel(pose.landmarks);
    if (!level) return;
    const coverScale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const offsetX = (width - video.videoWidth * coverScale) / 2;
    const offsetY = (height - video.videoHeight * coverScale) / 2;
    const project = (point: Landmark): Point => ({
      x: offsetX + point.x * video.videoWidth * coverScale,
      y: offsetY + point.y * video.videoHeight * coverScale,
    });

    const facePoints = pose.landmarks.slice(0, 11).filter(isVisible).map(project);
    const faceCenter = facePoints.reduce(
      (sum, point) => ({ x: sum.x + point.x / facePoints.length, y: sum.y + point.y / facePoints.length }),
      { x: 0, y: 0 },
    );
    const leftShoulder = pose.landmarks[11];
    const rightShoulder = pose.landmarks[12];
    const shoulderWidth = isVisible(leftShoulder) && isVisible(rightShoulder)
      ? Math.hypot(project(leftShoulder).x - project(rightShoulder).x, project(leftShoulder).y - project(rightShoulder).y)
      : Math.max(70, Math.max(...facePoints.map((point) => point.x)) - Math.min(...facePoints.map((point) => point.x))) * 2.6;

    const poseName = choosePose(pose.landmarks);
    let source = MOTION_ASSETS.pingo[poseName];
    if (poseName === "squat") source = PINGO_SQUAT_FRAMES[squatFrame(pose.landmarks)];
    const image = getImage(source);
    if (!image) return;

    const visibleBody = pose.landmarks.filter(isVisible).map(project);
    const minY = Math.min(...visibleBody.map((point) => point.y));
    const maxY = Math.max(...visibleBody.map((point) => point.y));
    const centerX = level === "face" || !isVisible(leftShoulder) || !isVisible(rightShoulder)
      ? faceCenter.x
      : midpoint(project(leftShoulder), project(rightShoulder)).x;
    const targetHeight = level === "face"
      ? shoulderWidth * 1.45
      : level === "upper"
        ? Math.max(shoulderWidth * 2.35, (maxY - minY) * 1.15)
        : Math.max(shoulderWidth * 3.1, (maxY - minY) * 1.08);
    const targetWidth = targetHeight * (image.naturalWidth / image.naturalHeight);
    const targetBox = {
      x: centerX - targetWidth / 2,
      y: level === "face" ? faceCenter.y - targetHeight * 0.43 : minY - targetHeight * 0.08,
      width: targetWidth,
      height: targetHeight,
    };
    const box = lerpBox(smoothBoxRef.current, targetBox);
    smoothBoxRef.current = box;

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.imageSmoothingEnabled = true;
    if (level === "face") {
      const cropHeight = image.naturalHeight * 0.53;
      ctx.drawImage(image, 0, 0, image.naturalWidth, cropHeight, box.x, box.y, box.width, box.height * 0.53);
    } else if (level === "upper") {
      const cropHeight = image.naturalHeight * 0.72;
      ctx.drawImage(image, 0, 0, image.naturalWidth, cropHeight, box.x, box.y, box.width, box.height * 0.72);
    } else {
      ctx.drawImage(image, box.x, box.y, box.width, box.height);
    }
    ctx.restore();
  }, [pose, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
