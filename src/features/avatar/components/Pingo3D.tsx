import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { AvatarMotion } from "../types";
import { limbTargets } from "../utils/limbTargets";
import { Orb, Cone, AxesGroup } from "../primitives";

const C = {
  back: "#223044",
  dark: "#16202f",
  belly: "#f4f7fb",
  beak: "#f59e0b",
  beakTip: "#d97706",
};

export default function Pingo3D({ motion }: { motion: AvatarMotion }) {
  const root = useRef<Group>(null);
  const wingL = useRef<Group>(null);
  const wingR = useRef<Group>(null);
  const footL = useRef<Group>(null);
  const footR = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const limb = limbTargets(motion, t);
    const phase = t * limb.speed;

    if (root.current) {
      const breathe = 1 + Math.sin(t * 2.1) * 0.015;
      root.current.scale.setScalar(breathe);
    }

    const raise = limb.armRaise * 0.72 + limb.flap * 0.4;
    const swing = limb.armSwing;
    if (wingL.current) {
      wingL.current.rotation.z = -raise - 0.12;
      wingL.current.rotation.x = 0.2 + swing * Math.sin(phase) * 0.9;
    }
    if (wingR.current) {
      wingR.current.rotation.z = raise + 0.12;
      wingR.current.rotation.x = 0.2 + swing * Math.sin(phase + Math.PI) * 0.9;
    }

    const spread = limb.legSpread * 0.18;
    const stepL = Math.max(0, Math.sin(phase)) * limb.legLift;
    const stepR = Math.max(0, -Math.sin(phase)) * limb.legLift;
    if (footL.current) {
      footL.current.position.x = -0.21 - spread;
      footL.current.position.y = stepL * 0.14;
      footL.current.rotation.x = stepL * 0.5;
    }
    if (footR.current) {
      footR.current.position.x = 0.21 + spread;
      footR.current.position.y = stepR * 0.14;
      footR.current.rotation.x = stepR * 0.5;
    }
  });

  return (
    <group ref={root}>
      {/* Tail */}
      <Orb position={[0, 0.88, -0.4]} radius={0.14} color={C.back} scale={[0.9, 0.55, 0.8]} />

      {/* Legs */}
      <Orb position={[-0.26, 0.45, 0.16]} radius={0.11} color={C.back} />
      <Orb position={[0.26, 0.45, 0.16]} radius={0.11} color={C.back} />

      {/* Feet */}
      <AxesGroup refObject={footL} position={[-0.21, 0.16, 0.3]}>
        <Orb radius={0.14} color={C.beak} scale={[1, 0.7, 1.2]} />
      </AxesGroup>
      <AxesGroup refObject={footR} position={[0.21, 0.16, 0.3]}>
        <Orb radius={0.14} color={C.beak} scale={[1, 0.7, 1.2]} />
      </AxesGroup>

      {/* Body */}
      <Orb position={[0, 1.0, 0]} radius={0.42} color={C.back} scale={[0.95, 1.18, 0.88]} />
      <Orb position={[0, 1.0, 0.27]} radius={0.36} color={C.belly} scale={[0.95, 1.12, 0.5]} />

      {/* Wings */}
      <AxesGroup refObject={wingL} position={[-0.42, 1.05, 0.06]}>
        <Orb position={[0, -0.2, -0.02]} radius={0.09} color={C.dark} scale={[0.62, 1.25, 0.75]} />
        <Orb position={[0, -0.36, 0]} radius={0.055} color={C.dark} />
      </AxesGroup>
      <AxesGroup refObject={wingR} position={[0.42, 1.05, 0.06]}>
        <Orb position={[0, -0.2, -0.02]} radius={0.09} color={C.dark} scale={[0.62, 1.25, 0.75]} />
        <Orb position={[0, -0.36, 0]} radius={0.055} color={C.dark} />
      </AxesGroup>

      {/* Head */}
      <Orb position={[0, 1.62, 0.03]} radius={0.33} color={C.dark} />

      {/* Face */}
      <Orb position={[0, 1.53, 0.27]} radius={0.26} color={C.belly} scale={[1.25, 0.92, 0.55]} />

      {/* Eyes */}
      <Orb position={[-0.14, 1.7, 0.38]} radius={0.065} color="#ffffff" />
      <Orb position={[0.14, 1.7, 0.38]} radius={0.065} color="#ffffff" />
      <Orb position={[-0.14, 1.71, 0.44]} radius={0.032} color={C.dark} />
      <Orb position={[0.14, 1.71, 0.44]} radius={0.032} color={C.dark} />
      <Orb position={[-0.12, 1.73, 0.47]} radius={0.011} color="#ffffff" />
      <Orb position={[0.16, 1.73, 0.47]} radius={0.011} color="#ffffff" />

      {/* Beak */}
      <Cone position={[0, 1.53, 0.46]} radius={0.11} height={0.26} color={C.beak} rotation={[Math.PI / 2, 0, 0]} />
      <Orb position={[0, 1.5, 0.56]} radius={0.055} color={C.beakTip} scale={[1, 0.8, 0.6]} />
    </group>
  );
}
