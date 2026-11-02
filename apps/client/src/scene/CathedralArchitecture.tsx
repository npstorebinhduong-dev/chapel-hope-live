import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vec3 } from "@chapel/shared";
import { Box, stone, lightStone, wood, gold } from "./ScenePrimitives";
import { Pews } from "./Pews";
import { Altar } from "./Altar";
import { StainedGlass, RoseWindow } from "./StainedGlass";
import { Vault } from "./Vault";
function Column({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Box p={[0, 0.22, 0]} s={[0.8, 0.44, 0.8]} c={lightStone} />
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.29, 0.4, 8, 10]} />
        <meshStandardMaterial color={stone} roughness={0.9} />
      </mesh>
      {[-0.24, 0.24].map((d, i) => (
        <mesh key={i} position={[d, 4.1, -0.2]}>
          <cylinderGeometry args={[0.095, 0.095, 7.5, 6]} />
          <meshStandardMaterial color={lightStone} />
        </mesh>
      ))}
      <Box p={[0, 8.2, 0]} s={[0.85, 0.35, 0.85]} c={lightStone} />
    </group>
  );
}
function Rib({ z }: { z: number }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-6.9, 7.5, z),
        new THREE.Vector3(-4.4, 9.2, z),
        new THREE.Vector3(0, 11, z),
        new THREE.Vector3(4.4, 9.2, z),
        new THREE.Vector3(6.9, 7.5, z),
      ]),
    [z],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, 32, 0.12, 6, false]} />
      <meshStandardMaterial color={lightStone} />
    </mesh>
  );
}
function Floor() {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useEffect(() => {
    const dummy = new THREE.Object3D(),
      color = new THREE.Color();
    let i = 0;
    for (let x = -7; x < 7; x++)
      for (let z = -14; z < 18; z++) {
        dummy.position.set(x + 0.5, -0.055, z + 0.5);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i, dummy.matrix);
        color.set((x + z) % 2 === 0 ? "#9b8e79" : "#6c665b");
        ref.current.setColorAt(i++, color);
      }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <>
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[15.3, 0.2, 36]} />
        <meshStandardMaterial color="#6c6251" />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, 448]} receiveShadow>
        <boxGeometry args={[0.97, 0.08, 0.97]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>
      <Box p={[0, 0.01, 1]} s={[2.05, 0.035, 26]} c="#6b2528" />
      {[-0.94, 0.94].map((x) => (
        <Box key={x} p={[x, 0.035, 1]} s={[0.035, 0.01, 26]} c="#b59459" />
      ))}
    </>
  );
}
function Chandelier({ z }: { z: number }) {
  return (
    <group position={[0, 8.6, z]}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 5, 6]} />
        <meshStandardMaterial color={gold} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.045, 6, 32]} />
        <meshStandardMaterial color={gold} metalness={0.6} roughness={0.3} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <group key={i} position={[Math.cos(a) * 1.2, 0, Math.sin(a) * 1.2]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.4, 6]} />
              <meshStandardMaterial color="#f1dfba" />
            </mesh>
            <mesh position={[0, 0.46, 0]} scale={[1, 1.9, 1]}>
              <sphereGeometry args={[0.065, 6, 6]} />
              <meshBasicMaterial color="#ffe1a1" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
export function CathedralArchitecture() {
  return (
    <group>
      <Floor />
      <Pews />
      <Altar />

      <Box p={[0, 5, -13.5]} s={[15.3, 11, 0.5]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box p={[side * 7.4, 5, 0]} s={[0.5, 11, 28]} />
          {[-10, -5, 0, 5, 10].map((z) => (
            <Column key={z} x={side * 6.9} z={z} />
          ))}
          {[-9, -3, 3, 9].map((z) => (
            <StainedGlass key={z} p={[side * 7.08, 5.3, z]} side />
          ))}
          <Box p={[side * 7.0, 2.3, 0]} s={[0.3, 0.2, 28]} c={lightStone} />
          <Box p={[side * 7.0, 0.4, 0]} s={[0.4, 0.8, 28]} c="#8d7a62" />
        </group>
      ))}
      {[-10, -5, 0, 5, 10].map((z) => (
        <Rib key={z} z={z} />
      ))}
      <Vault />
      <Box p={[0, 10.95, 0]} s={[0.15, 0.16, 28]} c={lightStone} />
      {[-3.8, 3.8].map((x) => (
        <group key={x}>
          <Box p={[x, 4.4, -13.12]} s={[0.34, 8.8, 0.23]} c={lightStone} />
          <Box p={[x, 3, -12.95]} s={[0.62, 0.13, 0.35]} c={gold} />
        </group>
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <Box
          key={i}
          p={[0, 0.45 + i * 0.88, -13.225]}
          s={[12.5, 0.018, 0.012]}
          c="#8e7d65"
        />
      ))}
      <RoseWindow />
      <Chandelier z={-5} />
      <Chandelier z={5} />
    </group>
  );
}
