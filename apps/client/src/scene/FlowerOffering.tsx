import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import { Box, lightStone, gold } from "./ScenePrimitives";
import { useSession, renderClock } from "../store";
export function FlowerOffering() {
  const roses = useSession((s) => s.snapshot?.roses ?? 0);
  const petals = useRef<T.InstancedMesh>(null!),
    stems = useRef<T.InstancedMesh>(null!),
    leaves = useRef<T.InstancedMesh>(null!);
  const dummy = useMemo(() => new T.Object3D(), []);
  const vase = useMemo(
    () =>
      new T.LatheGeometry(
        [
          new T.Vector2(0.18, 0),
          new T.Vector2(0.22, 0.05),
          new T.Vector2(0.3, 0.28),
          new T.Vector2(0.16, 0.6),
          new T.Vector2(0.2, 0.7),
        ],
        24,
      ),
    [],
  );
  useFrame(() => {
    const count = 12 + Math.min(48, roses),
      t = renderClock() / 1000;
    const active = useSession.getState().snapshot?.active;
    const bloom =
      active?.event.giftKey === "rose_5"
        ? Math.min(1, 0.2 + Math.max(0, renderClock() - active.startedAt) / 900)
        : 1;
    let pi = 0,
      li = 0;
    for (let i = 0; i < count; i++) {
      const bouquet = i % 3,
        ring = Math.floor(i / 3),
        angle = ring * 2.399;
      const x = 3.4 + bouquet * 0.78 + Math.cos(angle) * (0.08 + ring * 0.009),
        z = -9.2 + Math.sin(angle) * (0.08 + ring * 0.009),
        y = 1.8 + (ring % 5) * 0.055;
      dummy.position.set(x, y - 0.24, z);
      dummy.scale.set(0.012, 0.5, 0.012);
      dummy.rotation.set(0.12 * Math.sin(angle), 0, 0.12 * Math.cos(angle));
      dummy.updateMatrix();
      stems.current.setMatrixAt(i, dummy.matrix);
      for (let j = 0; j < 10; j++) {
        const a = j * 2.399,
          rad = 0.025 + (j / 10) * 0.07;
        dummy.position.set(
          x + Math.cos(a) * rad,
          y + Math.sin(t * 0.4 + i) * 0.003 + (j % 3) * 0.012,
          z + Math.sin(a) * rad,
        );
        dummy.rotation.set(0.9 * Math.cos(a), a, 0.7 * Math.sin(a));
        dummy.scale.set(0.055, 0.022, 0.075);
        if (i === count - 1) dummy.scale.multiplyScalar(bloom);
        dummy.updateMatrix();
        petals.current.setMatrixAt(pi, dummy.matrix);
        petals.current.setColorAt(
          pi++,
          new T.Color(i % 4 === 0 ? "#c88f92" : "#f2e9d7"),
        );
      }
      for (let j = 0; j < 2; j++) {
        dummy.position.set(x + (j ? -0.06 : 0.06), y - 0.17 - j * 0.08, z);
        dummy.rotation.set(0.4, angle + j * 2, 0.6);
        dummy.scale.set(0.04, 0.01, 0.09);
        dummy.updateMatrix();
        leaves.current.setMatrixAt(li++, dummy.matrix);
      }
    }
    stems.current.count = count;
    petals.current.count = pi;
    leaves.current.count = li;
    for (const mesh of [stems.current, petals.current, leaves.current])
      mesh.instanceMatrix.needsUpdate = true;
    if (petals.current.instanceColor)
      petals.current.instanceColor.needsUpdate = true;
  });
  return (
    <group>
      <Box p={[4.2, 0.55, -9.2]} s={[2.65, 1.1, 1.05]} c={lightStone} />
      <Box p={[4.2, 1.14, -9.2]} s={[2.85, 0.12, 1.2]} c="#e2d4b6" />
      {[3.4, 4.18, 4.96].map((x) => (
        <mesh key={x} geometry={vase} position={[x, 1.2, -9.2]} scale={0.72}>
          <meshStandardMaterial
            color="#ddd5c5"
            metalness={0.12}
            roughness={0.32}
          />
        </mesh>
      ))}
      <instancedMesh
        frustumCulled={false}
        ref={stems}
        args={[undefined, undefined, 60]}
      >
        <cylinderGeometry args={[1, 1, 1, 5]} />
        <meshStandardMaterial color="#416344" />
      </instancedMesh>
      <instancedMesh
        frustumCulled={false}
        ref={petals}
        args={[undefined, undefined, 600]}
      >
        <sphereGeometry args={[1, 8, 5]} />
        <meshStandardMaterial roughness={0.76} side={T.DoubleSide} />
      </instancedMesh>
      <instancedMesh
        frustumCulled={false}
        ref={leaves}
        args={[undefined, undefined, 120]}
      >
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial color="#4a6945" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
