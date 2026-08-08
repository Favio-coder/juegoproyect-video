import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { Group } from "three";
import type { AvatarMotion } from "../hooks/useAvatarMotion";
import glbUrl from "../../../assets/3d/pingo/penguin.glb";

interface Params {
  height: number;
  squash: number;
  tilt: number;
  lean: number;
  bobSpeed: number;
  bobAmp: number;
}

const MOTION: Record<AvatarMotion, Params> = {
  idle: { height: 0, squash: 1, tilt: 0, lean: 0, bobSpeed: 1.6, bobAmp: 0.03 },
  jumping: { height: 0.55, squash: 1.06, tilt: 0.05, lean: 0.06, bobSpeed: 7, bobAmp: 0.16 },
  squat: { height: -0.4, squash: 0.72, tilt: 0, lean: 0.1, bobSpeed: 1, bobAmp: 0.02 },
  marching: { height: 0.12, squash: 1, tilt: 0.3, lean: 0.06, bobSpeed: 6, bobAmp: 0.1 },
  celebrate: { height: 0.34, squash: 1, tilt: 0, lean: 0, bobSpeed: 4, bobAmp: 0.14 },
};

const ROT_Y = Math.PI;

function spring(
  value: number,
  vel: number,
  target: number,
  k: number,
  dt: number
): [number, number] {
  vel += (target - value) * k * dt;
  vel *= Math.max(0, 1 - 6 * dt);
  value += vel * dt;
  return [value, vel];
}

function FitModel({ scene }: { scene: Group }) {
  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const height = Math.max(size.y, 0.001);

    scene.position.x = -center.x;
    scene.position.z = -center.z;
    scene.position.y = -box.min.y;
    scene.scale.setScalar(1 / height);
  }, [scene]);

  return <primitive object={scene} />;
}

function GamePenguin({ motion }: { motion: AvatarMotion }) {
  const { scene } = useGLTF(glbUrl);
  const group = useRef<Group>(null);
  const st = useRef({ y: 0, vY: 0, squash: 1, vS: 0, tilt: 0, vT: 0, lean: 0, vL: 0 });

  useFrame((frame, dt) => {
    const p = MOTION[motion];
    const c = st.current;
    const time = frame.clock.getElapsedTime();

    const [y, vY] = spring(c.y, c.vY, p.height, 28, dt);
    const [squash, vS] = spring(c.squash, c.vS, p.squash, 30, dt);
    const [tilt, vT] = spring(c.tilt, c.vT, p.tilt, 24, dt);
    const [lean, vL] = spring(c.lean, c.vL, p.lean, 22, dt);
    c.y = y; c.vY = vY;
    c.squash = squash; c.vS = vS;
    c.tilt = tilt; c.vT = vT;
    c.lean = lean; c.vL = vL;

    const g = group.current;
    if (!g) return;

    const bob = Math.sin(time * p.bobSpeed) * p.bobAmp;
    g.position.y = y + bob;
    g.position.x = Math.sin(time * p.bobSpeed * 0.5) * p.tilt * 0.2;
    g.position.z = 0;
    g.rotation.set(
      lean + Math.sin(time * p.bobSpeed * 0.4) * p.tilt * 0.1,
      ROT_Y + Math.sin(time * p.bobSpeed * 0.3) * p.tilt * 0.5,
      Math.sin(time * p.bobSpeed * 0.5) * p.tilt
    );
    g.scale.set(1, squash + Math.sin(time * p.bobSpeed) * p.bobAmp * 0.4, 1);
  });

  return (
    <group ref={group}>
      <FitModel scene={scene} />
    </group>
  );
}

export default GamePenguin;