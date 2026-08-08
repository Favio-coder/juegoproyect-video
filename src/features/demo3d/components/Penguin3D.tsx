import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export default function Penguin3D() {
  const group = useRef<Group>(null);
  const wingL = useRef<Group>(null);
  const wingR = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = Math.sin(t * 2) * 0.05;
      group.current.rotation.z = Math.sin(t * 1.2) * 0.04;
    }
    if (wingL.current) {
      wingL.current.rotation.x = Math.sin(t * 3) * 0.2 + 0.1;
    }
    if (wingR.current) {
      wingR.current.rotation.x = -Math.sin(t * 3) * 0.2 - 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Body */}
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.62, 48, 48]} />
          <meshStandardMaterial color="#1f2937" roughness={0.6} />
        </mesh>

        {/* White belly */}
        <mesh position={[0, 1.05, 0.42]} scale={[1, 1.15, 0.7]}>
          <sphereGeometry args={[0.44, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.85, 0]}>
          <sphereGeometry args={[0.42, 48, 48]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>

        {/* Face patch */}
        <mesh position={[0, 1.72, 0.26]} scale={[1, 0.85, 0.5]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>

        {/* Left wing */}
        <group ref={wingL} position={[-0.7, 1.1, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2.4]} scale={[1, 0.45, 1]}>
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.6} />
          </mesh>
        </group>

        {/* Right wing */}
        <group ref={wingR} position={[0.7, 1.1, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2.4]} scale={[1, 0.45, 1]} >
            <sphereGeometry args={[0.3, 24, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.6} />
          </mesh>
        </group>

        {/* Eyes */}
        <mesh position={[-0.16, 1.92, 0.34]}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.16, 1.92, 0.34]}>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[-0.16, 1.93, 0.42]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.2} />
        </mesh>
        <mesh position={[0.16, 1.93, 0.42]}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.2} />
        </mesh>

        {/* Beak */}
        <group position={[0, 1.78, 0.4]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.13, 0.28, 20]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
        </group>

        {/* Feet */}
        <mesh position={[-0.22, 0.28, 0.28]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
        <mesh position={[0.22, 0.28, 0.28]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.35]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.5} />
        </mesh>
    </group>
  );
}