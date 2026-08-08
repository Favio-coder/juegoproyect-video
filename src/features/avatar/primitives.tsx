import type { ReactNode, RefObject } from "react";
import type { Group } from "three";

export type Vec3 = [number, number, number];

interface OrbProps {
  position?: Vec3;
  radius?: number;
  color: string;
  scale?: number | Vec3;
  rotation?: Vec3;
}

export function Orb({
  position = [0, 0, 0],
  radius = 0.1,
  color,
  scale,
  rotation,
}: OrbProps) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[radius, 28, 28]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

interface ConeProps {
  position?: Vec3;
  radius?: number;
  height?: number;
  color: string;
  rotation?: Vec3;
  scale?: number | Vec3;
}

export function Cone({
  position = [0, 0, 0],
  radius = 0.1,
  height = 0.2,
  color,
  rotation,
  scale,
}: ConeProps) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <coneGeometry args={[radius, height, 20]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

interface AxesGroupProps {
  refObject: RefObject<Group | null>;
  position?: Vec3;
  rotation?: Vec3;
  children: ReactNode;
}

export function AxesGroup({
  refObject,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children,
}: AxesGroupProps) {
  return (
    <group ref={refObject} position={position} rotation={rotation}>
      {children}
    </group>
  );
}
