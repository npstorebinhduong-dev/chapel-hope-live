import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as T from "three";
import { Box, gold } from "./ScenePrimitives";
import { useSession, renderClock } from "../store";
import { useQuality } from "../quality";
export const CANDLE_CAPACITY = 64;
export function CandleStation() {
  const halos = useRef<T.InstancedMesh>(null!);
  const texture = useMemo(() => {
    const data = new Uint8Array(32 * 32 * 4);
    for (let y = 0; y < 32; y++)
      for (let x = 0; x < 32; x++) {
        const i = (y * 32 + x) * 4,
          d = Math.hypot(x - 15.5, y - 15.5) / 15.5;
        data[i] = 255;
        data[i + 1] = 164;
        data[i + 2] = 70;
        data[i + 3] = Math.round(Math.max(0, 1 - d) ** 3 * 125);
      }
    const tex = new T.DataTexture(data, 32, 32);
    tex.needsUpdate = true;
    return tex;
  }, []);
  const flames = useRef<T.InstancedMesh>(null!),
    smoke = useRef<T.InstancedMesh>(null!),
    light = useRef<T.PointLight>(null!);
  const dummy = useMemo(() => new T.Object3D(), []);
  const low = useQuality((s) => s.level === "low");
  const candles = useSession((s) => s.snapshot?.candles ?? 0);
  const active = useSession((s) => s.snapshot?.active);
  const points = useMemo(
    () =>
      Array.from(
        { length: 64 },
        (_, i) =>
          new T.Vector3(
            -5.25 + (i % 8) * 0.3,
            1.18 + Math.floor(i / 8) * 0.14,
            -8.55 - Math.floor(i / 8) * 0.18,
          ),
      ),
    [],
  );
  useFrame((state, delta) => {
    const now = renderClock() / 1000,
      lit = Math.min(64, 18 + candles);
    const relit =
      active?.event.giftKey === "candle_1"
        ? candles >= 46
          ? [...active.event.eventId].reduce(
              (n, c) => (n * 31 + c.charCodeAt(0)) >>> 0,
              0,
            ) % 64
          : lit - 1
        : -1;
    const ignition = active
      ? Math.min(1, 0.35 + Math.max(0, renderClock() - active.startedAt) / 700)
      : 1;
    for (let i = 0; i < lit; i++) {
      const p = points[i],
        h = 0.19 + (i % 3) * 0.055;
      dummy.position.set(
        p.x + Math.sin(now * 1.7 + i) * 0.006,
        p.y + h + 0.03,
        p.z,
      );
      dummy.rotation.set(0, 0, Math.sin(now * 1.1 + i) * 0.08);
      dummy.scale.set(0.035, 0.09 + Math.sin(now * 2.3 + i) * 0.008, 0.035);
      if (i === relit) dummy.scale.multiplyScalar(ignition);
      dummy.updateMatrix();
      flames.current.setMatrixAt(i, dummy.matrix);
      dummy.lookAt(state.camera.position);
      dummy.scale.setScalar(0.22);
      dummy.updateMatrix();
      halos.current.setMatrixAt(i, dummy.matrix);
    }
    halos.current.count = lit;
    halos.current.instanceMatrix.needsUpdate = true;
    flames.current.count = lit;
    flames.current.instanceMatrix.needsUpdate = true;
    const n = low ? 3 : 8;
    for (let i = 0; i < n; i++) {
      const p = points[i * 3],
        phase = (now * 0.12 + i * 0.17) % 1;
      dummy.position.set(
        p.x + Math.sin(now * 0.3 + i) * phase * 0.15,
        p.y + 0.3 + phase * 0.7,
        p.z,
      );
      dummy.scale.setScalar(0.018 + phase * 0.05);
      dummy.updateMatrix();
      smoke.current.setMatrixAt(i, dummy.matrix);
    }
    smoke.current.count = n;
    smoke.current.instanceMatrix.needsUpdate = true;
    const ceremony = active?.event.giftKey === "ceremony_500";
    light.current.intensity = T.MathUtils.damp(
      light.current.intensity,
      ceremony ? 22 : 12,
      2,
      delta,
    );
  });
  return (
    <group>
      {[-5.3, -3.1].map((x) => (
        <group key={x}>
          <Box p={[x, 0.56, -9.2]} s={[0.075, 1.12, 0.075]} c="#2e302c" />
          <Box p={[x, 0.1, -9.2]} s={[0.5, 0.12, 0.8]} c="#363631" />
        </group>
      ))}
      {Array.from({ length: 8 }, (_, row) => (
        <Box
          key={row}
          p={[-4.2, 1.03 + row * 0.14, -8.55 - row * 0.18]}
          s={[2.65, 0.08, 0.2]}
          c="#514737"
        />
      ))}
      {points.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, -0.04, 0]}>
            <cylinderGeometry args={[0.075, 0.065, 0.07, 12]} />
            <meshStandardMaterial
              color="#aa8751"
              metalness={0.65}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, (0.19 + (i % 3) * 0.055) / 2, 0]}>
            <cylinderGeometry
              args={[0.044, 0.049, 0.19 + (i % 3) * 0.055, 10]}
            />
            <meshStandardMaterial
              color={i < 18 + candles ? "#f0ddb0" : "#bdad8a"}
              roughness={0.75}
            />
          </mesh>
          <mesh position={[0, 0.2 + (i % 3) * 0.055, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.035, 4]} />
            <meshBasicMaterial color="#453425" />
          </mesh>
        </group>
      ))}
      <instancedMesh
        frustumCulled={false}
        ref={halos}
        args={[undefined, undefined, 64]}
      >
        <planeGeometry />
        <meshBasicMaterial
          map={texture}
          transparent
          depthWrite={false}
          blending={T.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh
        frustumCulled={false}
        ref={flames}
        args={[undefined, undefined, 64]}
      >
        <sphereGeometry args={[1, 7, 6]} />
        <meshBasicMaterial color="#ffcf76" toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        frustumCulled={false}
        ref={smoke}
        args={[undefined, undefined, 8]}
      >
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial
          color="#b0a49a"
          transparent
          opacity={0.075}
          depthWrite={false}
        />
      </instancedMesh>
      <pointLight
        ref={light}
        position={[-4.2, 2, -9]}
        color="#ffc375"
        distance={7}
        decay={2}
      />
    </group>
  );
}
