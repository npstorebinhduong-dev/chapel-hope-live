import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@chapel/shared";
import { Box, stone, lightStone, wood, gold } from "./ScenePrimitives";
export function Altar() {
  return (
    <group>
      <group position={[-3.3, 0.4, -11]}>
        <Box p={[0, 0.65, 0]} s={[0.55, 1.3, 0.55]} c="#7e6343" />
        <Box
          p={[0, 1.4, 0]}
          s={[1, 0.14, 0.85]}
          c="#60432c"
          rotation={[0.18, 0, 0]}
        />
        <Box p={[0, 0.8, 0.3]} s={[0.05, 0.42, 0.025]} c={gold} />
        <Box p={[0, 0.88, 0.3]} s={[0.22, 0.045, 0.025]} c={gold} />
      </group>
      {[-1, 1].map((side) => (
        <group key={side}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[side * (3.5 + i * 0.6), 0.72, -10.05]}>
              <cylinderGeometry args={[0.07, 0.11, 1.1, 12]} />
              <meshStandardMaterial color="#cabb9c" />
            </mesh>
          ))}
          <Box
            p={[side * 4.1, 1.3, -10.05]}
            s={[1.9, 0.12, 0.22]}
            c={lightStone}
          />
        </group>
      ))}
      <mesh position={[0, 1.8, -10.65]}>
        <planeGeometry args={[3.7, 0.6, 40, 8]} />
        <meshStandardMaterial
          color="#f1e7d2"
          roughness={0.97}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          p={[0, 0.12 + i * 0.15, -11.5 - i * 0.25]}
          s={[9 - i * 1.1, 0.24 + i * 0.15, 3 - i * 0.35]}
          c={lightStone}
        />
      ))}
      <Box p={[0, 1.2, -11.5]} s={[3.5, 1.5, 1.1]} c="#a7987d" />
      <Box p={[0, 2, -11.5]} s={[4.3, 0.22, 1.6]} c="#e1d4b6" />
      <Box p={[0, 1.75, -10.68]} s={[3.65, 0.7, 0.025]} c="#e8dcc3" />
      <Box p={[0, 1.6, -10.65]} s={[0.07, 0.35, 0.035]} c={gold} />
      <Box p={[0, 1.65, -10.64]} s={[0.25, 0.055, 0.035]} c={gold} />
      <Box p={[0, 3.9, -12.7]} s={[0.16, 2.6, 0.18]} c={gold} />
      <Box p={[0, 4.35, -12.7]} s={[1.25, 0.16, 0.18]} c={gold} />
      {[-1.7, 1.7].map((x) => (
        <group key={x} position={[x, 2.2, -11.5]}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.1, 0.4, 8]} />
            <meshStandardMaterial color={gold} />
          </mesh>
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.4, 8]} />
            <meshStandardMaterial color="#e9d9b8" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#ffe2a2" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
