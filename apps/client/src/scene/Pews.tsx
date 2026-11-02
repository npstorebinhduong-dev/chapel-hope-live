import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@chapel/shared";
import { Box, stone, lightStone, wood, gold } from "./ScenePrimitives";
export function Pews() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, row) =>
        [-1, 1].map((side) => {
          const z = -6.8 + row * 1.7;
          return (
            <group key={`${row}-${side}`} position={[side * 3.3, 0, z]}>
              <Box p={[0, 0.65, 0]} s={[3.7, 0.17, 0.64]} c="#563825" />
              <Box p={[0, 1.0, 0.3]} s={[3.7, 0.58, 0.13]} c={wood} />
              <Box p={[0, 1.32, 0.3]} s={[3.8, 0.1, 0.2]} c="#69492d" />
              {[-1.85, 1.85].map((x) => (
                <group key={x}>
                  <Box p={[x, 0.78, 0.05]} s={[0.16, 1.5, 0.9]} c={wood} />
                  <mesh position={[x, 1.6, 0.3]}>
                    <sphereGeometry args={[0.13, 8, 8]} />
                    <meshStandardMaterial color={wood} />
                  </mesh>
                </group>
              ))}
              {[-1.3, 1.3].map((x) => (
                <Box key={x} p={[x, 0.28, 0]} s={[0.16, 0.56, 0.55]} c={wood} />
              ))}
              <Box p={[0, 0.2, -0.65]} s={[3.4, 0.11, 0.26]} c="#744c36" />
            </group>
          );
        }),
      )}
    </group>
  );
}
