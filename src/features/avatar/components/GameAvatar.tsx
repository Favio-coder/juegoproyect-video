import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useAppStore } from "../../../core/store/appStore";
import { AVATAR_RIG } from "../types";
import type { AvatarMotion } from "../types";
import Avatar3D from "./Avatar3D";

interface Spring {
  value: number;
  vel: number;
}

function spring(s: Spring, target: number, k: number, dt: number): void {
  s.vel += (target - s.value) * k * dt;
  s.vel *= Math.max(0, 1 - 6 * dt);
  s.value += s.vel * dt;
}

export default function GameAvatar({ motion }: { motion: AvatarMotion }) {
  const storedAvatar = useAppStore((s) => s.selectedAvatar);
  const group = useRef<Group>(null);
  const y = useRef<Spring>({ value: 0, vel: 0 });
  const squash = useRef<Spring>({ value: 1, vel: 0 });
  const tilt = useRef<Spring>({ value: 0, vel: 0 });
  const lean = useRef<Spring>({ value: 0, vel: 0 });

  useFrame((frame, dt) => {
    const p = AVATAR_RIG[motion];
    const time = frame.clock.getElapsedTime();

    spring(y.current, p.height, 28, dt);
    spring(squash.current, p.squash, 30, dt);
    spring(tilt.current, p.tilt, 24, dt);
    spring(lean.current, p.lean, 22, dt);

    const g = group.current;
    if (!g) return;

    const bob = Math.sin(time * p.bobSpeed) * p.bobAmp;
    g.position.y = y.current.value + bob;
    g.position.x = Math.sin(time * p.bobSpeed * 0.5) * p.tilt * 0.2;
    g.position.z = 0;
    g.rotation.set(
      lean.current.value + Math.sin(time * p.bobSpeed * 0.4) * p.tilt * 0.1,
      Math.sin(time * p.bobSpeed * 0.3) * p.tilt * 0.5,
      Math.sin(time * p.bobSpeed * 0.5) * p.tilt
    );
    g.scale.set(
      1,
      squash.current.value + Math.sin(time * p.bobSpeed) * p.bobAmp * 0.4,
      1
    );
  });

  const avatar = storedAvatar === "rocko" ? "rocko" : "pingo";

  return (
    <group ref={group}>
      <Avatar3D avatar={avatar} motion={motion} />
    </group>
  );
}