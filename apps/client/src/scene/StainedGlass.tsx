import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@chapel/shared";
import { Box, stone, lightStone, wood, gold } from "./ScenePrimitives";
export function StainedGlass({ p, side = false }: { p: Vec3; side?: boolean }) {
  const colors = [
    "#b67b3e",
    "#365c78",
    "#9d4035",
    "#cf9d58",
    "#416d77",
    "#926a8e",
  ];
  return (
    <group
      position={p}
      rotation={[0, side ? (p[0] < 0 ? Math.PI / 2 : -Math.PI / 2) : 0, 0]}
    >
      <Box p={[0, 0, 0]} s={[2.25, 4.45, 0.15]} c={"#4a4137"} />
      {[-1, 0, 1].map((col) => (
        <group key={col}>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <mesh key={row} position={[col * 0.62, (row - 2.5) * 0.61, 0.1]}>
              <planeGeometry args={[0.54, 0.54]} />
              <meshStandardMaterial
                color={colors[(row + col + 6) % 6]}
                emissive={colors[(row + col + 6) % 6]}
                emissiveIntensity={0.7}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      {[-1.05, -0.33, 0.33, 1.05].map((x) => (
        <Box key={x} p={[x, 0, 0.15]} s={[0.07, 4.4, 0.12]} c={gold} />
      ))}
      {[-2.15, 0, 2.15].map((y) => (
        <Box key={y} p={[0, y, 0.15]} s={[2.3, 0.08, 0.12]} c={gold} />
      ))}
    </group>
  );
}
export function RoseWindow() {
  return (
    <group position={[0, 6.9, -13.15]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2.45, 2.45, 0.18, 48]} />
        <meshStandardMaterial color={lightStone} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <circleGeometry args={[2.2, 48]} />
        <meshStandardMaterial
          color="#102b37"
          emissive="#245061"
          emissiveIntensity={0.55}
        />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 1.35, 0.16]} scale={[0.43, 0.83, 1]}>
              <circleGeometry args={[1, 12]} />
              <meshStandardMaterial
                color={i % 2 ? "#cc9751" : "#6993a1"}
                emissive={i % 2 ? "#ba762d" : "#356785"}
                emissiveIntensity={0.7}
              />
            </mesh>
            <Box p={[0, 1.32, 0.21]} s={[0.035, 1.9, 0.06]} c={gold} />
          </group>
        );
      })}
      {[0.52, 2.24].map((r) => (
        <mesh key={r} position={[0, 0, 0.24]}>
          <torusGeometry args={[r, 0.075, 6, 64]} />
          <meshStandardMaterial color={gold} metalness={0.45} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.22]}>
        <circleGeometry args={[0.43, 16]} />
        <meshStandardMaterial
          color="#eedbb0"
          emissive="#edb75b"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
}
