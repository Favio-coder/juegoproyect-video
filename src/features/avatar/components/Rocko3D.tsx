import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { AvatarMotion } from "../types";
import { limbTargets } from "../utils/limbTargets";
import { Orb, Cone, AxesGroup } from "../primitives";

const C = {
  fur: "#8a94a6",
  dark: "#2e3642",
  paw: "#3b4350",
  light: "#e9ecf2",
  mask: "#22282f",
  ear: "#f4a9a0",
  tailA: "#22282f",
  tailB: "#d9dce2",
};

export default function Rocko3D({ motion }: { motion: AvatarMotion }) {
  const root = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const footL = useRef<Group>(null);
  const footR = useRef<Group>(null);
  const tail = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const limb = limbTargets(motion, t);
    const phase = t * limb.speed;

    if (root.current) {
      const breathe = 1 + Math.sin(t * 2.1) * 0.015;
      root.current.scale.setScalar(breathe);
    }

    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * 2.4) * 0.18 + limb.armRaise * 0.2;
    }

    const raise = limb.armRaise * 0.72 + limb.flap * 0.4;
    const swing = limb.armSwing;
    if (armL.current) {
      armL.current.rotation.z = -raise - 0.1;
      armL.current.rotation.x = 0.2 + swing * Math.sin(phase) * 0.9;
    }
    if (armR.current) {
      armR.current.rotation.z = raise + 0.1;
      armR.current.rotation.x = 0.2 + swing * Math.sin(phase + Math.PI) * 0.9;
    }

    const spread = limb.legSpread * 0.22;
    const stepL = Math.max(0, Math.sin(phase)) * limb.legLift;
    const stepR = Math.max(0, -Math.sin(phase)) * limb.legLift;
    if (footL.current) {
      footL.current.position.x = -0.26 - spread;
      footL.current.position.y = stepL * 0.14;
      footL.current.rotation.x = stepL * 0.5;
    }
    if (footR.current) {
      footR.current.position.x = 0.26 + spread;
      footR.current.position.y = stepR * 0.14;
      footR.current.rotation.x = stepR * 0.5;
    }
  });

  return (
    <group ref={root}>
      {/* Tail (striped, curled) */}
      <AxesGroup refObject={tail} position={[0, 1.12, -0.48]}>
        <Orb radius={0.16} color={C.tailA} />
        <Orb position={[-0.14, 0.12, -0.08]} radius={0.14} color={C.tailB} />
        <Orb position={[-0.24, 0.26, -0.06]} radius={0.12} color={C.tailA} />
        <Orb position={[-0.28, 0.4, 0.02]} radius={0.1} color={C.tailB} />
        <Orb position={[-0.24, 0.52, 0.12]} radius={0.08} color={C.tailA} />
      </AxesGroup>

      {/* Legs */}
      <Orb position={[-0.26, 0.5, 0.12]} radius={0.14} color={C.paw} />
      <Orb position={[0.26, 0.5, 0.12]} radius={0.14} color={C.paw} />

      {/* Feet */}
      <AxesGroup refObject={footL} position={[-0.26, 0.15, 0.28]}>
        <Orb radius={0.16} color={C.paw} scale={[0.7, 0.42, 1]} />
        <Orb position={[0, 0.04, 0.16]} radius={0.035} color={C.paw} />
      </AxesGroup>
      <AxesGroup refObject={footR} position={[0.26, 0.15, 0.28]}>
        <Orb radius={0.16} color={C.paw} scale={[0.7, 0.42, 1]} />
        <Orb position={[0, 0.04, 0.16]} radius={0.035} color={C.paw} />
      </AxesGroup>

      {/* Body */}
      <Orb position={[0, 1.05, 0]} radius={0.5} color={C.fur} scale={[1.02, 1.02, 0.85]} />
      <Orb position={[0, 1.1, 0.32]} radius={0.42} color={C.light} scale={[0.68, 0.92, 0.4]} />

      {/* Arms */}
      <AxesGroup refObject={armL} position={[-0.6, 1.12, 0.12]}>
        <Orb position={[0, -0.14, 0]} radius={0.13} color={C.fur} />
        <Orb position={[0, -0.3, 0.02]} radius={0.11} color={C.paw} />
      </AxesGroup>
      <AxesGroup refObject={armR} position={[0.6, 1.12, 0.12]}>
        <Orb position={[0, -0.14, 0]} radius={0.13} color={C.fur} />
        <Orb position={[0, -0.3, 0.02]} radius={0.11} color={C.paw} />
      </AxesGroup>

      {/* Head */}
      <Orb position={[0, 1.78, 0.05]} radius={0.48} color={C.fur} scale={[1, 0.96, 0.94]} />

      {/* Ears */}
      <Orb position={[-0.32, 2.26, 0.05]} radius={0.13} color={C.fur} />
      <Orb position={[-0.32, 2.26, 0.13]} radius={0.07} color={C.ear} />
      <Orb position={[0.32, 2.26, 0.05]} radius={0.13} color={C.fur} />
      <Orb position={[0.32, 2.26, 0.13]} radius={0.07} color={C.ear} />

      {/* Raccoon mask */}
      <Orb position={[-0.3, 1.96, 0.16]} radius={0.2} color={C.mask} scale={[0.44, 0.32, 0.22]} />
      <Orb position={[0.3, 1.96, 0.16]} radius={0.2} color={C.mask} scale={[0.44, 0.32, 0.22]} />
      <Orb position={[-0.3, 2.08, 0.14]} radius={0.05} color={C.light} />
      <Orb position={[0.3, 2.08, 0.14]} radius={0.05} color={C.light} />

      {/* Eyes */}
      <Orb position={[-0.3, 1.95, 0.34]} radius={0.065} color="#ffffff" />
      <Orb position={[0.3, 1.95, 0.34]} radius={0.065} color="#ffffff" />
      <Orb position={[-0.3, 1.96, 0.4]} radius={0.032} color={C.dark} />
      <Orb position={[0.3, 1.96, 0.4]} radius={0.032} color={C.dark} />
      <Orb position={[-0.28, 1.98, 0.43]} radius={0.011} color="#ffffff" />
      <Orb position={[0.32, 1.98, 0.43]} radius={0.011} color="#ffffff" />

      {/* Muzzle + nose */}
      <Orb position={[0, 1.6, 0.28]} radius={0.22} color={C.light} scale={[0.85, 0.6, 0.55]} />
      <Orb position={[0, 1.7, 0.46]} radius={0.09} color={C.dark} scale={[0.9, 0.72, 0.9]} />

      {/* Whiskers */}
      <Cone position={[-0.18, 1.58, 0.42]} radius={0.012} height={0.2} color={C.light} rotation={[0, 0, 0.55]} />
      <Cone position={[-0.26, 1.54, 0.38]} radius={0.012} height={0.2} color={C.light} rotation={[0, 0, 0.35]} />
      <Cone position={[0.18, 1.58, 0.42]} radius={0.012} height={0.2} color={C.light} rotation={[0, 0, -0.55]} />
      <Cone position={[0.26, 1.54, 0.38]} radius={0.012} height={0.2} color={C.light} rotation={[0, 0, -0.35]} />
    </group>
  );
}
